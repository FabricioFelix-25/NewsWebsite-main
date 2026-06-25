export interface Author {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'author';
  avatarUrl?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  resetToken?: string;
  resetTokenExpiry?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  tags?: string[];
  authorId: string;
  author?: Author;
  publishedAt: string;
  updatedAt: string;
  featured: boolean;
  isDraft: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: string;
  aiAssisted?: boolean;
  sourceReferences?: string;
  reviewedBy?: string;
  factChecked?: boolean;
  rightsCleared?: boolean;
  sensitiveContentReviewed?: boolean;
  views?: number;
  viewCount?: number;
}

export interface ArticleView {
  id: string;
  articleId: string;
  timestamp: string;
  userAgent: string;
  ipAddress: string;
}
