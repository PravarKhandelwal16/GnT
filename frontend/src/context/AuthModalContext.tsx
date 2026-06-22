import React, { createContext, useContext, useState, useCallback } from 'react';

/* ─────────────────────── types ─────────────────────── */

interface AuthModalContextValue {
  isOpen: boolean;
  /** Call this before any protected action. Returns true if already authenticated. */
  requireAuth: (onSuccess?: () => void) => boolean;
  close: () => void;
  onSuccess: (() => void) | null;
}

/* ─────────────────────── context ─────────────────────── */

export const AuthModalContext = createContext<AuthModalContextValue>({
  isOpen: false,
  requireAuth: () => true,
  close: () => {},
  onSuccess: null,
});

export const useAuthModal = (): AuthModalContextValue => useContext(AuthModalContext);

/* ─────────────────────── provider ─────────────────────── */

/**
 * Wrap AuthModalProvider *inside* AuthProvider so that requireAuth can
 * read isAuthenticated from useAuth().
 */
export const AuthModalProvider: React.FC<{
  children: React.ReactNode;
  isAuthenticated: boolean;
}> = ({ children, isAuthenticated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const requireAuth = useCallback(
    (onSuccess?: () => void): boolean => {
      if (isAuthenticated) return true;
      setPendingCallback(() => onSuccess ?? null);
      setIsOpen(true);
      return false;
    },
    [isAuthenticated],
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setPendingCallback(null);
  }, []);

  return (
    <AuthModalContext.Provider
      value={{ isOpen, requireAuth, close, onSuccess: pendingCallback }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};
