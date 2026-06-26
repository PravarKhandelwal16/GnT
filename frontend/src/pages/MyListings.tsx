import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import {
  Package,
  CheckCircle2,
  XCircle,
  Bookmark,
  PlusSquare,
  Search,
  Filter,
  ChevronRight,
  Timer,
  Eye,
} from 'lucide-react';

/* ─── Types ─── */
type ListingStatus = 'listed' | 'pending' | 'reserved' | 'completed' | 'rejected';

interface Listing {
  id: string;
  title: string;
  category: string;
  condition: string;
  credits: number;
  status: ListingStatus;
  date: string;
  views: number;
  image?: string;
}

/* ─── Data ─── */
const MOCK_LISTINGS: Listing[] = [
  { id: 'l1', title: 'Vintage Film Camera', category: 'Electronics', condition: 'Good', credits: 150, status: 'listed', date: 'Jun 20, 2024', views: 47 },
  { id: 'l2', title: 'Acoustic Guitar', category: 'Music', condition: 'Like New', credits: 300, status: 'listed', date: 'Jun 18, 2024', views: 82 },
  { id: 'l3', title: 'Stand Mixer Pro', category: 'Kitchen', condition: 'Excellent', credits: 450, status: 'reserved', date: 'Jun 15, 2024', views: 31 },
  { id: 'l4', title: 'Design Book Bundle', category: 'Books', condition: 'Fair', credits: 50, status: 'pending', date: 'Jun 22, 2024', views: 0 },
  { id: 'l5', title: 'Road Bike', category: 'Sports', condition: 'Good', credits: 1200, status: 'completed', date: 'Jun 5, 2024', views: 203 },
  { id: 'l6', title: 'Mechanical Keyboard', category: 'Electronics', condition: 'Like New', credits: 85, status: 'completed', date: 'May 28, 2024', views: 115 },
  { id: 'l7', title: 'Espresso Machine', category: 'Kitchen', condition: 'Good', credits: 220, status: 'rejected', date: 'Jun 21, 2024', views: 0 },
];

const STATUS_CONFIG: Record<
  ListingStatus,
  { label: string; icon: React.ReactNode; badgeClass: string }
> = {
  listed:    { label: 'Listed',    icon: <Package size={12} />,      badgeClass: 'bg-primary/10 text-primary border border-primary/20' },
  pending:   { label: 'Pending',   icon: <Timer size={12} />,        badgeClass: 'bg-warning/10 text-warning border border-warning/20' },
  reserved:  { label: 'Reserved',  icon: <Bookmark size={12} />,     badgeClass: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' },
  completed: { label: 'Completed', icon: <CheckCircle2 size={12} />, badgeClass: 'bg-success/10 text-success border border-success/20' },
  rejected:  { label: 'Rejected',  icon: <XCircle size={12} />,      badgeClass: 'bg-danger/10 text-danger border border-danger/20' },
};

const TAB_FILTERS: Array<{ id: ListingStatus | 'all'; label: string }> = [
  { id: 'all',       label: 'All' },
  { id: 'listed',    label: 'Active' },
  { id: 'pending',   label: 'Pending' },
  { id: 'reserved',  label: 'Reserved' },
  { id: 'completed', label: 'Completed' },
  { id: 'rejected',  label: 'Rejected' },
];

/* ─── Sub-components ─── */
const ListingRow: React.FC<{ listing: Listing }> = ({ listing }) => {
  const cfg = STATUS_CONFIG[listing.status];
  return (
    <div
      id={`listing-row-${listing.id}`}
      className="flex items-center gap-4 px-5 py-4 hover:bg-surface transition-colors cursor-pointer group border-b border-border last:border-0"
    >
      {/* Icon / image */}
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-textMain-secondary">
        <Package size={20} />
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-textMain truncate group-hover:text-primary transition-colors">
            {listing.title}
          </p>
          <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.badgeClass}`}>
            {cfg.icon} {cfg.label}
          </span>
        </div>
        <p className="text-xs text-textMain-secondary">
          {listing.category} · {listing.condition} · {listing.date}
        </p>
      </div>

      {/* Right side */}
      <div className="flex-shrink-0 flex items-center gap-6 text-right">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-textMain-secondary">
          <Eye size={13} />
          {listing.views}
        </div>
        <div>
          <p className="text-sm font-bold text-textMain">{listing.credits}</p>
          <p className="text-xs text-textMain-secondary">credits</p>
        </div>
        <ChevronRight
          size={16}
          className="text-textMain-secondary/0 group-hover:text-textMain-secondary/50 transition-all duration-150 group-hover:translate-x-0.5"
        />
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
export const MyListings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ListingStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_LISTINGS.filter((l) => {
    const matchTab = activeTab === 'all' || l.status === activeTab;
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts: Record<string, number> = { all: MOCK_LISTINGS.length };
  MOCK_LISTINGS.forEach((l) => {
    counts[l.status] = (counts[l.status] ?? 0) + 1;
  });

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-textMain">My Listings</h1>
            <p className="text-sm text-textMain-secondary mt-0.5">
              {MOCK_LISTINGS.length} items you've uploaded
            </p>
          </div>
          <Button variant="primary" size="sm" id="listings-add-item" onClick={() => navigate('/add-item')}>
            <PlusSquare size={15} />
            Add Item
          </Button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Active',    value: counts['listed']    ?? 0, color: 'text-primary',  bg: 'bg-primary/10' },
            { label: 'Pending',   value: counts['pending']   ?? 0, color: 'text-warning',  bg: 'bg-warning/10' },
            { label: 'Reserved',  value: counts['reserved']  ?? 0, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'Completed', value: counts['completed'] ?? 0, color: 'text-success',  bg: 'bg-success/10' },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-card border border-border rounded-[16px] p-4 flex items-center gap-3 hover:border-primary/20 transition-all"
            >
              <div className={`w-9 h-9 rounded-full ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <span className={`text-base font-bold ${s.color}`}>{s.value}</span>
              </div>
              <span className="text-sm text-textMain-secondary">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Search + Filter bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMain-secondary" />
            <input
              id="listings-search"
              type="text"
              placeholder="Search your listings…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-textMain placeholder-textMain-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <button
            id="listings-filter"
            className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-textMain-secondary hover:text-textMain hover:border-primary/20 transition-all flex items-center gap-2"
          >
            <Filter size={15} />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {TAB_FILTERS.map((tab) => (
            <button
              key={tab.id}
              id={`listings-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as ListingStatus | 'all')}
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

        {/* Listings table */}
        <div className="bg-card border border-border rounded-[20px] shadow-soft overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
                <Package size={24} className="text-textMain-secondary" />
              </div>
              <p className="text-sm font-medium text-textMain mb-1">No listings found</p>
              <p className="text-xs text-textMain-secondary max-w-xs">
                {search ? 'No items match your search. Try a different keyword.' : 'You don\'t have any items in this category yet.'}
              </p>
              {!search && (
                <Button variant="primary" size="sm" className="mt-5" id="listings-add-first" onClick={() => navigate('/add-item')}>
                  <PlusSquare size={14} />
                  Add Your First Item
                </Button>
              )}
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div className="hidden sm:flex items-center gap-4 px-5 py-3 border-b border-border bg-surface text-xs font-semibold text-textMain-secondary uppercase tracking-wide">
                <div className="flex-shrink-0 w-12" />
                <div className="flex-1">Item</div>
                <div className="w-16 text-center">Views</div>
                <div className="w-16 text-right">Credits</div>
                <div className="w-4" />
              </div>
              {filtered.map((listing) => (
                <ListingRow key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
