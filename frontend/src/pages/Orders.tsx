import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Inbox,
  ChevronRight,
  Search,
  Filter,
  MapPin,
  Star,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

/* ─── Types ─── */
type OrderStatus = 'requested' | 'reserved' | 'awaiting' | 'completed' | 'cancelled';

interface Order {
  id: string;
  title: string;
  seller: string;
  sellerRating: number;
  category: string;
  credits: number;
  status: OrderStatus;
  date: string;
  location: string;
  estimatedPickup?: string;
}

/* ─── Data ─── */
const MOCK_ORDERS: Order[] = [
  {
    id: 'o1', title: 'Vintage Film Camera', seller: 'Alex G.', sellerRating: 4.9,
    category: 'Electronics', credits: 150, status: 'awaiting', date: 'Jun 20, 2024',
    location: 'Downtown', estimatedPickup: 'Jun 25, 2024',
  },
  {
    id: 'o2', title: 'Acoustic Guitar', seller: 'Sarah M.', sellerRating: 4.7,
    category: 'Music', credits: 300, status: 'reserved', date: 'Jun 18, 2024',
    location: 'Westside',
  },
  {
    id: 'o3', title: 'Stand Mixer Pro', seller: 'Rahul K.', sellerRating: 5.0,
    category: 'Kitchen', credits: 450, status: 'requested', date: 'Jun 22, 2024',
    location: 'North Hills',
  },
  {
    id: 'o4', title: 'Road Bike', seller: 'Priya T.', sellerRating: 4.5,
    category: 'Sports', credits: 1200, status: 'completed', date: 'Jun 5, 2024',
    location: 'Central Park', estimatedPickup: 'Jun 8, 2024',
  },
  {
    id: 'o5', title: 'Mechanical Keyboard', seller: 'Arjun S.', sellerRating: 4.8,
    category: 'Electronics', credits: 85, status: 'completed', date: 'May 28, 2024',
    location: 'East End',
  },
  {
    id: 'o6', title: 'Espresso Machine', seller: 'Nina R.', sellerRating: 4.2,
    category: 'Kitchen', credits: 220, status: 'cancelled', date: 'Jun 1, 2024',
    location: 'South Bay',
  },
];

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; icon: React.ReactNode; badgeClass: string; step: number }
> = {
  requested: { label: 'Requested',        icon: <Inbox size={12} />,       badgeClass: 'bg-primary/10 text-primary border border-primary/20',     step: 1 },
  reserved:  { label: 'Reserved',         icon: <Package size={12} />,     badgeClass: 'bg-purple-500/10 text-purple-400 border border-purple-500/20', step: 2 },
  awaiting:  { label: 'Awaiting Pickup',  icon: <Clock size={12} />,       badgeClass: 'bg-warning/10 text-warning border border-warning/20',     step: 3 },
  completed: { label: 'Completed',        icon: <CheckCircle2 size={12} />, badgeClass: 'bg-success/10 text-success border border-success/20',    step: 4 },
  cancelled: { label: 'Cancelled',        icon: <XCircle size={12} />,     badgeClass: 'bg-danger/10 text-danger border border-danger/20',        step: 0 },
};

