import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import type { ProductListItem } from '../api/products';
import { conditionLabel } from '../lib/catalog';
import { Credits, ProductImage, Skeleton } from './ui';

export const ProductCard: React.FC<{ product: ProductListItem }> = ({ product }) => (
  <Link to={`/product/${product.id}`} className="group flex flex-col">
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
      <ProductImage
        src={product.primaryMediaUrl}
        alt={product.title}
        className="aspect-[4/5] w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      <span className="absolute bottom-3 left-3 rounded-full bg-card/95 px-3 py-1.5 text-sm shadow-soft backdrop-blur">
        <Credits value={product.creditValue} size={14} />
      </span>
    </div>
    <h3 className="mt-3 truncate font-medium transition-colors group-hover:text-primary">{product.title}</h3>
    <p className="mt-1 flex min-w-0 items-center gap-1 text-sm text-textMain-secondary">
      <MapPin size={13} className="flex-shrink-0" />
      <span className="truncate">
        {product.city} · {conditionLabel(product.condition)}
      </span>
    </p>
  </Link>
);

export const ProductCardSkeleton: React.FC = () => (
  <div>
    <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
    <Skeleton className="mt-3 h-5 w-3/4" />
    <Skeleton className="mt-2 h-4 w-1/2" />
  </div>
);

export const ProductGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">{children}</div>
);
