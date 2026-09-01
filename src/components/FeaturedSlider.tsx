import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Article } from '../types';
import { getCategoryLabel } from '../utils/categoryColors';

interface FeaturedSliderProps {
  articles: Article[];
}

const FeaturedSlider: React.FC<FeaturedSliderProps> = ({ articles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? articles.length - 1 : prev - 1));
  }, [articles.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === articles.length - 1 ? 0 : prev + 1));
  }, [articles.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (articles.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      goToNext();
    }, 6000);

    return () => clearInterval(interval);
  }, [articles.length, isPaused, goToNext]);

  if (!articles.length) return null;

  return (
    <div 
      className="relative h-[420px] sm:h-[480px] md:h-[540px] lg:h-[580px] overflow-hidden rounded-2xl shadow-xl mb-10 group bg-neutral-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {articles.map((article, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={article.id || index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
            }`}
          >
            <div className="relative h-full w-full">
              <img
                src={article.imageUrl || 'https://placehold.co/1200x600?text=AlpesNews'}
                alt={article.title}
                loading={isActive ? 'eager' : 'lazy'}
                decoding="async"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/1200x600?text=AlpesNews';
                }}
                className="h-full w-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              
              {/* High-contrast gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 via-45% to-black/20" />

              {/* Text content container */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-10 text-white flex flex-col justify-end max-w-4xl">
                <div className="flex items-center gap-3 mb-3">
                  <Link 
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
                  <Link to={`/article/${article.slug}`} className="hover:text-neutral-200 transition-colors">
                    {article.title}
                  </Link>
                </h2>

                <p className="text-neutral-300 text-xs sm:text-sm md:text-base mb-4 line-clamp-2 md:line-clamp-3 leading-relaxed hidden sm:block max-w-3xl">
                  {article.excerpt}
                </p>

                <div className="pt-1">
                  <Link 
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
            {articles.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
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