const TABS: Array<{ id: OrderStatus | 'all'; label: string }> = [
  { id: 'all',       label: 'All Orders' },
  { id: 'requested', label: 'Requested' },
  { id: 'reserved',  label: 'Reserved' },
  { id: 'awaiting',  label: 'Awaiting Pickup' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

/* ─── Progress tracker ─── */
const OrderProgress: React.FC<{ status: OrderStatus }> = ({ status }) => {
  if (status === 'cancelled') return null;
  const steps = ['Requested', 'Reserved', 'Awaiting Pickup', 'Collected'];
  const current = STATUS_CONFIG[status].step;
  return (
    <div className="flex items-center gap-1 mt-3">
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const done = stepNum <= current;
        const active = stepNum === current;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={[
                  'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 transition-all',
                  done
                    ? active
                      ? 'bg-primary text-white shadow-[0_0_8px_rgba(91,124,250,0.4)]'
                      : 'bg-success text-white'
                    : 'bg-surface border border-border text-textMain-secondary',
                ].join(' ')}
              >
                {done && !active ? <CheckCircle2 size={10} /> : stepNum}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={['flex-1 h-0.5 rounded-full transition-all', stepNum < current ? 'bg-success' : 'bg-border'].join(' ')} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ─── Order card ─── */
const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const cfg = STATUS_CONFIG[order.status];

  return (
    <div
      id={`order-card-${order.id}`}
      className="bg-card border border-border rounded-[16px] p-5 shadow-soft hover:shadow-soft-hover hover:-translate-y-0.5 transition-all cursor-pointer group"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-textMain-secondary">
            <ShoppingBag size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-textMain truncate group-hover:text-primary transition-colors">
              {order.title}
            </p>
            <p className="text-xs text-textMain-secondary">{order.category}</p>
          </div>
        </div>
        <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.badgeClass}`}>
          {cfg.icon} {cfg.label}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-textMain-secondary mb-3">
        <span className="flex items-center gap-1">
          <Star size={11} className="text-warning fill-warning" />
          {order.seller} · {order.sellerRating}
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={11} />
          {order.location}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {order.date}
        </span>
        {order.estimatedPickup && (
          <span className="flex items-center gap-1 text-warning">
            <AlertCircle size={11} />
            Pickup by {order.estimatedPickup}
          </span>
        )}
      </div>

      {/* Progress */}
      <OrderProgress status={order.status} />

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div>
          <span className="text-base font-bold text-textMain">{order.credits}</span>
          <span className="text-xs text-textMain-secondary ml-1">credits</span>
        </div>
        <div className="flex items-center gap-2">
          {order.status === 'awaiting' && (
            <Button variant="primary" size="sm" id={`order-confirm-${order.id}`}>
              Confirm Collection
            </Button>
          )}
          {order.status === 'completed' && (
            <Button variant="outline" size="sm" id={`order-review-${order.id}`}>
              <Star size={13} /> Leave Review
            </Button>
          )}
          <button
            id={`order-details-${order.id}`}
            className="flex items-center gap-1 text-xs text-textMain-secondary hover:text-primary transition-colors font-medium"
          >
            Details <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
export const Orders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_ORDERS.filter((o) => {
    const matchTab = activeTab === 'all' || o.status === activeTab;
    const matchSearch = o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.seller.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts: Record<string, number> = { all: MOCK_ORDERS.length };
  MOCK_ORDERS.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });

  const totalSpent = MOCK_ORDERS
    .filter((o) => o.status === 'completed')
    .reduce((acc, o) => acc + o.credits, 0);

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-textMain">Orders</h1>
          <p className="text-sm text-textMain-secondary mt-0.5">
            Items you've requested from others
          </p>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders',   value: MOCK_ORDERS.length,                  icon: <ShoppingBag size={16} />, color: 'bg-primary/10 text-primary' },
            { label: 'Active',         value: (counts['requested'] ?? 0) + (counts['reserved'] ?? 0) + (counts['awaiting'] ?? 0), icon: <Clock size={16} />, color: 'bg-warning/10 text-warning' },
            { label: 'Completed',      value: counts['completed'] ?? 0,             icon: <CheckCircle2 size={16} />, color: 'bg-success/10 text-success' },
            { label: 'Credits Spent',  value: totalSpent,                          icon: <Package size={16} />, color: 'bg-danger/10 text-danger' },
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

        {/* Search + filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMain-secondary" />
            <input
              id="orders-search"
              type="text"
              placeholder="Search orders or sellers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-textMain placeholder-textMain-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <button
            id="orders-filter"
            className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-textMain-secondary hover:text-textMain hover:border-primary/20 transition-all flex items-center gap-2"
          >
            <Filter size={15} />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`orders-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as OrderStatus | 'all')}
              className={[
                'flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-[0_0_12px_rgba(91,124,250,0.3)]'
                  : 'bg-card border border-border text-textMain-secondary hover:text-textMain hover:bg-surface',
              ].join(' ')}
            >
              {tab.label}
              {counts[tab.id] !== undefined && (
                <span
                  className={[
                    'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-surface text-textMain-secondary',
                  ].join(' ')}
                >
                  {counts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders grid */}
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-[20px] flex flex-col items-center justify-center py-16 px-4 text-center shadow-soft">
            <div className="w-14 h-14 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
              <ShoppingBag size={24} className="text-textMain-secondary" />
            </div>
            <p className="text-sm font-medium text-textMain mb-1">No orders found</p>
            <p className="text-xs text-textMain-secondary max-w-xs">
              {search
                ? 'No orders match your search.'
                : 'You haven\'t made any requests yet. Browse the marketplace to find items.'}
            </p>
            {!search && (
              <Button variant="primary" size="sm" className="mt-5" id="orders-browse">
                Browse Marketplace
                <ChevronRight size={14} />
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
