import React from 'react';
import { Search, Bell, Moon, Sun, PlusSquare, Wallet } from 'lucide-react';
import { Button } from './Button';
import { useDarkMode } from '../hooks/useDarkMode';
import { useNavigate, Link } from 'react-router-dom';
import { ProfileDropdown } from './ProfileDropdown';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useDarkMode();
  const navigate = useNavigate();

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
          <div className="flex-1 max-w-lg px-8">
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
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button variant="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Add item */}
            <Button variant="primary" className="hidden sm:flex">
              <PlusSquare className="w-4 h-4 mr-2" />
              Add Item
            </Button>

            {/* Wallet icon */}
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
          </div>
        </div>
      </div>
    </header>
  );
};
