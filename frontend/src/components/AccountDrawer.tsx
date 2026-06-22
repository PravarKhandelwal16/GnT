import React, { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  X,
  User,
  List,
  ShoppingBag,
  ArrowLeftRight,
  Clock,
  CheckSquare,
  BookOpen,
  Bell,
  Bookmark,
  Star,
  Settings,
  Moon,
  Sun,
  HelpCircle,
  LogOut,
  ChevronRight,
  Package,
  Inbox,
  Timer,
  CheckCircle2,
} from 'lucide-react';
import { useAccountDrawer } from '../hooks/useAccountDrawer';
import { useDarkMode } from '../hooks/useDarkMode';

/* ─────────────────────── types ─────────────────────── */

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  badge?: number;
  action?: () => void;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

/* ─────────────────────── sub-components ─────────────────────── */

interface DrawerNavItemProps {
  item: NavItem;
  isActive: boolean;
  onClick: (item: NavItem) => void;
}

const DrawerNavItem: React.FC<DrawerNavItemProps> = ({ item, isActive, onClick }) => (
  <button
    id={`drawer-nav-${item.id}`}
    onClick={() => onClick(item)}
    className={[
      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
      isActive
        ? 'bg-primary/10 text-primary'
        : 'text-textMain hover:bg-card hover:text-textMain',
    ].join(' ')}
    aria-current={isActive ? 'page' : undefined}
  >
    <span
      className={[
        'flex-shrink-0 w-[18px] h-[18px] transition-colors duration-200',
        isActive ? 'text-primary' : 'text-textMain-secondary group-hover:text-textMain',
      ].join(' ')}
    >
      {item.icon}
    </span>

    <span className="flex-1 text-left">{item.label}</span>

    {item.badge !== undefined && item.badge > 0 && (
      <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary/15 text-primary text-xs font-semibold">
        {item.badge}
      </span>
    )}

    {!item.badge && (
      <ChevronRight
        className={[
          'flex-shrink-0 w-3.5 h-3.5 transition-all duration-200',
          isActive
            ? 'text-primary'
            : 'text-textMain-secondary/0 group-hover:text-textMain-secondary/60 group-hover:translate-x-0.5',
        ].join(' ')}
      />
    )}
  </button>
);

/* ─────────────────────── main component ─────────────────────── */

