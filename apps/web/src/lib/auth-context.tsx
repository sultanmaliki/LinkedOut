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
  verifyEmail: (token: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
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

  const verifyEmail = useCallback(
    async (token: string) => {
      // Clicking a valid link proves mailbox ownership, so the API returns a
      // fresh session the same way login/register do -- this establishes a
      // session even when the link is opened on a different device/browser
      // than the one that registered, not just when one already exists here.
      const session = await apiFetch<AuthResponse>('/auth/verify-email', {
        method: 'POST',
        body: { token },
      });
      persist(session);
    },
    [persist],
  );

  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      // Same reasoning as verifyEmail: a valid reset link is itself proof of
      // mailbox ownership, so the API logs the user in with a fresh session
      // rather than making them separately sign in with the new password.
      const session = await apiFetch<AuthResponse>('/auth/reset-password', {
        method: 'POST',
        body: { token, newPassword },
      });
      persist(session);
    },
    [persist],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const session = await apiFetch<AuthResponse>('/auth/password', {
        method: 'PATCH',
        token: accessToken,
        body: { currentPassword, newPassword },
      });
      persist(session);
    },
    [accessToken, persist],
  );

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isLoading,
      login,
      register,
      logout: clearSession,
      verifyEmail,
      resetPassword,
      changePassword,
    }),
    [
      user,
      accessToken,
      isLoading,
      login,
      register,
      clearSession,
      verifyEmail,
      resetPassword,
      changePassword,
    ],
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
