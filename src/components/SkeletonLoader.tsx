import React from 'react';

export const ArticleCardSkeleton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <div className={`article-card animate-pulse bg-white rounded-xl border border-neutral-200/80 overflow-hidden ${compact ? 'flex flex-row gap-3 p-3' : 'flex flex-col'}`}>
      {/* Image placeholder */}
      <div className={`${compact ? 'w-28 h-20 rounded-lg flex-shrink-0' : 'aspect-video w-full'} bg-neutral-200 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      </div>

      {/* Content placeholder */}
      <div className={`${compact ? 'flex-1 py-1' : 'p-4'} flex flex-col justify-between`}>
        <div>
          {/* Badge & Date */}
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-16 bg-neutral-200 rounded-full" />
            <div className="h-3 w-12 bg-neutral-200 rounded" />
          </div>

          {/* Title */}
          <div className="h-5 bg-neutral-200 rounded w-full mb-2" />
          <div className="h-5 bg-neutral-200 rounded w-3/4 mb-3" />

          {/* Excerpt */}
          {!compact && (
            <div className="space-y-1.5 mb-4 hidden sm:block">
              <div className="h-3.5 bg-neutral-100 rounded w-full" />
              <div className="h-3.5 bg-neutral-100 rounded w-5/6" />
            </div>
          )}
        </div>

        {/* Author */}
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 mt-auto">
          <div className="h-7 w-7 rounded-full bg-neutral-200" />
          <div className="h-3.5 w-24 bg-neutral-200 rounded" />
        </div>
      </div>
    </div>
  );
};

export const SliderSkeleton: React.FC = () => {
  return (
    <div className="relative h-[420px] md:h-[500px] lg:h-[540px] w-full rounded-2xl overflow-hidden bg-neutral-800 animate-pulse mb-8 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 space-y-3 max-w-3xl">
        <div className="flex items-center gap-3">
          <div className="h-6 w-24 bg-neutral-700 rounded-full" />
          <div className="h-4 w-20 bg-neutral-700 rounded" />
        </div>
        <div className="h-8 md:h-12 bg-neutral-700 rounded-lg w-full" />
        <div className="h-8 md:h-12 bg-neutral-700 rounded-lg w-4/5" />
        <div className="h-4 bg-neutral-800 rounded w-full hidden md:block" />
        <div className="h-4 bg-neutral-800 rounded w-2/3 hidden md:block" />
        <div className="pt-2">
          <div className="h-10 w-32 bg-neutral-700 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const ArticleGridSkeleton: React.FC<{ count?: number; columns?: number }> = ({ 
  count = 6, 
  columns = 3 
}) => {
  const gridColsClass = 
    columns === 1 
      ? 'grid-cols-1' 
      : columns === 2 
        ? 'grid-cols-1 md:grid-cols-2' 
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <div className="h-7 w-48 bg-neutral-200 rounded animate-pulse" />
        <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse" />
      </div>
      <div className={`grid ${gridColsClass} gap-6`}>
        {Array.from({ length: count }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
