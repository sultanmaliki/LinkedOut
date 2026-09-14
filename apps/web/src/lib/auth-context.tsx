'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  apiFetch,
  setAuthTokens,
  setOnSessionExpired,
  setOnTokensRefreshed,
  type TokenPair,
} from './api';
import type { AuthResponse, AuthUser } from './types';

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  markEmailVerified: () => void;
}

interface StoredSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = 'linkedout.session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setAuthTokens(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredSession;
        setUser(parsed.user);
        setAccessToken(parsed.accessToken);
        setAuthTokens({ accessToken: parsed.accessToken, refreshToken: parsed.refreshToken });
      }
    } catch {
      // ignore malformed/absent local session
    } finally {
      setIsLoading(false);
    }
  }, []);

  // A silent refresh inside apiFetch (triggered by any 401) updates the module-level
  // token store directly; mirror that back into React state + localStorage so a page
  // reload and any UI reading accessToken stay in sync with it.
  useEffect(() => {
    setOnTokensRefreshed((tokens: TokenPair) => {
      setAccessToken(tokens.accessToken);
      setUser((prevUser) => {
        if (prevUser) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: prevUser, ...tokens }));
        }
        return prevUser;
      });
    });

    setOnSessionExpired(() => {
      clearSession();
    });
  }, [clearSession]);

  const persist = useCallback((session: AuthResponse) => {
    setUser(session.user);
    setAccessToken(session.accessToken);
    setAuthTokens({ accessToken: session.accessToken, refreshToken: session.refreshToken });
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user: session.user,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      }),
    );
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      persist(session);
    },
    [persist],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const session = await apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: { name, email, password },
      });
      persist(session);
    },
    [persist],
  );

  const markEmailVerified = useCallback(() => {
    setUser((prevUser) => {
      if (!prevUser || prevUser.emailVerified) return prevUser;

      const updated = { ...prevUser, emailVerified: true };

      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as StoredSession;
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, user: updated }));
        }
      } catch {
        // ignore storage failures; in-memory state is still updated
      }

      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isLoading,
      login,
      register,
      logout: clearSession,
      markEmailVerified,
    }),
    [user, accessToken, isLoading, login, register, clearSession, markEmailVerified],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
