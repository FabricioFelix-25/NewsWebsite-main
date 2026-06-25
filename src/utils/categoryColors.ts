import { useLocation } from 'react-router-dom';

export const CATEGORY_SECTION_MAP: Record<string, string> = {
  tech: 'section-tech',
  ai: 'section-tech',
  gadgets: 'section-tech',
  internet: 'section-tech',
  trending: 'section-tech',
  'world-news': 'section-tech',
  entertainment: 'section-tech',
  lifestyle: 'section-tech',

  geopolitics: 'section-geo',
  'global-market': 'section-geo',
  conflicts: 'section-geo',
  diplomacy: 'section-geo',

  programming: 'section-prog',
  web: 'section-prog',
  mobile: 'section-prog',
  devops: 'section-prog',

  games: 'section-games',
  console: 'section-games',
  pc: 'section-games',
  'mobile-gaming': 'section-games',
};

export const CATEGORY_GROUPS: Record<string, string[]> = {
  tech: ['tech', 'ai', 'gadgets', 'internet'],
  geopolitics: ['geopolitics', 'global-market', 'conflicts', 'diplomacy'],
  programming: ['programming', 'web', 'mobile', 'devops'],
  games: ['games', 'console', 'pc', 'mobile-gaming'],
  trending: ['trending', 'world-news', 'entertainment', 'lifestyle'],
};

const SECTION_CLASS_TO_NAME: Record<string, string> = {
  'section-tech': 'tech',
  'section-geo': 'geo',
  'section-prog': 'prog',
  'section-games': 'games',
};

const SECTION_TOKEN_MAP: Record<string, { primary: string; secondary: string; accent: string }> = {
  tech: {
    primary: '--color-tech-primary',
    secondary: '--color-tech-secondary',
    accent: '--color-tech-accent',
  },
  geo: {
    primary: '--color-geo-primary',
    secondary: '--color-geo-secondary',
    accent: '--color-geo-accent',
  },
  prog: {
    primary: '--color-prog-primary',
    secondary: '--color-prog-secondary',
    accent: '--color-prog-accent',
  },
  games: {
    primary: '--color-games-primary',
    secondary: '--color-games-secondary',
    accent: '--color-games-accent',
  },
};

const CATEGORY_LABEL_MAP: Record<string, string> = {
  tech: 'Tecnologia',
  ai: 'IA',
  gadgets: 'Gadgets',
  internet: 'Internet',
  geopolitics: 'Geopolitica',
  'global-market': 'Mercado Global',
  conflicts: 'Conflitos',
  diplomacy: 'Diplomacia',
  programming: 'Programacao',
  web: 'Web',
  mobile: 'Mobile',
  devops: 'DevOps',
  games: 'Games',
  console: 'Consoles',
  pc: 'PC',
  'mobile-gaming': 'Games Mobile',
  trending: 'Em Alta',
  'world-news': 'Noticias do Mundo',
  entertainment: 'Entretenimento',
  lifestyle: 'Estilo de Vida',
};

export function getCategoryLabel(categorySlug: string): string {
  return (
    CATEGORY_LABEL_MAP[categorySlug] ||
    categorySlug
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  );
}

export function getGroupForCategory(categorySlug: string): string | null {
  if (CATEGORY_GROUPS[categorySlug]) {
    return categorySlug;
  }

  for (const [group, categories] of Object.entries(CATEGORY_GROUPS)) {
    if (categories.includes(categorySlug)) {
      return group;
    }
  }

  return null;
}

export function getSectionFromCategory(categorySlug: string): string {
  const sectionClass = CATEGORY_SECTION_MAP[categorySlug];
  if (!sectionClass) {
    return 'default';
  }

  return SECTION_CLASS_TO_NAME[sectionClass] || 'default';
}

export function getSectionFromPath(pathname: string): string {
  const matched = pathname.match(/\/category\/([^/?#]+)/);
  if (!matched?.[1]) {
    return 'default';
  }

  return getSectionFromCategory(matched[1]);
}

export function getTopicColorTokens(categorySlug: string): { primary: string; secondary: string; accent: string } {
  const section = getSectionFromCategory(categorySlug);
  return (
    SECTION_TOKEN_MAP[section] || {
      primary: '--color-neutral-700',
      secondary: '--color-neutral-500',
      accent: '--color-neutral-300',
    }
  );
}

export const useCategoryColor = () => {
  const location = useLocation();
  const matched = location.pathname.match(/\/category\/([^/?#]+)/);
  if (!matched?.[1]) {
    return '';
  }

  return CATEGORY_SECTION_MAP[matched[1]] || '';
};

export default CATEGORY_SECTION_MAP;
