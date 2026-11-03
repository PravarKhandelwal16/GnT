import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthModal } from '../context/AuthModalContext';
import { Modal, buttonClasses } from './ui';

export const AuthModal: React.FC = () => {
  const { isOpen, close } = useAuthModal();
  const location = useLocation();

  if (!isOpen) return null;

  const state = { from: location.pathname + location.search };

  return (
    <Modal title="Join to continue" onClose={close}>
      <p className="mb-6 text-sm leading-relaxed text-textMain-secondary">
        New members start with 350 credits. Create an account or log in to carry on.
      </p>
      <div className="flex flex-col gap-3">
        <Link to="/signup" state={state} onClick={close} className={buttonClasses('primary')}>
          Create account
        </Link>
        <Link to="/login" state={state} onClick={close} className={buttonClasses('secondary')}>
          Log in
        </Link>
      </div>
    </Modal>
  );
};
