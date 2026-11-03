import React, { useEffect, useState } from 'react';
import { warmUp } from '../api/client';

/**
 * Explains a slow first request: on the free hosting plan the server sleeps when idle and takes
 * up to a minute to start. Also pings the server as soon as the site opens, so it is usually
 * awake by the time someone finishes typing.
 */
export const WakingNotice: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    warmUp();
    const show = () => setVisible(true);
    const hide = () => setVisible(false);
    window.addEventListener('api:slow', show);
    window.addEventListener('api:settled', hide);
    return () => {
      window.removeEventListener('api:slow', show);
      window.removeEventListener('api:settled', hide);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-textMain shadow-soft-hover"
    >
      <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span>
        <strong className="font-semibold">Waking the server up…</strong>{' '}
        <span className="text-textMain-secondary">It sleeps when idle, so this first request can take up to a minute.</span>
      </span>
    </div>
  );
};
