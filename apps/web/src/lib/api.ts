const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string | null;
  /** Internal: set to skip the refresh-and-retry step (used for the retry itself). */
  _isRetry?: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

let currentTokens: TokenPair | null = null;
let onTokensRefreshed: ((tokens: TokenPair) => void) | null = null;
let onSessionExpired: (() => void) | null = null;

/** Called by AuthProvider whenever the session changes (login, restore, logout). */
export function setAuthTokens(tokens: TokenPair | null): void {
  currentTokens = tokens;
}

/** Called by AuthProvider to learn about a token refreshed transparently inside apiFetch. */
export function setOnTokensRefreshed(callback: (tokens: TokenPair) => void): void {
  onTokensRefreshed = callback;
}

/** Called by AuthProvider when a refresh attempt fails and the session should be cleared. */
export function setOnSessionExpired(callback: () => void): void {
  onSessionExpired = callback;
}

async function rawFetch<T>(
  path: string,
  options: RequestOptions,
  token?: string | null,
): Promise<T> {
  const { method = 'GET', body } = options;

  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const contentType = response.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message ?? response.statusText;
    throw new ApiError(
      response.status,
      Array.isArray(message) ? message.join(', ') : message,
      data,
    );
  }

  return data as T;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  // The freshest known access token wins over whatever the caller passed in,
  // so a silent refresh (below) is actually used on the next call instead of
  // being shadowed by a stale token a component still has in its own state.
  const token = currentTokens?.accessToken ?? options.token;

  try {
    return await rawFetch<T>(path, options, token);
  } catch (err) {
    const isAuthError = err instanceof ApiError && err.status === 401;

    if (!isAuthError || options._isRetry || !currentTokens?.refreshToken) {
      throw err;
    }

    try {
      const refreshed = await rawFetch<TokenPair & { user: unknown }>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken: currentTokens.refreshToken },
      });

      currentTokens = { accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken };
      onTokensRefreshed?.(currentTokens);

      return await apiFetch<T>(path, {
        ...options,
        token: currentTokens.accessToken,
        _isRetry: true,
      });
    } catch {
      currentTokens = null;
      onSessionExpired?.();
      throw err;
    }
  }
}
