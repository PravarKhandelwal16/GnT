import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

type Tone = 'success' | 'error';
interface Toast {
  id: number;
  message: string;
  tone: Tone;
}

const ToastContext = createContext<(message: string, tone?: Tone) => void>(() => {});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const show = useCallback((message: string, tone: Tone = 'success') => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 4500);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-5 z-[60] flex flex-col items-center gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="panel animate-rise pointer-events-auto flex max-w-md items-center gap-2.5 px-4 py-3 text-sm font-medium shadow-soft-hover"
          >
            {toast.tone === 'success' ? (
              <CheckCircle2 size={17} className="flex-shrink-0 text-success" />
            ) : (
              <AlertCircle size={17} className="flex-shrink-0 text-danger" />
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
