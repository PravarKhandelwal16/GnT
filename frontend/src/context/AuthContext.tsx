import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient, storeToken, clearToken, TOKEN_KEY } from '../api/client';
import { getMyProfile } from '../api/profile';
import type { UserProfile } from '../api/profile';

/* ─────────────────────── types ─────────────────────── */

export interface AuthUser {
  id: number;
  name: string;
  shortName: string;
  email: string;
  initials: string;
  creditBalance: number;
  rating: number | null;
  profileImage: string | null;
  hasSeenWelcome: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  signup: (fields: SignupFields) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export interface SignupFields {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  dateOfBirth: string; // ISO date string e.g. "1998-06-15"
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

/* ─────────────────────── helpers ─────────────────────── */

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

function profileToAuthUser(profile: UserProfile): AuthUser {
  return {
    id: profile.id,
    name: profile.name,
    shortName: deriveShortName(profile.name),
    email: profile.email,
    initials: deriveInitials(profile.name),
    creditBalance: profile.creditBalance,
    rating: profile.rating,
    profileImage: profile.profileImage,
    hasSeenWelcome: profile.hasSeenWelcome,
  };
}

/* ─────────────────────── context ─────────────────────── */

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const useAuth = (): AuthContextValue => useContext(AuthContext);

/* ─────────────────────── provider ─────────────────────── */

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* Restore session on mount */
  useEffect(() => {
    const handleUnauthorized = () => {
      clearToken();
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    const token =
      localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
    } else {
      // Token exists — validate by fetching profile
      getMyProfile()
        .then((profile) => setUser(profileToAuthUser(profile)))
        .catch(() => {
          clearToken();
        })
        .finally(() => setIsLoading(false));
    }

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  /* Re-fetch profile and update user state */
  const refreshUser = useCallback(async () => {
    try {
      const profile = await getMyProfile();
      setUser(profileToAuthUser(profile));
    } catch {
      // ignore; user will still see the last-known state
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string, remember: boolean): Promise<void> => {
      const res = await apiClient.post<{ token: string }>('/api/auth/login', {
        email,
        password,
      });
      storeToken(res.data.token, remember);
      const profile = await getMyProfile();
      setUser(profileToAuthUser(profile));
    },
    [],
  );

  const signup = useCallback(async (fields: SignupFields): Promise<void> => {
    const res = await apiClient.post<{ token: string }>('/api/auth/register', {
      name: fields.fullName,
      email: fields.email,
      phone: fields.mobile,
      password: fields.password,
      dateOfBirth: fields.dateOfBirth,
      street: fields.street ?? null,
      city: fields.city ?? null,
      state: fields.state ?? null,
      postalCode: fields.postalCode ?? null,
      country: fields.country ?? null,
    });
    // Always remember on signup
    storeToken(res.data.token, true);
    const profile = await getMyProfile();
    setUser(profileToAuthUser(profile));
  }, []);

  const logout = useCallback(() => {
    clearToken();
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
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
