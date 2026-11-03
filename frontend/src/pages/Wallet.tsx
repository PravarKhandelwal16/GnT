import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyCreditHistory } from '../api/profile';
import type { CreditHistoryEntry, CreditHistoryType } from '../api/profile';
import { PageHeader, PageShell } from '../components/Layout';
import { Button, CreditMark, EmptyState, ErrorState, Skeleton, buttonClasses } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/format';

const TYPE_LABELS: Record<CreditHistoryType, string> = {
  INITIAL_BONUS: 'Welcome bonus',
  PRODUCT_APPROVED: 'Listing reward',
  PRODUCT_PURCHASE: 'Reservation',
  PRODUCT_COMPLETED: 'Exchange completed',
  REFUND: 'Refund',
  MANUAL_ADJUSTMENT: 'Adjustment',
  LISTING_ADJUSTMENT: 'Listing adjustment',
};

type Filter = 'all' | 'in' | 'out';

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'in', label: 'Earned' },
  { id: 'out', label: 'Spent' },
];

const Wallet: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [history, setHistory] = useState<CreditHistoryEntry[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);

  const load = useCallback(async (pageNumber: number) => {
    if (pageNumber === 0) setIsLoading(true);
    else setLoadingMore(true);
    setIsError(false);
    try {
      const result = await getMyCreditHistory(pageNumber, 20);
      setHistory((current) => (pageNumber === 0 ? result.content : [...current, ...result.content]));
      setHasMore(!result.last);
      setPage(result.number);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    load(0);
  }, [load, refreshUser]);

  const visible = history.filter((entry) => filter === 'all' || (filter === 'in' ? entry.amount > 0 : entry.amount < 0));

  return (
    <PageShell width="max-w-4xl">
      <PageHeader eyebrow="Wallet" title="Your credits" />

      <section className="overflow-hidden rounded-3xl bg-primary p-7 text-onPrimary shadow-soft-hover sm:p-10">
        <p className="text-sm font-medium opacity-80">Available balance</p>
        <p className="tabular display mt-2 flex items-center gap-3 text-6xl sm:text-7xl">
          <CreditMark size={44} className="opacity-80" />
          {user?.creditBalance.toLocaleString() ?? '—'}
        </p>
        <div className="mt-8 grid gap-4 border-t border-onPrimary/20 pt-6 text-sm sm:grid-cols-3">
          <p><strong className="block text-base font-semibold">40% when you list</strong><span className="opacity-80">Paid as soon as it's live</span></p>
          <p><strong className="block text-base font-semibold">60% on handover</strong><span className="opacity-80">Paid when the exchange completes</span></p>
          <p><strong className="block text-base font-semibold">350 to start</strong><span className="opacity-80">Every new member's welcome</span></p>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="display text-2xl">Activity</h2>
          <div className="flex gap-1.5">
            {FILTERS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={filter === id}
                onClick={() => setFilter(id)}
                className={`chip px-3 py-1.5 ${filter === id ? 'chip-active' : 'chip-idle'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : isError ? (
          <ErrorState message="We couldn't load your activity." onRetry={() => load(0)} />
        ) : visible.length === 0 ? (
          <EmptyState
            title="No activity here"
            description="List an item or reserve one and it will show up here."
            action={<Link to="/market" className={buttonClasses('secondary')}>Browse the market</Link>}
          />
        ) : (
          <ul className="panel divide-y divide-border">
            {visible.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-4 p-4 sm:px-5">
                <div className="min-w-0">
                  <p className="font-medium">{TYPE_LABELS[entry.transactionType]}</p>
                  <p className="truncate text-sm text-textMain-secondary">{entry.description}</p>
                  <p className="text-xs text-textMain-secondary">{formatDate(entry.createdAt)}</p>
                </div>
                <p className={`tabular flex-shrink-0 text-lg font-semibold ${entry.amount > 0 ? 'text-success' : ''}`}>
                  {entry.amount > 0 ? '+' : '−'}
                  {Math.abs(entry.amount).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}

        {hasMore && !isLoading && (
          <div className="mt-6 flex justify-center">
            <Button variant="secondary" loading={loadingMore} onClick={() => load(page + 1)}>
              Show more
            </Button>
          </div>
        )}
      </section>
    </PageShell>
  );
};

export default Wallet;
