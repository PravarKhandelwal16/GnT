import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MarketProductCard } from '../components/MarketProductCard';
import { Navbar } from '../components/Navbar';
import { MarketCardSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import {
  Search,
  SlidersHorizontal,
  Monitor,
  Home,
  Shirt,
  Dumbbell,
  BookOpen,
  Music,
  Utensils,
  Box,
} from 'lucide-react';
import { getProducts } from '../api/products';
import type { Category, ProductListItem } from '../api/products';

/* ─── Category map ─── */
type CategoryFilter = Category | 'ALL';

const CATEGORIES: Array<{ id: CategoryFilter; name: string; icon: React.ComponentType<{ className?: string }> | null }> = [
  { id: 'ALL', name: 'All Items', icon: null },
  { id: 'ELECTRONICS', name: 'Electronics', icon: Monitor },
  { id: 'HOME_AND_GARDEN', name: 'Home', icon: Home },
  { id: 'CLOTHING', name: 'Fashion', icon: Shirt },
  { id: 'SPORTS', name: 'Sports', icon: Dumbbell },
  { id: 'BOOKS', name: 'Books', icon: BookOpen },
  { id: 'MUSIC', name: 'Music', icon: Music },
  { id: 'KITCHEN', name: 'Kitchen', icon: Utensils },
  { id: 'OTHER', name: 'Other', icon: Box },
];

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'New',
  LIKE_NEW: 'Like New',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
};

export const Market: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') as CategoryFilter) || 'ALL';
  const initialQuery = searchParams.get('query') || '';

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>(initialCategory);
  const [search, setSearch] = useState(initialQuery);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchProducts = useCallback(async (category: CategoryFilter, pageNum: number, replace: boolean) => {
    try {
      if (replace) setIsLoading(true);
      else setLoadingMore(true);
      setIsError(false);

      const result = await getProducts({
        ...(category !== 'ALL' && { category: category as Category }),
        page: pageNum,
        size: 12,
      });

      setProducts((prev) => replace ? result.content : [...prev, ...result.content]);
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
    fetchProducts(activeCategory, 0, true);
  }, [activeCategory, fetchProducts]);

  const handleRetry = () => fetchProducts(activeCategory, 0, true);

  /* Client-side title search filter */
  const filtered = search.trim()
    ? products.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Search Bar */}
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-textMain-secondary" />
          </div>
          <input
            id="market-search"
            type="text"
            className="block w-full pl-12 pr-14 py-4 bg-card border border-border rounded-[20px] text-lg shadow-soft hover:shadow-soft-hover focus:ring-2 focus:ring-primary/50 focus:border-primary text-textMain placeholder-textMain-secondary transition-all duration-300 outline-none"
            placeholder="What are you looking for today?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                id={`market-cat-${category.id.toLowerCase()}`}
                onClick={() => setActiveCategory(category.id)}
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

        {/* Product Grid / States */}
        <div className="pt-2">
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <MarketCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!isLoading && isError && (
            <ErrorState
              onRetry={handleRetry}
              message="We couldn't fetch the market listings right now. Please check your connection and try again."
            />
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <EmptyState
              title="No Items Found"
              description="It looks like there aren't any items in this category yet. Be the first to list something!"
              actionLabel="List an Item"
              onAction={() => (window.location.href = '/add-item')}
            />
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((product) => (
                  <MarketProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    credits={product.creditValue}
                    location="View Details"
                    condition={CONDITION_LABELS[product.condition] ?? product.condition}
                    image={product.primaryMediaUrl ?? `https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop`}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-10">
                  <button
                    id="market-load-more"
                    onClick={() => fetchProducts(activeCategory, page + 1, false)}
                    disabled={loadingMore}
                    className="px-8 py-3 bg-card border border-border rounded-full text-sm font-medium text-textMain hover:border-primary/30 hover:text-primary transition-all disabled:opacity-60"
                  >
                    {loadingMore ? 'Loading…' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};
