import React from 'react';
import { Search, Bell, Wallet, User, Moon, Sun } from 'lucide-react';
import { Button } from './Button';
import { useDarkMode } from '../hooks/useDarkMode';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useDarkMode();

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <span className="text-xl font-bold text-primary">Give & Take</span>
          </div>
          
          <div className="flex-1 max-w-lg px-8">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-textMain-secondary group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-2.5 bg-background border border-border rounded-xl leading-5 text-textMain placeholder-textMain-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-all shadow-sm"
                placeholder="Search products..."
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="icon">
              <Wallet className="h-5 w-5" />
            </Button>
            <div className="relative">
              <Button variant="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-surface shadow-[0_0_8px_rgba(91,124,250,0.8)]"></span>
            </div>
            <Button variant="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
