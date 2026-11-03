import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Image as ImageIcon, Loader2, PackageOpen, RefreshCcw, Star, X } from 'lucide-react';

/* ── Buttons ──────────────────────────────────────────────────────────────── */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', className = ''): string {
  const variants: Record<Variant, string> = {
    primary: 'bg-primary text-onPrimary hover:bg-primary-hover',
    secondary: 'border border-border bg-card text-textMain hover:border-primary/40',
    ghost: 'text-textMain-secondary hover:bg-textMain/5 hover:text-textMain',
    danger: 'bg-danger text-card hover:bg-danger/90',
  };
  const sizes: Record<Size, string> = {
    sm: 'h-9 px-3.5 text-sm',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-[15px]',
  };
  return [
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  ].join(' ');
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  loading,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}) => (
  <button type={type} className={buttonClasses(variant, size, className)} disabled={disabled || loading} {...props}>
    {loading && <Loader2 size={16} className="animate-spin" />}
    {children}
  </button>
);

/* ── Credits ──────────────────────────────────────────────────────────────── */

export const CreditMark: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
    <path d="M8 10.5a4.3 4.3 0 0 1 7.200-1.600M16 13.500a4.300 4.300 0 0 1-7.200 1.600" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const Credits: React.FC<{ value: number; size?: number; className?: string }> = ({
  value,
  size = 15,
  className = '',
}) => (
  <span className={`tabular inline-flex items-center gap-1.5 font-semibold ${className}`}>
    <CreditMark size={size} className="text-gold" />
    {value.toLocaleString()}
    <span className="sr-only">credits</span>
  </span>
);

/* ── Brand ────────────────────────────────────────────────────────────────── */

export const Logo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Link to="/" className={`inline-flex items-center gap-2.5 ${className}`} aria-label="Give and Take home">
    <img src="/favicon.svg" alt="" width={30} height={30} />
    <span className="display text-xl">Give &amp; Take</span>
  </Link>
);

/* ── Media ────────────────────────────────────────────────────────────────── */

export const ProductImage: React.FC<{ src: string | null; alt: string; className?: string }> = ({
  src,
  alt,
  className = '',
}) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-textMain/5 text-textMain-secondary/60 ${className}`}>
        <ImageIcon size={26} aria-label={alt} />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
};

export const Avatar: React.FC<{ name: string; image?: string | null; size?: string }> = ({
  name,
  image,
  size = 'h-10 w-10 text-sm',
}) =>
  image ? (
    <img src={image} alt="" className={`flex-shrink-0 rounded-full object-cover ${size}`} />
  ) : (
    <span
      aria-hidden="true"
      className={`flex flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ${size}`}
    >
      {name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('')}
    </span>
  );

export const Stars: React.FC<{ value: number; size?: number }> = ({ value, size = 14 }) => (
  <span className="inline-flex gap-0.5" role="img" aria-label={`${value.toFixed(1)} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} size={size} className={n <= Math.round(value) ? 'fill-gold text-gold' : 'text-textMain-secondary/30'} />
    ))}
  </span>
);

/* ── Feedback ─────────────────────────────────────────────────────────────── */

export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

export const StatusBadge: React.FC<{ tone?: Tone; children: React.ReactNode }> = ({ tone = 'neutral', children }) => {
  const tones: Record<Tone, string> = {
    neutral: 'bg-textMain/5 text-textMain-secondary',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
  };
  return (
    <span className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
};

export const Alert: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div role="alert" className="flex items-start gap-2.5 rounded-xl bg-danger/10 px-3.5 py-3 text-sm text-danger">
    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
    <span>{children}</span>
  </div>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div aria-hidden="true" className={`animate-pulse rounded-xl bg-textMain/[0.07] ${className}`} />
);

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="panel flex flex-col items-center px-6 py-16 text-center">
    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
      {icon ?? <PackageOpen size={24} />}
    </div>
    <h3 className="display text-2xl">{title}</h3>
    <p className="mt-2 max-w-sm text-sm leading-relaxed text-textMain-secondary">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({
  message = "We couldn't load this right now.",
  onRetry,
}) => (
  <div className="panel flex flex-col items-center px-6 py-14 text-center">
    <AlertCircle size={26} className="mb-3 text-danger" />
    <p className="text-sm text-textMain-secondary">{message}</p>
    {onRetry && (
      <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
        <RefreshCcw size={14} /> Try again
      </Button>
    )}
  </div>
);

/* ── Forms ────────────────────────────────────────────────────────────────── */

export const Field: React.FC<{
  label: string;
  htmlFor: string;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, htmlFor, error, hint, children }) => (
  <div>
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
      {label}
    </label>
    {children}
    {error ? (
      <p role="alert" className="mt-1.5 text-xs text-danger">
        {error}
      </p>
    ) : (
      hint && <p className="mt-1.5 text-xs text-textMain-secondary">{hint}</p>
    )}
  </div>
);

/* ── Modal ────────────────────────────────────────────────────────────────── */

export const Modal: React.FC<{
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, onClose, children }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="animate-modal-in max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-border bg-card p-6 shadow-soft-hover outline-none sm:max-w-md sm:rounded-3xl sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="display text-2xl">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1.5 rounded-full p-1.5 text-textMain-secondary hover:bg-textMain/5 hover:text-textMain"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
