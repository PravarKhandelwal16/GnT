import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getProducts } from '../api/products';
import type { Category, Condition, ProductListItem } from '../api/products';
import { PageHeader, PageShell } from '../components/Layout';
import { ProductCard, ProductCardSkeleton, ProductGrid } from '../components/ProductCard';
import { Button, EmptyState, ErrorState } from '../components/ui';
import { useAuthModal } from '../context/AuthModalContext';
import { CATEGORIES, CONDITIONS } from '../lib/catalog';

const SORTS = [
  { value: 'createdAt,desc', label: 'Newest first' },
  { value: 'creditValue,asc', label: 'Credits: low to high' },
  { value: 'creditValue,desc', label: 'Credits: high to low' },
];

const PAGE_SIZE = 12;

const Market: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { requireAuth } = useAuthModal();

  const category = (params.get('category') ?? '') as Category | '';
  const condition = (params.get('condition') ?? '') as Condition | '';
  const query = params.get('query') ?? '';
  const sort = params.get('sort') ?? SORTS[0].value;

  const [searchText, setSearchText] = useState(query);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);
  const latestRequest = useRef(0);

  const updateParam = useCallback(
    (key: string, value: string) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (value) next.set(key, value);
          else next.delete(key);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  useEffect(() => {
    setSearchText(query);
  }, [query]);

  useEffect(() => {
    if (searchText === query) return;
    const timer = setTimeout(() => updateParam('query', searchText.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchText, query, updateParam]);

  const load = useCallback(
    async (pageNumber: number) => {
      const request = ++latestRequest.current;
      if (pageNumber === 0) setIsLoading(true);
      else setLoadingMore(true);
      setIsError(false);

      try {
        const result = await getProducts({
          category: category || undefined,
          condition: condition || undefined,
          query: query || undefined,
          page: pageNumber,
          size: PAGE_SIZE,
          sort,
        });
        // A slower, older response must not replace newer results.
        if (request !== latestRequest.current) return;
        setProducts((current) => (pageNumber === 0 ? result.content : [...current, ...result.content]));
        setTotal(result.totalElements);
        setHasMore(!result.last);
        setPage(result.number);
      } catch {
        if (request === latestRequest.current) setIsError(true);
      } finally {
        if (request === latestRequest.current) {
          setIsLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [category, condition, query, sort],
  );

  useEffect(() => {
    load(0);
  }, [load]);

  const hasFilters = Boolean(category || condition || query);

  return (
    <PageShell>
      <PageHeader
        eyebrow="The market"
        title="Find its next chapter"
        description="Everything here is priced in credits and collected in person."
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-textMain-secondary" />
          <input
            id="market-search"
            type="search"
            aria-label="Search the market"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by item or city"
            className="field h-12 rounded-full pl-11"
          />
        </div>
        <select
          aria-label="Condition"
          value={condition}
          onChange={(e) => updateParam('condition', e.target.value)}
          className="field h-12 rounded-full sm:w-44"
        >
          <option value="">Any condition</option>
          {CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort by"
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value === SORTS[0].value ? '' : e.target.value)}
          className="field h-12 rounded-full sm:w-52"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="scroll-row -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          type="button"
          aria-pressed={!category}
          onClick={() => updateParam('category', '')}
          className={`chip ${category ? 'chip-idle' : 'chip-active'}`}
        >
          All
        </button>
        {CATEGORIES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            aria-pressed={category === value}
            onClick={() => updateParam('category', value)}
            className={`chip ${category === value ? 'chip-active' : 'chip-idle'}`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <ProductGrid>
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </ProductGrid>
      ) : isError ? (
        <ErrorState message="We couldn't load the market just now." onRetry={() => load(0)} />
      ) : products.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description={
            hasFilters ? 'Try a broader search or clear a filter.' : 'Be the first to pass something on.'
          }
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={() => setParams({}, { replace: true })}>
                Clear filters
              </Button>
            ) : (
              <Button onClick={() => requireAuth() && navigate('/add-item')}>List an item</Button>
            )
          }
        />
      ) : (
        <>
          <p className="mb-5 text-sm text-textMain-secondary" aria-live="polite">
            {total} {total === 1 ? 'item' : 'items'}
          </p>
          <ProductGrid>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductGrid>
          {hasMore && (
            <div className="mt-12 flex justify-center">
              <Button variant="secondary" loading={loadingMore} onClick={() => load(page + 1)}>
                Show more
              </Button>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
};

export default Market;
