import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  List,
  ShoppingBag,
  ArrowLeftRight,
  Bell,
  Bookmark,
  Moon,
  HelpCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { useAuth } from '../hooks/useAuth';

/* ─────────────────────── types ─────────────────────── */

interface DropdownItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  newWindow?: boolean;
  badge?: number;
  action?: () => void;
  danger?: boolean;
  dividerBefore?: boolean;
}

/* ─────────────────────── component ─────────────────────── */

export const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toggleTheme } = useDarkMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = () => setIsOpen((prev) => !prev);

  /* ── Close on click-outside ── */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, close]);

  /* ── Close on Escape ── */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  /* ── Close on route change ── */
  useEffect(() => {
    close();
  }, [location.pathname, close]);

  const handleItem = (item: DropdownItem) => {
    if (item.action) {
      item.action();
      return;
    }
    if (item.path) {
      if (item.newWindow) {
        window.open(item.path, '_blank', 'noopener,noreferrer');
      } else {
        navigate(item.path);
      }
      close();
    }
  };

  const isActive = (path?: string) => !!path && location.pathname === path;

  const handleLogout = () => {
    close();
    logout();
    navigate('/');
  };

  const items: DropdownItem[] = [
    {
      id: 'my-account',
      label: 'My Account',
      icon: <User size={15} />,
      path: '/account',
    },
    {
      id: 'my-listings',
      label: 'My Listings',
      icon: <List size={15} />,
      path: '/listings',
      badge: 12,
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <ShoppingBag size={15} />,
      path: '/orders',
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <ArrowLeftRight size={15} />,
      path: '/wallet',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell size={15} />,
      path: '/notifications',
      badge: 3,
      dividerBefore: true,
    },
    {
      id: 'saved-items',
      label: 'Saved Items',
      icon: <Bookmark size={15} />,
      path: '/saved',
    },
    {
      id: 'dark-mode',
      label: 'Dark Mode',
      icon: <Moon size={15} />,
      action: toggleTheme,
      dividerBefore: true,
    },
    {
      id: 'help-support',
      label: 'Help & Support',
      icon: <HelpCircle size={15} />,
      path: '/help',
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: <LogOut size={15} />,
      danger: true,
      dividerBefore: true,
      action: handleLogout,
    },
  ];

  if (!user) return null;

  return (
    <div ref={containerRef} className="relative">
      {/* ── Trigger ── */}
      <button
        id="navbar-profile-avatar"
        onClick={toggle}
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-surface/50 border border-border hover:bg-card hover:border-primary/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background group"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-primary font-bold text-xs select-none">{user.initials}</span>
        </div>
        <span className="hidden sm:flex items-center gap-1 text-sm font-medium text-textMain group-hover:text-primary transition-colors">
          {user.shortName}
          <svg
            className={[
              'w-3.5 h-3.5 text-textMain-secondary group-hover:text-primary transition-all duration-200',
              isOpen ? 'rotate-180' : 'rotate-0',
            ].join(' ')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* ── Dropdown panel ── */}
      <div
        role="menu"
        aria-label="Account menu"
        className={[
          'absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-2xl shadow-soft overflow-hidden',
          'transition-all duration-200 origin-top-right',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-1 pointer-events-none',
        ].join(' ')}
      >
        {/* Profile header */}
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-textMain truncate">{user.name}</p>
          <p className="text-xs text-textMain-secondary truncate mt-0.5">{user.email}</p>
        </div>

        {/* Menu items */}
        <div className="py-1.5">
          {items.map((item) => (
            <React.Fragment key={item.id}>
              {item.dividerBefore && (
                <div className="my-1 border-t border-border mx-3" />
              )}
              <button
                id={`profile-menu-${item.id}`}
                role="menuitem"
                onClick={() => handleItem(item)}
                className={[
                  'w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors duration-150 group',
                  item.danger
                    ? 'text-rose-500 hover:bg-rose-500/8 dark:hover:bg-rose-500/10'
                    : isActive(item.path)
                    ? 'bg-primary/8 text-primary dark:bg-primary/12'
                    : 'text-textMain hover:bg-card',
                ].join(' ')}
              >
                <span
                  className={[
                    'flex-shrink-0 transition-colors duration-150',
                    item.danger
                      ? 'text-rose-500'
                      : isActive(item.path)
                      ? 'text-primary'
                      : 'text-textMain-secondary group-hover:text-textMain',
                  ].join(' ')}
                >
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary/15 text-primary text-[10px] font-semibold">
                    {item.badge}
                  </span>
                )}
                {!item.danger && !item.badge && item.path && (
                  <ChevronRight
                    size={12}
                    className="text-textMain-secondary/0 group-hover:text-textMain-secondary/50 transition-all duration-150 group-hover:translate-x-0.5"
                  />
                )}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
