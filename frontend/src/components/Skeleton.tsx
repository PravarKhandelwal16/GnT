import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div 
      className={`animate-pulse bg-border/40 rounded-xl ${className}`} 
      aria-hidden="true" 
    />
  );
};

export const MarketCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-card rounded-2xl shadow-soft border border-border overflow-hidden">
      {/* Image placeholder */}
      <Skeleton className="w-full aspect-[4/3] rounded-none rounded-t-2xl" />
      
      {/* Content placeholder */}
      <div className="p-5 flex flex-col gap-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-2 flex gap-2">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
};
