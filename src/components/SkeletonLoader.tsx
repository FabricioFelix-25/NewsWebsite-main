import React from 'react';

export const ArticleCardSkeleton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <div aria-hidden="true" className={`article-card animate-pulse bg-white rounded-xl border border-neutral-200/80 overflow-hidden ${compact ? 'flex flex-row gap-3 p-3' : 'flex flex-col h-full'}`}>
      {/* Image placeholder */}
      <div className={`${compact ? 'w-24 h-20 sm:w-28 sm:h-24 rounded-lg flex-shrink-0' : 'aspect-video w-full'} bg-neutral-200`} />

      {/* Content placeholder */}
      <div className={`${compact ? 'flex-1 py-1' : 'p-4 sm:p-5 flex-1'} flex flex-col`}>
        <div>
          {/* Badge & Date */}
          <div className="flex items-center gap-2 mb-2.5 h-[21px]">
            <div className="h-4 w-16 bg-neutral-200 rounded-full" />
            <div className="h-3 w-12 bg-neutral-200 rounded" />
          </div>

          {/* Title */}
          <div className="h-[45px] sm:h-[50px] mb-2 space-y-2">
            <div className="h-4 bg-neutral-200 rounded w-full" />
            <div className="h-4 bg-neutral-200 rounded w-3/4" />
          </div>

          {/* Excerpt */}
          {!compact && (
            <div className="space-y-1.5 mb-4 h-[45.5px] sm:h-[68.25px]">
              <div className="h-3.5 bg-neutral-100 rounded w-full" />
              <div className="h-3.5 bg-neutral-100 rounded w-5/6" />
              <div className="h-3.5 bg-neutral-100 rounded w-2/3 hidden sm:block" />
            </div>
          )}
        </div>

        {/* Author */}
        <div className="flex items-center gap-2 pt-3 border-t border-neutral-100 mt-auto">
          <div className="h-7 w-7 rounded-full bg-neutral-200" />
          <div className="h-3.5 w-24 bg-neutral-200 rounded" />
        </div>
      </div>
    </div>
  );
};

export const SliderSkeleton: React.FC = () => {
  return (
    <div aria-hidden="true" className="featured-frame relative w-full rounded-2xl overflow-hidden bg-neutral-800 animate-pulse shadow-lg">
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

export const ArticleGridSkeleton: React.FC<{ count?: number; columns?: number; showTitle?: boolean }> = ({
  count = 6,
  columns = 3,
  showTitle = true
}) => {
  const gridColsClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : columns === 4
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="mb-12" aria-hidden="true">
      {showTitle && <div className="flex justify-between items-center mb-6 h-7 sm:h-8">
        <div className="h-7 w-48 bg-neutral-200 rounded animate-pulse" />
        <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse" />
      </div>}
      <div className={`grid ${gridColsClass} gap-6`}>
        {Array.from({ length: count }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