export const AccountDrawer: React.FC = () => {
  const { isOpen, close } = useAccountDrawer();
  const { theme, toggleTheme } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();

  /* ── keyboard close ── */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) close();
    },
    [isOpen, close],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /* ── body scroll lock ── */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  /* ── navigation ── */
  const handleNavItem = (item: NavItem) => {
    if (item.action) {
      item.action();
      return;
    }
    if (item.path) {
      navigate(item.path);
      close();
    }
  };

  const isActive = (path?: string) => !!path && location.pathname === path;

  /* ── mock user data ── */
  const user = {
    name: 'Pravar Khandelwal',
    email: 'pravar@email.com',
    credits: 420,
    initials: 'PK',
  };

  /* ── nav sections ── */
  const sections: NavSection[] = [
    {
      title: 'Account',
      items: [
        { id: 'my-account', label: 'My Account', icon: <User size={18} />, path: '/account' },
        { id: 'my-listings', label: 'My Listings', icon: <List size={18} />, path: '/listings', badge: 12 },
        { id: 'orders', label: 'Orders', icon: <ShoppingBag size={18} />, path: '/orders' },
        { id: 'transactions', label: 'Transactions', icon: <ArrowLeftRight size={18} />, path: '/transactions' },
        { id: 'credit-history', label: 'Credit History', icon: <Clock size={18} />, path: '/wallet' },
      ],
    },
    {
      title: 'Listings',
      items: [
        { id: 'pending-approval', label: 'Pending Approval', icon: <Timer size={18} />, path: '/listings/pending', badge: 2 },
        { id: 'reserved-items', label: 'Reserved Items', icon: <Bookmark size={18} />, path: '/listings/reserved', badge: 1 },
        { id: 'completed-trades', label: 'Completed Trades', icon: <CheckSquare size={18} />, path: '/listings/completed', badge: 8 },
      ],
    },
    {
      title: 'Orders',
      items: [
        { id: 'items-requested', label: 'Items Requested', icon: <Inbox size={18} />, path: '/orders/requested' },
        { id: 'reserved-products', label: 'Reserved Products', icon: <Package size={18} />, path: '/orders/reserved' },
        { id: 'awaiting-collection', label: 'Awaiting Collection', icon: <CheckCircle2 size={18} />, path: '/orders/collection' },
        { id: 'completed-orders', label: 'Completed Orders', icon: <BookOpen size={18} />, path: '/orders/completed' },
      ],
    },
    {
      title: 'Activity',
      items: [
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} />, path: '/notifications', badge: 3 },
        { id: 'saved-items', label: 'Saved Items', icon: <Bookmark size={18} />, path: '/saved' },
        { id: 'ratings-reviews', label: 'Ratings & Reviews', icon: <Star size={18} />, path: '/reviews' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { id: 'settings', label: 'Settings', icon: <Settings size={18} />, path: '/settings' },
        {
          id: 'dark-mode',
          label: theme === 'dark' ? 'Light Mode' : 'Dark Mode',
          icon: theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />,
          action: toggleTheme,
        },
        { id: 'help-support', label: 'Help & Support', icon: <HelpCircle size={18} />, path: '/help' },
      ],
    },
  ];

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        id="account-drawer-backdrop"
        onClick={close}
        aria-hidden="true"
        className={[
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* ── Drawer panel ── */}
      <aside
        id="account-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Account menu"
        className={[
          'fixed top-0 right-0 z-50 h-full w-full sm:w-80 bg-surface border-l border-border shadow-soft flex flex-col',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <span className="text-sm font-semibold text-textMain">My Account</span>
          <button
            id="account-drawer-close"
            onClick={close}
            aria-label="Close account menu"
            className="p-1.5 rounded-lg text-textMain-secondary hover:text-textMain hover:bg-card transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* ── Profile card ── */}
          <div className="px-4 py-5 border-b border-border">
            {/* Avatar */}
            <div className="flex items-start gap-3 mb-4">
              <div
                aria-hidden="true"
                className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center"
              >
                <span className="text-primary font-bold text-base select-none">{user.initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-textMain truncate">{user.name}</p>
                <p className="text-xs text-textMain-secondary truncate mt-0.5">{user.email}</p>
              </div>
            </div>

            {/* Credits pill */}
            <div className="flex items-center gap-2 mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/10 border border-warning/20">
                <span className="text-sm" aria-hidden="true">💰</span>
                <span className="text-sm font-semibold text-warning">{user.credits} Credits</span>
              </div>
            </div>

            {/* Edit profile button */}
            <button
              id="drawer-edit-profile"
              onClick={() => { navigate('/account'); close(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border text-textMain hover:bg-card hover:border-primary/30 hover:text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-surface"
            >
              <User size={14} />
              Edit Profile
            </button>
          </div>

          {/* ── Nav sections ── */}
          <nav aria-label="Account navigation" className="px-3 py-2 space-y-1">
            {sections.map((section, sectionIndex) => (
              <div key={section.title}>
                {sectionIndex > 0 && (
                  <div className="my-2 border-t border-border" />
                )}
                <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-textMain-secondary/60 select-none">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <DrawerNavItem
                      key={item.id}
                      item={item}
                      isActive={isActive(item.path)}
                      onClick={handleNavItem}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-3 py-3 border-t border-border">
          <button
            id="drawer-logout"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/8 dark:hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:ring-offset-1 focus:ring-offset-surface"
            onClick={() => {
              close();
              // TODO: wire up actual logout
            }}
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
