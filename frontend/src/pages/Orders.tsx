import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, ChevronRight } from 'lucide-react';
import { getMyTransactions, isOpen } from '../api/transactions';
import type { TransactionResponse } from '../api/transactions';
import { PageHeader, PageShell } from '../components/Layout';
import { Button, Credits, EmptyState, ErrorState, ProductImage, Skeleton, StatusBadge, buttonClasses } from '../components/ui';
import type { Tone } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { formatDate, timeLeft } from '../lib/format';

export const EXCHANGE_STATUS: Record<TransactionResponse['status'], { label: string; tone: Tone }> = {
  INITIATED: { label: 'Reserved', tone: 'primary' },
  WAITING_CONFIRMATION: { label: 'Handover started', tone: 'warning' },
  COMPLETED: { label: 'Completed', tone: 'success' },
  CANCELLED: { label: 'Cancelled', tone: 'neutral' },
  EXPIRED: { label: 'Expired', tone: 'neutral' },
};

type Tab = 'open' | 'buying' | 'selling' | 'past';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'open', label: 'In progress' },
  { id: 'buying', label: 'Buying' },
  { id: 'selling', label: 'Selling' },
  { id: 'past', label: 'Past' },
];

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('open');
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
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
      const result = await getMyTransactions(pageNumber, 20);
      setTransactions((current) => (pageNumber === 0 ? result.content : [...current, ...result.content]));
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
    load(0);
  }, [load]);

  const visible = transactions.filter((tx) => {
    if (tab === 'open') return isOpen(tx.status);
    if (tab === 'past') return !isOpen(tx.status);
    return tab === 'buying' ? tx.buyerId === user?.id : tx.sellerId === user?.id;
  });

  return (
    <PageShell width="max-w-4xl">
      <PageHeader eyebrow="Your exchanges" title="Exchanges" description="Everything you're buying and selling." />

      <div className="scroll-row -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={tab === id}
            onClick={() => setTab(id)}
            className={`chip ${tab === id ? 'chip-active' : 'chip-idle'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message="We couldn't load your exchanges." onRetry={() => load(0)} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<ArrowLeftRight size={22} />}
          title="Nothing here"
          description={
            transactions.length === 0
              ? 'When you reserve an item, or someone reserves yours, it will appear here.'
              : 'No exchanges in this view.'
          }
          action={
            transactions.length === 0 ? (
              <Link to="/market" className={buttonClasses('primary')}>
                Browse the market
              </Link>
            ) : undefined
          }
        />
      ) : (
        <ul className="space-y-3">
          {visible.map((tx) => {
            const buying = tx.buyerId === user?.id;
            const status = EXCHANGE_STATUS[tx.status];
            const remaining = isOpen(tx.status) ? timeLeft(tx.expiresAt) : null;
            return (
              <li key={tx.id}>
                <Link
                  to={`/orders/${tx.id}`}
                  className="panel group flex items-center gap-4 p-3 pr-4 transition-shadow hover:shadow-soft-hover sm:p-4"
                >
                  <ProductImage src={tx.productImageUrl} alt="" className="h-20 w-20 flex-shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate font-medium">{tx.productTitle}</h2>
                      <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                    </div>
                    <p className="mt-1 truncate text-sm text-textMain-secondary">
                      {buying ? `From ${tx.sellerName}` : `To ${tx.buyerName}`} · {remaining ?? formatDate(tx.createdAt)}
                    </p>
                    <div className="mt-1 text-sm">
                      <Credits value={tx.creditsUsed} size={13} />
                    </div>
                  </div>
                  <ChevronRight size={18} className="flex-shrink-0 text-textMain-secondary transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {hasMore && !isLoading && (
        <div className="mt-8 flex justify-center">
          <Button variant="secondary" loading={loadingMore} onClick={() => load(page + 1)}>
            Show more
          </Button>
        </div>
      )}
    </PageShell>
  );
};

export default Orders;
