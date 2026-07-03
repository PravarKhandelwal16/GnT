import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Search,
  AlertCircle,
  RefreshCw,
  Ban,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { getMyTransactions, cancelTransaction } from '../api/transactions';
import { useAuth } from '../context/AuthContext';
import type { TransactionResponse, TransactionStatus } from '../api/transactions';

/* ─── Types ─── */
type DisplayStatus = 'active' | 'waiting' | 'completed' | 'cancelled' | 'expired';

function mapStatus(status: TransactionStatus): DisplayStatus {
  switch (status) {
    case 'INITIATED':
    case 'ESCROWED':
      return 'active';
    case 'WAITING_CONFIRMATION':
      return 'waiting';
    case 'COMPLETED':
      return 'completed';
    case 'CANCELLED':
      return 'cancelled';
    case 'EXPIRED':
      return 'expired';
  }
}

const STATUS_CONFIG: Record<
  DisplayStatus,
  { label: string; icon: React.ReactNode; badgeClass: string }
> = {
  active:    { label: 'Active',      icon: <Clock size={12} />,        badgeClass: 'bg-primary/10 text-primary border border-primary/20' },
  waiting:   { label: 'Confirming',  icon: <Package size={12} />,      badgeClass: 'bg-warning/10 text-warning border border-warning/20' },
  completed: { label: 'Completed',   icon: <CheckCircle2 size={12} />, badgeClass: 'bg-success/10 text-success border border-success/20' },
  cancelled: { label: 'Cancelled',   icon: <XCircle size={12} />,      badgeClass: 'bg-danger/10 text-danger border border-danger/20' },
  expired:   { label: 'Expired',     icon: <Ban size={12} />,          badgeClass: 'bg-surface text-textMain-secondary border border-border' },
};

type TabFilter = DisplayStatus | 'all' | 'buying' | 'selling';

const TABS: Array<{ id: TabFilter; label: string }> = [
  { id: 'all',       label: 'All' },
  { id: 'buying',    label: 'Buying' },
  { id: 'selling',   label: 'Selling' },
  { id: 'active',    label: 'Active' },
  { id: 'waiting',   label: 'Confirming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled / Expired' },
];

