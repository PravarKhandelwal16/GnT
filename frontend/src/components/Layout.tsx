import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  Bell,
  Bookmark,
  ChevronDown,
  HelpCircle,
  ShieldCheck,
  LayoutList,
  LogOut,
  Moon,
  Plus,
  Search,
  Sun,
  User,
  Wallet,
} from 'lucide-react';
import { getMyTransactions, isOpen } from '../api/transactions';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import { useTheme } from '../context/ThemeContext';
import { Avatar, Button, Credits, Logo, buttonClasses } from './ui';

const ICON_BUTTON =
  'relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-textMain-secondary transition-colors hover:bg-textMain/5 hover:text-textMain';

const SearchBox: React.FC<{ id: string; className?: string }> = ({ id, className = '' }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  return (
    <form
      role="search"
      className={`relative ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        navigate(query.trim() ? `/market?query=${encodeURIComponent(query.trim())}` : '/market');
      }}
    >
      <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-textMain-secondary" />
      <input
        id={id}
        type="search"
        aria-label="Search items"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search items, places…"
        className="field rounded-full pl-10"
      />
    </form>
  );
};

const ProfileMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  const links = [
    ...(user.role !== 'USER' ? [{ to: '/admin', label: user.role === 'ADMIN' ? 'Owner workspace' : 'Team workspace', icon: ShieldCheck }] : []),
    { to: '/add-item', label: 'List an item', icon: Plus },
    { to: '/account', label: 'My account', icon: User },
    { to: '/orders', label: 'Exchanges', icon: ArrowLeftRight },
    { to: '/listings', label: 'My listings', icon: LayoutList },
    { to: '/saved', label: 'Saved items', icon: Bookmark },
    { to: '/wallet', label: 'Wallet', icon: Wallet },
    { to: '/help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <div ref={containerRef} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-1 rounded-full p-1 transition-colors hover:bg-textMain/5"
      >
        <Avatar name={user.name} image={user.profileImage} size="h-8 w-8 text-xs" />
        <ChevronDown size={14} className={`hidden text-textMain-secondary transition-transform sm:block ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div role="menu" className="panel animate-modal-in absolute right-0 top-full z-40 mt-2 w-60 overflow-hidden p-1.5 shadow-soft-hover">
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-textMain-secondary">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-border" />
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              role="menuitem"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-textMain/5"
            >
              <Icon size={15} className="text-textMain-secondary" />
              {label}
            </Link>
          ))}
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
          >
            <LogOut size={15} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
};

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { requireAuth } = useAuthModal();
  const navigate = useNavigate();
  const location = useLocation();
  const [openExchanges, setOpenExchanges] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setOpenExchanges(0);
      return;
    }
    getMyTransactions(0, 20)
      .then((page) => setOpenExchanges(page.content.filter((tx) => isOpen(tx.status)).length))
      .catch(() => setOpenExchanges(0));
  }, [isAuthenticated, location.pathname]);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-textMain ${isActive ? 'text-textMain' : 'text-textMain-secondary'}`;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-page items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <Logo className="flex-shrink-0" />

        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          <NavLink to="/market" className={navClass}>
            Market
          </NavLink>
          <NavLink to="/help" className={navClass}>
            How it works
          </NavLink>
        </nav>

        <SearchBox id="navbar-search" className="hidden flex-1 md:block md:max-w-sm" />

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}
            className={ICON_BUTTON}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated && user ? (
            <>
              <Link to="/orders" aria-label={`Exchanges, ${openExchanges} open`} className={ICON_BUTTON}>
                <Bell size={18} />
                {openExchanges > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-card">
                    {openExchanges}
                  </span>
                )}
              </Link>
              <Link
                to="/wallet"
                aria-label="Wallet"
                className="hidden h-10 items-center rounded-full border border-border bg-card px-3.5 text-sm transition-colors hover:border-primary/40 sm:inline-flex"
              >
                <Credits value={user.creditBalance} />
              </Link>
              <Button
                size="sm"
                className="hidden h-10 sm:inline-flex"
                onClick={() => requireAuth() && navigate('/add-item')}
              >
                <Plus size={16} />
                List an item
              </Button>
              <ProfileMenu />
            </>
          ) : (
            !isLoading && (
              <>
                <Link to="/login" className={buttonClasses('ghost', 'sm', 'h-10')}>
                  Log in
                </Link>
                <Link to="/signup" className={buttonClasses('primary', 'sm', 'h-10')}>
                  Join
                </Link>
              </>
            )
          )}
        </div>
      </div>
      <div className="px-4 pb-3 md:hidden">
        <SearchBox id="navbar-search-mobile" />
      </div>
    </header>
  );
};

export const Footer: React.FC = () => (
  <footer className="mt-20 border-t border-border">
    <div className="mx-auto flex max-w-page flex-col gap-8 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
      <div className="max-w-xs">
        <Logo />
        <p className="mt-3 text-sm leading-relaxed text-textMain-secondary">
          Good things deserve a second home. Pass them on and earn credits for what you need next.
        </p>
      </div>
      <nav aria-label="Footer" className="flex gap-12 text-sm">
        <div className="flex flex-col gap-2.5">
          <Link to="/market" className="text-textMain-secondary hover:text-textMain">Market</Link>
          <Link to="/help" className="text-textMain-secondary hover:text-textMain">How it works</Link>
        </div>
        <div className="flex flex-col gap-2.5">
          <Link to="/terms" className="text-textMain-secondary hover:text-textMain">Terms</Link>
          <Link to="/privacy" className="text-textMain-secondary hover:text-textMain">Privacy</Link>
        </div>
      </nav>
    </div>
  </footer>
);

export const PageShell: React.FC<{ children: React.ReactNode; width?: string; className?: string }> = ({
  children,
  width = 'max-w-page',
  className = '',
}) => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className={`mx-auto w-full flex-1 px-4 py-8 sm:px-6 sm:py-10 ${width} ${className}`}>{children}</main>
    <Footer />
  </div>
);

export const PageHeader: React.FC<{
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ eyebrow, title, description, action }) => (
  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h1 className="display text-4xl sm:text-[2.75rem] sm:leading-[1.1]">{title}</h1>
      {description && <p className="mt-2 max-w-xl text-textMain-secondary">{description}</p>}
    </div>
    {action}
  </div>
);
