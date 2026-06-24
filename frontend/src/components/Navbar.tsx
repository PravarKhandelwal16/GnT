import React from 'react';
import { Search, Bell, Moon, Sun, PlusSquare, Wallet, LogIn } from 'lucide-react';
import { Button } from './Button';
import { useDarkMode } from '../hooks/useDarkMode';
import { Link, useNavigate } from 'react-router-dom';
import { ProfileDropdown } from './ProfileDropdown';
import { useAuth } from '../hooks/useAuth';
import { useAuthModal } from '../context/AuthModalContext';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useDarkMode();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthModal();

  const handleAddItem = () => {
    if (requireAuth()) navigate('/add-item');
  };

  return (
    <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ── Brand ── */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="text-xl font-bold text-primary hover:text-primary-hover transition-colors"
            >
              Give &amp; Take
            </Link>
          </div>

          {/* ── Search ── */}
          <div className="hidden md:block flex-1 max-w-lg px-8">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-textMain-secondary group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                id="navbar-search"
                className="block w-full pl-12 pr-4 py-2.5 bg-background border border-border rounded-xl leading-5 text-textMain placeholder-textMain-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-all shadow-sm"
                placeholder="Search products..."
              />
            </div>
          </div>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Theme toggle */}
            <Button variant="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {isAuthenticated ? (
              /* ── Authenticated state ── */
              <>
                <Button
                  variant="primary"
                  className="flex px-3 sm:px-4"
                  onClick={handleAddItem}
                  aria-label="Add Item"
                >
                  <PlusSquare className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add Item</span>
                </Button>

                {/* Wallet */}
                <Button
                  variant="icon"
                  onClick={() => navigate('/wallet')}
                  aria-label="Open wallet"
                >
                  <Wallet className="h-5 w-5" />
                </Button>

                {/* Notifications */}
                <div className="relative">
                  <Button variant="icon" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                  </Button>
                  <span
                    aria-hidden="true"
                    className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-surface shadow-[0_0_8px_rgba(91,124,250,0.8)]"
                  />
                </div>

                {/* Profile dropdown */}
                <ProfileDropdown />
              </>
            ) : (
              /* ── Guest state ── */
              <Link
                to="/login"
                id="navbar-login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              >
                <LogIn size={15} />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
