'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

interface AuthUser {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

const AUTH_REFRESH_TIMEOUT_MS = 5000;

function clearLegacyPublicCaches() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem('hot100_progress');
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith('leetcode-post-solve-checks-')) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    // localStorage may be disabled. Auth and progress still use the server session.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), AUTH_REFRESH_TIMEOUT_MS);

    try {
      const res = await fetch('/api/auth/me', {
        cache: 'no-store',
        signal: controller.signal,
      });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    clearLegacyPublicCaches();
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.assign('/login');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    clearLegacyPublicCaches();
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
