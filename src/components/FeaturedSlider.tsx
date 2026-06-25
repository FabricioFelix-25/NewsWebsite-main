import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Article } from '../types';

interface FeaturedSliderProps {
  articles: Article[];
}

const FeaturedSlider: React.FC<FeaturedSliderProps> = ({ articles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentIndex, articles.length]);

  const goToPrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === 0 ? articles.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === articles.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  if (!articles.length) return null;

  return (
    <div className="relative h-[500px] md:h-[600px] overflow-hidden rounded-xl shadow-lg mb-8">
      {articles.map((article, index) => (
        <div
          key={article.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentIndex ? 'translate-x-0' : index < currentIndex ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div className="relative h-full w-full">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
              <div className="mb-2">
                <Link 
                  to={`/category/${article.category}`}
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-opacity-70`}
                  style={{ backgroundColor: `rgb(var(--section-primary))` }}
                >
                  {article.category}
                </Link>
                <span className="ml-2 text-sm text-neutral-300">{new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold mb-2">
                <Link to={`/article/${article.slug}`} className="hover:underline">
                  {article.title}
                </Link>
              </h2>
              <p className="text-neutral-200 mb-4 line-clamp-2 md:line-clamp-3">
                {article.excerpt}
              </p>
              <Link 
                to={`/article/${article.slug}`} 
                className="inline-block px-4 py-2 rounded-md font-medium bg-white text-black hover:bg-opacity-90 transition-colors duration-200"
              >
                Read More
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <button
        onClick={goToPrev}
        className="absolute top-1/2 left-4 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors duration-200"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute top-1/2 right-4 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors duration-200"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicator dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {articles.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-200 ${
              index === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedSlider;