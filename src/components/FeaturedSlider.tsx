import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, Pause, Play } from 'lucide-react';
import { Article } from '../types';
import { getCategoryLabel } from '../utils/categoryColors';

interface FeaturedSliderProps {
  articles: Article[];
}

const FeaturedSlider: React.FC<FeaturedSliderProps> = ({ articles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(() => new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  const activeIndex = articles.length ? currentIndex % articles.length : 0;

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev + articles.length - 1) % articles.length);
  }, [articles.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % articles.length);
  }, [articles.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (articles.length <= 1 || isPaused || isInteracting || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const interval = setInterval(() => {
      if (!document.hidden) goToNext();
    }, 6000);

    return () => clearInterval(interval);
  }, [articles.length, isPaused, isInteracting, goToNext]);

  if (!articles.length) return null;

  return (
    <div
      className="featured-frame relative overflow-hidden rounded-2xl shadow-xl group bg-neutral-900"
      role="region"
      aria-label="Notícias em destaque"
      aria-roledescription="carrossel"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocusCapture={() => setIsInteracting(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsInteracting(false); }}
    >
      {articles.map((article, index) => {
        const isActive = index === activeIndex;
        const activeImage = articles[activeIndex].imageUrl;
        const activeReady = !activeImage || loadedImages.has(activeImage) || failedImages.has(activeImage);
        // Só o destaque atual e o próximo disputam a rede; os demais aguardam a navegação.
        const shouldLoad = isActive || loadedImages.has(article.imageUrl) || (activeReady && index === (activeIndex + 1) % articles.length);
        const hasImage = Boolean(article.imageUrl && !failedImages.has(article.imageUrl));
        return (
          <div
            key={article.id || index}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
            }`}
          >
            <div className="relative h-full w-full">
              {shouldLoad && hasImage && <img
                src={article.imageUrl}
                alt={article.title}
                width={1280}
                height={720}
                fetchPriority={isActive ? 'high' : 'low'}
                loading={isActive ? 'eager' : 'lazy'}
                decoding="async"
                onLoad={() => setLoadedImages(previous => new Set(previous).add(article.imageUrl))}
                onError={() => setFailedImages(previous => new Set(previous).add(article.imageUrl))}
                className={`h-full w-full object-cover transition-opacity duration-500 ${loadedImages.has(article.imageUrl) ? 'opacity-100' : 'opacity-0'}`}
              />}

              {/* High-contrast gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 via-45% to-black/20" />

              {/* Text content container */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-10 text-white flex flex-col justify-end max-w-4xl">
                <div className="flex items-center gap-3 mb-3">
                  <Link
                    tabIndex={isActive ? 0 : -1}
                    to={`/category/${article.category}`}
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors duration-200"
                  >
                    {getCategoryLabel(article.category)}
                  </Link>
                  <span className="flex items-center text-xs sm:text-sm text-neutral-300">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {new Date(article.publishedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3 line-clamp-2 md:line-clamp-3 leading-tight drop-shadow-md">
                  <Link tabIndex={isActive ? 0 : -1} to={`/article/${article.slug}`} className="hover:text-neutral-200 transition-colors">
                    {article.title}
                  </Link>
                </h2>

                <p className="text-neutral-300 text-xs sm:text-sm md:text-base mb-4 line-clamp-2 md:line-clamp-3 leading-relaxed hidden sm:block max-w-3xl">
                  {article.excerpt}
                </p>

                <div className="pt-1">
                  <Link
                    tabIndex={isActive ? 0 : -1}
                    to={`/article/${article.slug}`}
                    className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold bg-white text-neutral-900 hover:bg-neutral-100 hover:shadow-lg transition-all duration-200"
                  >
                    Ler matéria completa
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation arrows (shown when multiple slides) */}
      {articles.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute top-1/2 left-3 sm:left-4 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white transition-all duration-200 z-20 opacity-80 hover:opacity-100 hover:scale-110"
            aria-label="Notícia anterior"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute top-1/2 right-3 sm:right-4 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white transition-all duration-200 z-20 opacity-80 hover:opacity-100 hover:scale-110"
            aria-label="Próxima notícia"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Indicator dots */}
          <div className="absolute bottom-4 right-6 sm:right-10 flex space-x-2 z-20">
            <button type="button" onClick={() => setIsPaused(value => !value)} className="text-white p-1 -mt-1 rounded bg-black/30" aria-label={isPaused ? 'Retomar destaques' : 'Pausar destaques'}>
              {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </button>
            {articles.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
                aria-current={index === activeIndex ? 'true' : undefined}
                aria-label={`Ir para destaque ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FeaturedSlider;
