import { createContext, useContext, useState } from 'react';

interface AccountDrawerContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const AccountDrawerContext = createContext<AccountDrawerContextValue>({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
});

export function useAccountDrawer(): AccountDrawerContextValue {
  return useContext(AccountDrawerContext);
}

export function useAccountDrawerState(): AccountDrawerContextValue {
  const [isOpen, setIsOpen] = useState(false);
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
