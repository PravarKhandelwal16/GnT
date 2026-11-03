import axios from 'axios';

/** Pulls the user-facing message out of an API failure. */
export function apiError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return "We can't reach the server right now. Please check your connection.";
    const data = err.response.data as { error?: string; errors?: Record<string, string> } | undefined;
    if (data?.errors) return Object.values(data.errors)[0] ?? fallback;
    if (data?.error) return data.error;
  }
  return fallback;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** e.g. "1 day 4 hours left". Returns null once the time has passed. */
export function timeLeft(until: string, now = Date.now()): string | null {
  const ms = new Date(until).getTime() - now;
  if (ms <= 0) return null;
  const minutes = Math.ceil(ms / 60000);
  if (minutes < 60) return `${minutes} min left`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ${minutes % 60} min left`;
  const days = Math.floor(hours / 24);
  const rest = hours % 24;
  return `${days} day${days > 1 ? 's' : ''}${rest ? ` ${rest} hr` : ''} left`;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

/** Displays a handover code as XXXX-XXXX. */
export function formatCode(code: string): string {
  return code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
}
