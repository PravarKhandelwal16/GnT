import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { getSavedProducts } from '../api/engagement';
import type { ProductListItem } from '../api/products';
import { PageHeader, PageShell } from '../components/Layout';
import { ProductCard, ProductCardSkeleton, ProductGrid } from '../components/ProductCard';
import { EmptyState, ErrorState, buttonClasses } from '../components/ui';

const Saved: React.FC = () => {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const load = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    getSavedProducts()
      .then((page) => setProducts(page.content))
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <PageShell>
      <PageHeader eyebrow="Keeping an eye on" title="Saved items" />
      {isLoading ? (
        <ProductGrid>
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </ProductGrid>
      ) : isError ? (
        <ErrorState message="We couldn't load your saved items." onRetry={load} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Bookmark size={22} />}
          title="Nothing saved yet"
          description="Tap the bookmark on any item to keep it here."
          action={<Link to="/market" className={buttonClasses('primary')}>Browse the market</Link>}
        />
      ) : (
        <ProductGrid>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ProductGrid>
      )}
    </PageShell>
  );
};

export default Saved;