/* ─── Order Card ─── */
const OrderCard: React.FC<{
  tx: TransactionResponse;
  userId: number;
  onCancel: (id: number) => void;
  cancelling: boolean;
}> = ({ tx, userId, onCancel, cancelling }) => {
  const display = mapStatus(tx.status);
  const cfg = STATUS_CONFIG[display];
  const isBuyer = tx.buyerId === userId;
  const role = isBuyer ? 'Buying from' : 'Selling to';
  const counterpart = isBuyer ? tx.sellerName : tx.buyerName;
  const canCancel =
    (display === 'active' || display === 'waiting') && isBuyer;

  return (
    <div
      id={`order-card-${tx.id}`}
      className="bg-card border border-border rounded-[16px] p-5 shadow-soft hover:shadow-soft-hover hover:-translate-y-0.5 transition-all"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-textMain-secondary">
            <ShoppingBag size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-textMain truncate">{tx.productTitle}</p>
            <p className="text-xs text-textMain-secondary">
              {role}{' '}
              <span className="font-medium text-textMain">{counterpart}</span>
            </p>
          </div>
        </div>
        <span
          className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.badgeClass}`}
        >
          {cfg.icon} {cfg.label}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-textMain-secondary mb-4">
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        {tx.completedAt && (
          <span className="flex items-center gap-1 text-success">
            <CheckCircle2 size={11} />
            Completed {new Date(tx.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
        {(display === 'active' || display === 'waiting') && (
          <span className="flex items-center gap-1 text-warning">
            <AlertCircle size={11} />
            Expires{' '}
            {new Date(tx.expiresAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div>
          <span className="text-base font-bold text-textMain">{tx.creditsUsed}</span>
          <span className="text-xs text-textMain-secondary ml-1">credits</span>
        </div>
        <div className="flex items-center gap-2">
          {canCancel && (
            <button
              id={`order-cancel-${tx.id}`}
              onClick={() => onCancel(tx.id)}
              disabled={cancelling}
              className="flex items-center gap-1 text-xs text-danger hover:text-danger/80 font-medium transition-colors disabled:opacity-60"
            >
              {cancelling ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
              Cancel
            </button>
          )}
          <Link
            to={`/product/${tx.productId}`}
            id={`order-details-${tx.id}`}
            className="flex items-center gap-1 text-xs text-textMain-secondary hover:text-primary transition-colors font-medium"
          >
            View Item <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
export const Orders: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [search, setSearch] = useState('');
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchTx = useCallback(async (pageNum: number, replace: boolean) => {
    try {
      if (replace) setIsLoading(true);
      else setLoadingMore(true);
      setIsError(false);

      const result = await getMyTransactions(pageNum, 20);
      setTransactions((prev) => replace ? result.content : [...prev, ...result.content]);
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
    fetchTx(0, true);
  }, [fetchTx]);

  const handleCancel = async (id: number) => {
    setCancellingId(id);
    try {
      const updated = await cancelTransaction(id);
      setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch {
      // ignore — keep existing state
    } finally {
      setCancellingId(null);
    }
  };

  /* Filter */
  const filtered = transactions.filter((tx) => {
    const display = mapStatus(tx.status);
    const isBuyer = tx.buyerId === user?.id;

    const matchTab =
      activeTab === 'all'
        ? true
        : activeTab === 'buying'
        ? isBuyer
        : activeTab === 'selling'
        ? !isBuyer
        : activeTab === 'cancelled'
        ? display === 'cancelled' || display === 'expired'
        : display === activeTab;

    const matchSearch =
      tx.productTitle.toLowerCase().includes(search.toLowerCase()) ||
      tx.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      tx.sellerName.toLowerCase().includes(search.toLowerCase());

    return matchTab && matchSearch;
  });

  /* Summary counts */
  const activeCount = transactions.filter((t) => {
    const d = mapStatus(t.status);
    return d === 'active' || d === 'waiting';
  }).length;
  const completedCount = transactions.filter((t) => mapStatus(t.status) === 'completed').length;
  const totalCredits = transactions
    .filter((t) => mapStatus(t.status) === 'completed' && t.buyerId === user?.id)
    .reduce((sum, t) => sum + t.creditsUsed, 0);

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-textMain">Orders</h1>
          <p className="text-sm text-textMain-secondary mt-0.5">
            Your buying and selling transactions
          </p>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total',          value: transactions.length,  icon: <ShoppingBag size={16} />, color: 'bg-primary/10 text-primary' },
            { label: 'Active',         value: activeCount,           icon: <Clock size={16} />,       color: 'bg-warning/10 text-warning' },
            { label: 'Completed',      value: completedCount,        icon: <CheckCircle2 size={16} />, color: 'bg-success/10 text-success' },
            { label: 'Credits Spent',  value: totalCredits,          icon: <Package size={16} />,     color: 'bg-danger/10 text-danger' },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-card border border-border rounded-[16px] p-4 flex items-center gap-3 hover:border-primary/20 transition-all"
            >
              <div className={`w-9 h-9 rounded-full ${s.color} flex items-center justify-center flex-shrink-0`}>
                {s.icon}
              </div>
              <div>
                <p className="text-base font-bold text-textMain">{s.value}</p>
                <p className="text-xs text-textMain-secondary">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {isError && (
          <div className="bg-card border border-border rounded-[16px] p-6 flex items-center gap-4">
            <AlertCircle size={20} className="text-danger flex-shrink-0" />
            <p className="text-sm text-textMain-secondary flex-1">Failed to load transactions.</p>
            <button
              onClick={() => fetchTx(0, true)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium"
            >
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMain-secondary" />
          <input
            id="orders-search"
            type="text"
            placeholder="Search by product or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-textMain placeholder-textMain-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`orders-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-[0_0_12px_rgba(91,124,250,0.3)]'
                  : 'bg-card border border-border text-textMain-secondary hover:text-textMain hover:bg-surface',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-[16px] p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-surface" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-surface rounded w-36" />
                    <div className="h-3 bg-surface rounded w-24" />
                  </div>
                </div>
                <div className="h-3 bg-surface rounded w-32 mb-6" />
                <div className="h-8 bg-surface rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-[20px] flex flex-col items-center justify-center py-16 px-4 text-center shadow-soft">
            <div className="w-14 h-14 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
              <ShoppingBag size={24} className="text-textMain-secondary" />
            </div>
            <p className="text-sm font-medium text-textMain mb-1">No orders found</p>
            <p className="text-xs text-textMain-secondary max-w-xs">
              {search
                ? 'No transactions match your search.'
                : transactions.length === 0
                ? "You haven't made any transactions yet. Browse the marketplace to find items."
                : 'No transactions in this category.'}
            </p>
            {!search && transactions.length === 0 && (
              <Button variant="primary" size="sm" className="mt-5" id="orders-browse">
                <Link to="/market">Browse Marketplace</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((tx) => (
              <OrderCard
                key={tx.id}
                tx={tx}
                userId={user?.id ?? 0}
                onCancel={handleCancel}
                cancelling={cancellingId === tx.id}
              />
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && !isLoading && (
          <div className="flex justify-center">
            <button
              id="orders-load-more"
              onClick={() => fetchTx(page + 1, false)}
              disabled={loadingMore}
              className="px-8 py-3 bg-card border border-border rounded-full text-sm font-medium text-textMain hover:border-primary/30 hover:text-primary transition-all disabled:opacity-60"
            >
              {loadingMore ? 'Loading…' : 'Load More'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
