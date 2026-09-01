import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Search, X, ChevronDown } from 'lucide-react';
import SearchBar from './SearchBar';

interface SubcategoryItem {
  name: string;
  slug: string;
}

interface CategoryItem {
  name: string;
  slug: string;
  color: 'tech' | 'geo' | 'prog' | 'games';
  subcategories: SubcategoryItem[];
}

const categories: CategoryItem[] = [
  {
    name: 'Tecnologia',
    slug: 'tech',
    color: 'tech',
    subcategories: [
      { name: 'IA', slug: 'ai' },
      { name: 'Gadgets', slug: 'gadgets' },
      { name: 'Internet', slug: 'internet' },
    ],
  },
  {
    name: 'Geopolitica',
    slug: 'geopolitics',
    color: 'geo',
    subcategories: [
      { name: 'Mercado Global', slug: 'global-market' },
      { name: 'Conflitos', slug: 'conflicts' },
      { name: 'Diplomacia', slug: 'diplomacy' },
    ],
  },
  {
    name: 'Programacao',
    slug: 'programming',
    color: 'prog',
    subcategories: [
      { name: 'Web', slug: 'web' },
      { name: 'Mobile', slug: 'mobile' },
      { name: 'DevOps', slug: 'devops' },
    ],
  },
  {
    name: 'Games',
    slug: 'games',
    color: 'games',
    subcategories: [
      { name: 'Console', slug: 'console' },
      { name: 'PC', slug: 'pc' },
      { name: 'Games Mobile', slug: 'mobile-gaming' },
    ],
  },
  {
    name: 'Em Alta',
    slug: 'trending',
    color: 'tech',
    subcategories: [
      { name: 'Noticias do Mundo', slug: 'world-news' },
      { name: 'Entretenimento', slug: 'entertainment' },
      { name: 'Estilo de Vida', slug: 'lifestyle' },
    ],
  },
];

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  const currentCategorySlug = location.pathname.match(/\/category\/([^/?#]+)/)?.[1] || '';

  const isCategoryActive = (category: CategoryItem): boolean =>
    currentCategorySlug === category.slug ||
    category.subcategories.some((subcategory) => subcategory.slug === currentCategorySlug);

  const navClass = `sticky top-0 z-50 transition-all duration-300 ${
    scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
  }`;

  const getCategoryStyle = (category: string, isActive: boolean, isMobile = false) => {
    const baseStyle = 'px-3 py-2 rounded-md transition-colors duration-200';

    if (isMobile || isActive) {
      switch (category) {
        case 'tech':
          return `${baseStyle} text-[rgb(var(--color-tech-primary))] bg-[rgb(var(--color-tech-primary)_/_0.1)]`;
        case 'geo':
          return `${baseStyle} text-[rgb(var(--color-geo-primary))] bg-[rgb(var(--color-geo-primary)_/_0.1)]`;
        case 'prog':
          return `${baseStyle} text-[rgb(var(--color-prog-primary))] bg-[rgb(var(--color-prog-primary)_/_0.1)]`;
        case 'games':
          return `${baseStyle} text-[rgb(var(--color-games-primary))] bg-[rgb(var(--color-games-primary)_/_0.1)]`;
        default:
          return baseStyle;
      }
    }

    switch (category) {
      case 'tech':
        return `${baseStyle} hover:text-[rgb(var(--color-tech-primary))] hover:bg-[rgb(var(--color-tech-primary)_/_0.1)]`;
      case 'geo':
        return `${baseStyle} hover:text-[rgb(var(--color-geo-primary))] hover:bg-[rgb(var(--color-geo-primary)_/_0.1)]`;
      case 'prog':
        return `${baseStyle} hover:text-[rgb(var(--color-prog-primary))] hover:bg-[rgb(var(--color-prog-primary)_/_0.1)]`;
      case 'games':
        return `${baseStyle} hover:text-[rgb(var(--color-games-primary))] hover:bg-[rgb(var(--color-games-primary)_/_0.1)]`;
      default:
        return `${baseStyle} hover:bg-neutral-100`;
    }
  };

  const getSubcategoryStyle = (category: string, isActive: boolean, isMobile = false) => {
    const baseStyle = isMobile
      ? 'block px-4 py-2 text-sm transition-colors duration-200 rounded-md'
      : 'block px-4 py-2 text-sm transition-colors duration-200';

    if (isMobile || isActive) {
      switch (category) {
        case 'tech':
          return `${baseStyle} text-[rgb(var(--color-tech-primary))] bg-[rgb(var(--color-tech-primary)_/_0.1)]`;
        case 'geo':
          return `${baseStyle} text-[rgb(var(--color-geo-primary))] bg-[rgb(var(--color-geo-primary)_/_0.1)]`;
        case 'prog':
          return `${baseStyle} text-[rgb(var(--color-prog-primary))] bg-[rgb(var(--color-prog-primary)_/_0.1)]`;
        case 'games':
          return `${baseStyle} text-[rgb(var(--color-games-primary))] bg-[rgb(var(--color-games-primary)_/_0.1)]`;
        default:
          return `${baseStyle} bg-neutral-100`;
      }
    }

    switch (category) {
      case 'tech':
        return `${baseStyle} hover:text-[rgb(var(--color-tech-primary))] hover:bg-[rgb(var(--color-tech-primary)_/_0.1)]`;
      case 'geo':
        return `${baseStyle} hover:text-[rgb(var(--color-geo-primary))] hover:bg-[rgb(var(--color-geo-primary)_/_0.1)]`;
      case 'prog':
        return `${baseStyle} hover:text-[rgb(var(--color-prog-primary))] hover:bg-[rgb(var(--color-prog-primary)_/_0.1)]`;
      case 'games':
        return `${baseStyle} hover:text-[rgb(var(--color-games-primary))] hover:bg-[rgb(var(--color-games-primary)_/_0.1)]`;
      default:
        return `${baseStyle} hover:bg-neutral-100`;
    }
  };

  return (
    <nav className={navClass}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            AlpesNews
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {categories.map((category) => (
              <div key={category.slug} className="group relative">
                <NavLink
                  to={`/category/${category.slug}`}
                  className={`flex items-center ${getCategoryStyle(category.color, isCategoryActive(category))}`}
                >
                  {category.name}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </NavLink>
                <div className="absolute left-0 mt-1 w-52 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    {category.subcategories.map((sub) => (
                      <NavLink
                        key={sub.slug}
                        to={`/category/${sub.slug}`}
                        className={({ isActive }) => getSubcategoryStyle(category.color, isActive)}
                      >
                        {sub.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSearch}
              className="p-2 rounded-full hover:bg-neutral-100"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              className="md:hidden p-2 rounded-full hover:bg-neutral-100"
              onClick={toggleMenu}
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-2">
              {categories.map((category) => (
                <div key={category.slug} className="flex flex-col">
                  <NavLink
                    to={`/category/${category.slug}`}
                    className={getCategoryStyle(category.color, isCategoryActive(category), true)}
                  >
                    {category.name}
                  </NavLink>
                  <div className="ml-4 mt-1 flex flex-col space-y-1">
                    {category.subcategories.map((sub) => (
                      <NavLink
                        key={sub.slug}
                        to={`/category/${sub.slug}`}
                        className={({ isActive }) => getSubcategoryStyle(category.color, isActive, true)}
                      >
                        {sub.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isSearchOpen && (
          <div className="absolute inset-x-0 top-full bg-white shadow-md p-4">
            <SearchBar onClose={toggleSearch} />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
