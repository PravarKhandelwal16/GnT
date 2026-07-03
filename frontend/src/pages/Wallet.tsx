import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { Badge } from '../components/Badge';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  Image as ImageIcon,
  Users,
  ShieldCheck,
  Filter,
  AlertCircle,
  RefreshCw,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyCreditHistory } from '../api/profile';
import type { CreditHistoryEntry, CreditHistoryType } from '../api/profile';

/* ─── Credit type config ─── */
type TxIconConfig = {
  icon: React.ReactNode;
  color: string;
  bg: string;
  label: string;
};

function getCreditTypeConfig(type: CreditHistoryType, amount: number): TxIconConfig {
  switch (type) {
    case 'INITIAL_BONUS':
      return { icon: <Gift className="w-5 h-5" />, color: 'text-success', bg: 'bg-success/10', label: 'Welcome Bonus' };
    case 'PRODUCT_APPROVED':
      return { icon: <TrendingUp className="w-5 h-5" />, color: 'text-primary', bg: 'bg-primary/10', label: 'Product Approved' };
    case 'PRODUCT_PURCHASE':
      return { icon: <ArrowUpRight className="w-5 h-5" />, color: 'text-danger', bg: 'bg-danger/10', label: 'Purchase' };
    case 'PRODUCT_COMPLETED':
      return { icon: <ArrowDownLeft className="w-5 h-5" />, color: 'text-success', bg: 'bg-success/10', label: 'Sale Completed' };
    case 'REFUND':
      return { icon: <ShieldCheck className="w-5 h-5" />, color: 'text-primary', bg: 'bg-primary/10', label: 'Refund' };
    case 'MANUAL_ADJUSTMENT':
      return { icon: amount >= 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />, color: amount >= 0 ? 'text-success' : 'text-danger', bg: amount >= 0 ? 'bg-success/10' : 'bg-danger/10', label: 'Adjustment' };
    default:
      return { icon: <TrendingUp className="w-5 h-5" />, color: 'text-textMain-secondary', bg: 'bg-surface', label: type };
  }
}

export const Wallet: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [history, setHistory] = useState<CreditHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchHistory = useCallback(async (pageNum: number, replace: boolean) => {
    try {
      if (replace) setIsLoading(true);
      else setLoadingMore(true);
      setIsError(false);

      const result = await getMyCreditHistory(pageNum, 15);
      setHistory((prev) => replace ? result.content : [...prev, ...result.content]);
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
    refreshUser(); // ensure credit balance is fresh
    fetchHistory(0, true);
  }, [fetchHistory, refreshUser]);

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Card */}
          <div className="bg-card border border-border rounded-[20px] p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-textMain mb-1">Available Balance</h2>
              <p className="text-textMain-secondary mb-8">Your tradable community credits</p>
              <div className="text-6xl font-bold text-textMain mb-10 tracking-tight">
                {user?.creditBalance?.toLocaleString() ?? '—'}
              </div>
            </div>
            <div className="text-xs text-textMain-secondary">
              Credits are earned by listing and exchanging items.
            </div>
          </div>

          {/* Earn Credits Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-textMain">Earn Credits</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:h-[calc(100%-48px)]">
              {/* Earn Card 1 */}
              <div className="bg-card border border-border rounded-[20px] p-6 shadow-sm flex flex-col h-full">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-textMain mb-2 text-lg">List an Item</h3>
                <p className="text-textMain-secondary text-sm mb-6 flex-1">
                  Add something you no longer need to the market.
                </p>
                <div>
                  <Badge
                    variant="success"
                    className="bg-success/10 text-success border-none shadow-none rounded-full px-3 py-1 font-medium"
                  >
                    + 50% on listing
                  </Badge>
                </div>
              </div>

              {/* Earn Card 2 */}
              <div className="bg-card border border-border rounded-[20px] p-6 shadow-sm flex flex-col h-full">
                <div className="w-12 h-12 rounded-full bg-warning/10 text-warning flex items-center justify-center mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-textMain mb-2 text-lg">Complete an Exchange</h3>
                <p className="text-textMain-secondary text-sm mb-6 flex-1">
                  Finish a trade to receive the remaining credit value.
                </p>
                <div>
                  <Badge
                    variant="success"
                    className="bg-success/10 text-success border-none shadow-none rounded-full px-3 py-1 font-medium"
                  >
                    + 50% on completion
                  </Badge>
                </div>
              </div>

              {/* Earn Card 3 */}
              <div className="bg-card border border-border rounded-[20px] p-6 shadow-sm flex flex-col h-full">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-textMain mb-2 text-lg">Welcome Bonus</h3>
                <p className="text-textMain-secondary text-sm mb-6 flex-1">
                  New accounts start with 350 free credits.
                </p>
                <div>
                  <Badge
                    variant="success"
                    className="bg-success/10 text-success border-none shadow-none rounded-full px-3 py-1 font-medium"
                  >
                    + 350 on signup
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-[20px] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center bg-card">
            <h2 className="text-2xl font-bold text-textMain">Recent Activity</h2>
            <button className="p-2 hover:bg-surface rounded-full text-textMain-secondary transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-6 flex items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-surface flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface rounded w-48" />
                    <div className="h-3 bg-surface rounded w-32" />
                  </div>
                  <div className="w-16 h-5 bg-surface rounded" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 flex flex-col items-center gap-3 text-center">
              <AlertCircle size={24} className="text-danger" />
              <p className="text-sm text-textMain-secondary">Failed to load credit history.</p>
              <button
                onClick={() => fetchHistory(0, true)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium"
              >
                <RefreshCw size={13} /> Retry
              </button>
            </div>
          ) : history.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-textMain-secondary">No credit history yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border bg-card">
              {history.map((entry) => {
                const cfg = getCreditTypeConfig(entry.transactionType, entry.amount);
                return (
                  <div
                    key={entry.id}
                    className="p-6 flex items-center justify-between hover:bg-surface transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full ${cfg.bg} ${cfg.color} flex items-center justify-center`}>
                        {cfg.icon}
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-textMain group-hover:text-primary transition-colors">
                          {entry.description || cfg.label}
                        </h3>
                        <p className="text-textMain-secondary text-sm">
                          {new Date(entry.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-xl font-bold ${
                          entry.amount >= 0 ? 'text-success' : 'text-textMain'
                        }`}
                      >
                        {entry.amount >= 0 ? '+' : ''}{entry.amount}
                      </div>
                      <div className="text-sm text-textMain-secondary">Credits</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {hasMore && !isLoading && (
            <div className="border-t border-border bg-card">
              <button
                id="wallet-load-more"
                onClick={() => fetchHistory(page + 1, false)}
                disabled={loadingMore}
                className="text-primary hover:text-primary-hover hover:bg-surface font-medium text-sm w-full py-4 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
                {loadingMore ? 'Loading…' : 'Load More Transactions'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
