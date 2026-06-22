import React from 'react';
import { useAuthModal } from '../context/AuthModalContext';

interface ProtectedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onProtectedClick?: () => void;
}

/**
 * Drop-in replacement for <button> on any protected action.
 * Guests see the auth modal instead of the action firing.
 *
 * Use `onProtectedClick` instead of `onClick` for the guarded handler.
 * Any additional props (className, aria-*, etc.) pass through transparently.
 */
export const ProtectedButton: React.FC<ProtectedButtonProps> = ({
  children,
  onProtectedClick,
  onClick,
  ...props
}) => {
  const { requireAuth } = useAuthModal();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const authed = requireAuth(onProtectedClick);
    if (authed && onProtectedClick) {
      onProtectedClick();
    }
    if (authed && onClick) {
      onClick(e);
    }
  };

  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  );
};
