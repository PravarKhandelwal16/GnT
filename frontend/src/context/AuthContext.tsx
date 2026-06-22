import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/* ─────────────────────── types ─────────────────────── */

export interface AuthUser {
  id: string;
  name: string;
  shortName: string;
  email: string;
  initials: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  signup: (fields: SignupFields) => Promise<void>;
  logout: () => void;
}

export interface SignupFields {
  fullName: string;
  age: string;
  mobile: string;
  email: string;
  address: string;
  password: string;
}

/* ─────────────────────── helpers ─────────────────────── */

const STORAGE_KEY = 'gnt_token';

/** Build a fake JWT-style token string (base64 payload only — no real sig). */
function encodeToken(user: AuthUser): string {
  const payload = btoa(JSON.stringify(user));
  return `mock.${payload}.sig`;
}

function decodeToken(token: string): AuthUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1])) as AuthUser;
  } catch {
    return null;
  }
}

function deriveInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function deriveShortName(name: string): string {
  return name.split(' ')[0] ?? name;
}

/* ─────────────────────── context ─────────────────────── */

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

export const useAuth = (): AuthContextValue => useContext(AuthContext);

/* ─────────────────────── provider ─────────────────────── */

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* Restore session on mount */
  useEffect(() => {
    const token =
      localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
    if (token) {
      const restored = decodeToken(token);
      setUser(restored);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, _password: string, remember: boolean): Promise<void> => {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 800));

      const authUser: AuthUser = {
        id: 'mock-' + Date.now(),
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        shortName: '',
        email,
        initials: '',
      };
      authUser.shortName = deriveShortName(authUser.name);
      authUser.initials = deriveInitials(authUser.name);

      const token = encodeToken(authUser);
      if (remember) {
        localStorage.setItem(STORAGE_KEY, token);
      } else {
        sessionStorage.setItem(STORAGE_KEY, token);
      }
      setUser(authUser);
    },
    [],
  );

  const signup = useCallback(async (fields: SignupFields): Promise<void> => {
    await new Promise((r) => setTimeout(r, 1000));

    const authUser: AuthUser = {
      id: 'mock-' + Date.now(),
      name: fields.fullName,
      shortName: deriveShortName(fields.fullName),
      email: fields.email,
      initials: deriveInitials(fields.fullName),
    };

    const token = encodeToken(authUser);
    localStorage.setItem(STORAGE_KEY, token);
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
