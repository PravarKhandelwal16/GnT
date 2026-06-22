import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, X } from 'lucide-react';
import { useAuthModal } from '../context/AuthModalContext';

export const AuthModal: React.FC = () => {
  const { isOpen, close } = useAuthModal();
  const navigate = useNavigate();

  /* Escape key */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  /* Body scroll lock */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const goLogin = () => {
    close();
    navigate('/login');
  };

  const goSignup = () => {
    close();
    navigate('/signup');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        id="auth-modal-backdrop"
        onClick={close}
        aria-hidden="true"
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      />

      {/* Panel */}
      <div
        id="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="relative w-full max-w-sm bg-surface border border-border rounded-2xl shadow-soft pointer-events-auto animate-modal-in">
          {/* Close button */}
          <button
            id="auth-modal-close"
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 p-1.5 rounded-lg text-textMain-secondary hover:text-textMain hover:bg-card transition-all focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <X size={16} />
          </button>

          <div className="px-8 py-8">
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <LogIn size={22} className="text-primary" />
            </div>

            {/* Heading */}
            <h2 id="auth-modal-title" className="text-xl font-bold text-textMain mb-1">
              Login Required
            </h2>
            <p className="text-sm text-textMain-secondary mb-6 leading-relaxed">
              Create a free account or log in to continue using Give &amp; Take.
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                id="auth-modal-login"
                onClick={goLogin}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
              >
                <LogIn size={16} />
                Login
              </button>

              <button
                id="auth-modal-signup"
                onClick={goSignup}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border text-textMain text-sm font-semibold hover:bg-card transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
              >
                <UserPlus size={16} />
                Create Account
              </button>

              <button
                id="auth-modal-later"
                onClick={close}
                className="text-sm text-textMain-secondary hover:text-textMain transition-colors py-1 focus:outline-none focus:underline"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
