import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus } from 'lucide-react';
import { getMyProducts } from '../api/products';
import type { ProductListItem, ProductStatus } from '../api/products';
import { PageHeader, PageShell } from '../components/Layout';
import { Button, Credits, EmptyState, ErrorState, ProductImage, Skeleton, StatusBadge, buttonClasses } from '../components/ui';
import type { Tone } from '../components/ui';
import { categoryLabel } from '../lib/catalog';
import { formatDate } from '../lib/format';

const STATUS: Partial<Record<ProductStatus, { label: string; tone: Tone }>> = {
  ACTIVE: { label: 'Live', tone: 'primary' },
  LOCKED: { label: 'Reserved', tone: 'warning' },
  EXCHANGED: { label: 'Exchanged', tone: 'success' },
  PENDING_AI_REVIEW: { label: 'In review', tone: 'neutral' },
  DRAFT: { label: 'Draft', tone: 'neutral' },
  REJECTED: { label: 'Rejected', tone: 'danger' },
};

const MyListings: React.FC = () => {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);

  const load = useCallback(async (pageNumber: number) => {
    if (pageNumber === 0) setIsLoading(true);
    else setLoadingMore(true);
    setIsError(false);
    try {
      const result = await getMyProducts(pageNumber, 20);
      setProducts((current) => (pageNumber === 0 ? result.content : [...current, ...result.content]));
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
    load(0);
  }, [load]);

  const addButton = (
    <Link to="/add-item" className={buttonClasses('primary')}>
      <Plus size={16} /> List an item
    </Link>
  );

  return (
    <PageShell width="max-w-4xl">
      <PageHeader eyebrow="Your shelf" title="My listings" action={addButton} />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message="We couldn't load your listings." onRetry={() => load(0)} />
      ) : products.length === 0 ? (
        <EmptyState
          title="Nothing listed yet"
          description="List something you no longer use and earn 40% of its value straight away."
          action={addButton}
        />
      ) : (
        <ul className="space-y-3">
          {products.map((product) => {
            const status = STATUS[product.status];
            return (
              <li key={product.id}>
                <Link
                  to={`/product/${product.id}`}
                  className="panel group flex items-center gap-4 p-3 pr-4 transition-shadow hover:shadow-soft-hover"
                >
                  <ProductImage src={product.primaryMediaUrl} alt="" className="h-20 w-20 flex-shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate font-medium">{product.title}</h2>
                      {status && <StatusBadge tone={status.tone}>{status.label}</StatusBadge>}
                    </div>
                    <p className="mt-1 text-sm text-textMain-secondary">
                      {categoryLabel(product.category)} · {formatDate(product.createdAt)}
                    </p>
                    <div className="mt-1 text-sm">
                      <Credits value={product.creditValue} size={13} />
                    </div>
                  </div>
                  <ChevronRight size={18} className="flex-shrink-0 text-textMain-secondary transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {hasMore && !isLoading && (
        <div className="mt-8 flex justify-center">
          <Button variant="secondary" loading={loadingMore} onClick={() => load(page + 1)}>
            Show more
          </Button>
        </div>
      )}
    </PageShell>
  );
};

export default MyListings;
