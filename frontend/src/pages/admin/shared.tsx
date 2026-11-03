import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet } from 'react-router-dom';
import { ArrowLeftRight, Flag, Gauge, History, LayoutList, Loader2, Users } from 'lucide-react';
import type { Page } from '../../api/products';
import { Navbar } from '../../components/Layout';
import { Alert, Button, Field, Modal, StatusBadge } from '../../components/ui';
import type { Tone } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { apiError } from '../../lib/format';

export const STATUS_TONE: Record<string, Tone> = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  DELETED: 'neutral',
  LOCKED: 'warning',
  EXCHANGED: 'primary',
  REJECTED: 'danger',
  INITIATED: 'primary',
  WAITING_CONFIRMATION: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'neutral',
  EXPIRED: 'neutral',
  OPEN: 'danger',
  CLOSED: 'neutral',
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Active',
  SUSPENDED: 'Suspended',
  DELETED: 'Deleted',
  LOCKED: 'Reserved',
  EXCHANGED: 'Exchanged',
  REJECTED: 'Removed',
  INITIATED: 'Reserved',
  WAITING_CONFIRMATION: 'Handover started',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
  OPEN: 'Open',
  CLOSED: 'Closed',
  USER: 'Member',
  MODERATOR: 'Team',
  ADMIN: 'Owner',
};

export const label = (value: string) => STATUS_LABEL[value] ?? value;

export const Status: React.FC<{ value: string }> = ({ value }) => (
  <StatusBadge tone={STATUS_TONE[value] ?? 'neutral'}>{label(value)}</StatusBadge>
);

export const RoleBadge: React.FC<{ role: string }> = ({ role }) =>
  role === 'USER' ? null : <StatusBadge tone={role === 'ADMIN' ? 'primary' : 'neutral'}>{label(role)}</StatusBadge>;

export function useIsOwner(): boolean {
  return useAuth().user?.role === 'ADMIN';
}

/** Loads a page of results and refetches when the inputs change. */
export function usePaged<T>(fetcher: (page: number) => Promise<Page<T>>, deps: React.DependencyList) {
  const [data, setData] = useState<Page<T> | null>(null);
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(fetcher, deps);

  const reload = useCallback(() => {
    setLoading(true);
    setError('');
    load(page)
      .then(setData)
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false));
  }, [load, page]);

  useEffect(() => {
    setPage(0);
  }, [load]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, page, setPage, error, loading, reload };
}

export const Pager: React.FC<{ page: number; totalPages: number; onChange: (page: number) => void }> = ({
  page,
  totalPages,
  onChange,
}) =>
  totalPages > 1 ? (
    <div className="mt-5 flex items-center justify-between gap-3 text-sm">
      <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => onChange(page - 1)}>
        Previous
      </Button>
      <span className="text-textMain-secondary">
        Page {page + 1} of {totalPages}
      </span>
      <Button variant="secondary" size="sm" disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </Button>
    </div>
  ) : null;

export const ListState: React.FC<{ loading: boolean; error: string; empty: boolean; emptyText: string }> = ({
  loading,
  error,
  empty,
  emptyText,
}) => {
  if (loading)
    return (
      <div className="flex justify-center py-14">
        <Loader2 className="animate-spin text-primary" aria-label="Loading" />
      </div>
    );
  if (error) return <Alert>{error}</Alert>;
  if (empty) return <p className="panel px-6 py-12 text-center text-sm text-textMain-secondary">{emptyText}</p>;
  return null;
};

/** Every staff action needs a written reason; it goes into the audit log. */
export const ActionModal: React.FC<{
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
  reasonLabel?: string;
  children?: React.ReactNode;
  onConfirm: (reason: string) => Promise<unknown>;
  onClose: () => void;
}> = ({ title, description, confirmLabel, danger, reasonLabel = 'Reason (kept in the audit log)', children, onConfirm, onClose }) => {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onConfirm(reason.trim());
      onClose();
    } catch (err) {
      setError(apiError(err));
      setBusy(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="text-sm leading-relaxed text-textMain-secondary">{description}</div>
        {error && <Alert>{error}</Alert>}
        {children}
        <Field label={reasonLabel} htmlFor="staff-reason">
          <textarea
            id="staff-reason"
            required
            rows={3}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="field resize-none"
          />
        </Field>
        <Button type="submit" variant={danger ? 'danger' : 'primary'} className="w-full" loading={busy} disabled={!reason.trim()}>
          {confirmLabel}
        </Button>
      </form>
    </Modal>
  );
};

const NAV = [
  { to: '/admin', label: 'Overview', icon: Gauge, end: true },
  { to: '/admin/reports', label: 'Reports', icon: Flag },
  { to: '/admin/listings', label: 'Listings', icon: LayoutList },
  { to: '/admin/members', label: 'Members', icon: Users },
  { to: '/admin/exchanges', label: 'Exchanges', icon: ArrowLeftRight },
  { to: '/admin/audit', label: 'Audit log', icon: History, ownerOnly: true },
];

/** Staff-only shell. Members are sent home; the server enforces the same rules. */
export const AdminLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" state={{ from: '/admin' }} replace />;
  if (user.role === 'USER') return <Navigate to="/" replace />;

  const isOwner = user.role === 'ADMIN';

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto w-full max-w-page flex-1 px-4 py-8 sm:px-6 lg:flex lg:gap-10">
        <aside className="mb-6 lg:mb-0 lg:w-52 lg:flex-shrink-0">
          <p className="eyebrow mb-3">{isOwner ? 'Owner' : 'Team'} workspace</p>
          <nav aria-label="Staff" className="scroll-row -mx-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
            {NAV.filter((item) => isOwner || !item.ownerOnly).map(({ to, label: text, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex flex-shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary text-onPrimary' : 'text-textMain-secondary hover:bg-textMain/5 hover:text-textMain'
                  }`
                }
              >
                <Icon size={16} />
                {text}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const AdminHeader: React.FC<{ title: string; description?: string; action?: React.ReactNode }> = ({
  title,
  description,
  action,
}) => (
  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="display text-3xl sm:text-4xl">{title}</h1>
      {description && <p className="mt-1 text-sm text-textMain-secondary">{description}</p>}
    </div>
    {action}
  </div>
);
