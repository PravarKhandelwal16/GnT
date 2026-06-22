import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MarketProductCard } from '../components/MarketProductCard';
import { Search, SlidersHorizontal, Monitor, Home, Shirt, Dumbbell, BookOpen, PlusSquare, Bell, User, Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

const CATEGORIES = [
  { name: 'All Items', icon: null },
  { name: 'Electronics', icon: Monitor },
  { name: 'Home', icon: Home },
  { name: 'Fashion', icon: Shirt },
  { name: 'Sports', icon: Dumbbell },
  { name: 'Books', icon: BookOpen },
];

const ITEMS = [
  { 
    id: 1, 
    title: 'Vintage Espresso Maker', 
    credits: 120, 
    location: 'Portland, OR', 
    condition: 'Excellent Condition', 
    image: 'https://images.unsplash.com/photo-1510227272981-87123e259b17?q=80&w=2940&auto=format&fit=crop' 
  },
  { 
    id: 2, 
    title: 'Mid-Century Lounge Chair', 
    credits: 450, 
    location: 'Seattle, WA', 
    condition: 'Good - Minor Wear', 
    image: 'https://images.unsplash.com/photo-1506898667547-42e22a46e125?q=80&w=2806&auto=format&fit=crop' 
  },
  { 
    id: 3, 
    title: 'Custom Mechanical Keyboard', 
    credits: 85, 
    location: 'Austin, TX', 
    condition: 'Like New', 
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=2942&auto=format&fit=crop' 
  },
  { 
    id: 4, 
    title: 'Sony A7III Mirrorless Camera', 
    credits: 1200, 
    location: 'New York, NY', 
    condition: 'Excellent Condition', 
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=3000&auto=format&fit=crop' 
  },
  { 
    id: 5, 
    title: 'Large Potted Monstera', 
    credits: 25, 
    location: 'Denver, CO', 
    condition: 'Thriving', 
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=2864&auto=format&fit=crop' 
  },
  { 
    id: 6, 
    title: 'Vintage Denim Jacket', 
    credits: 60, 
    location: 'Chicago, IL', 
    condition: 'Good - Worn In', 
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=2787&auto=format&fit=crop' 
  },
];

export const Market: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All Items');
  const { theme, toggleTheme } = useDarkMode();

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-border transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold text-primary">Give & Take</Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <button onClick={toggleTheme} className="p-2 text-textMain-secondary hover:text-textMain transition-colors bg-surface border border-border rounded-full shadow-sm hover:bg-card">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button className="p-2 text-textMain-secondary hover:text-textMain transition-colors bg-surface border border-border rounded-full shadow-sm hover:bg-card">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 text-textMain-secondary hover:text-textMain transition-colors bg-surface border border-border rounded-full shadow-sm hover:bg-card">
                <PlusSquare className="h-5 w-5" />
              </button>
              <button className="p-2 text-textMain-secondary hover:text-textMain transition-colors bg-surface border border-border rounded-full shadow-sm hover:bg-card relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-surface shadow-[0_0_8px_rgba(91,124,250,0.8)]"></span>
              </button>
              <button className="p-2 text-textMain-secondary hover:text-textMain transition-colors bg-surface border border-border rounded-full shadow-sm hover:bg-card">
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Search Bar */}
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-textMain-secondary" />
          </div>
          <input 
            type="text" 
            className="block w-full pl-12 pr-14 py-4 bg-card border border-border rounded-[20px] text-lg shadow-soft hover:shadow-soft-hover focus:ring-2 focus:ring-primary/50 focus:border-primary text-textMain placeholder-textMain-secondary transition-all duration-300 outline-none"
            placeholder="What are you looking for today?"
          />
          <div className="absolute inset-y-0 right-2 flex items-center">
            <button className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors">
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.name;
            return (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 flex items-center gap-2 border shadow-sm ${
                  isActive 
                    ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(91,124,250,0.3)]' 
                    : 'bg-surface text-textMain-secondary border-border hover:bg-card hover:text-textMain'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
          {ITEMS.map(product => (
            <MarketProductCard key={product.id} {...product} />
          ))}
        </div>
      </main>
    </div>
  );
};
