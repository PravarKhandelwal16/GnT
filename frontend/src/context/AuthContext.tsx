import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiClient, clearToken, readToken, storeToken } from '../api/client';
import { getMyProfile } from '../api/profile';
import type { UserProfile } from '../api/profile';
import { initials } from '../lib/format';

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
  role: 'USER' | 'MODERATOR' | 'ADMIN';
}

export interface SignupFields {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  dateOfBirth: string;
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

function toAuthUser(profile: UserProfile): AuthUser {
  return {
    id: profile.id,
    name: profile.name,
    shortName: profile.name.split(' ')[0] ?? profile.name,
    email: profile.email,
    initials: initials(profile.name),
    creditBalance: profile.creditBalance,
    rating: profile.rating,
    profileImage: profile.profileImage,
    hasSeenWelcome: profile.hasSeenWelcome,
    role: profile.role ?? 'USER',
  };
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const useAuth = (): AuthContextValue => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    if (!readToken()) {
      setIsLoading(false);
    } else {
      getMyProfile()
        .then((profile) => setUser(toAuthUser(profile)))
        .catch(() => {
          // A network failure keeps the token so the next visit can restore the session.
        })
        .finally(() => setIsLoading(false));
    }

    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      setUser(toAuthUser(await getMyProfile()));
    } catch {
      // Keep the last known state.
    }
  }, []);

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const res = await apiClient.post<{ token: string }>('/api/auth/login', { email, password });
    storeToken(res.data.token, remember);
    setUser(toAuthUser(await getMyProfile()));
  }, []);

  const signup = useCallback(async (fields: SignupFields) => {
    const res = await apiClient.post<{ token: string }>('/api/auth/register', {
      name: fields.fullName,
      email: fields.email,
      phone: fields.mobile,
      password: fields.password,
      dateOfBirth: fields.dateOfBirth,
    });
    storeToken(res.data.token, true);
    setUser(toAuthUser(await getMyProfile()));
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null, isLoading, login, signup, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
