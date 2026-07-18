import { api } from '@/services/api';

export interface KeyPoint {
  heading: string;
  body: string;
}

export interface ArticleData {
  slug: string;
  heroImage: string;
  title: string;
  author: string;
  readTime: string;
  date: string;
  paragraphs: string[];
  sectionHeading: string;
  sectionSubheadingIfAny?: string;
  keyPoints: KeyPoint[];
  closingParagraphs: string[];
  extraSection?: { heading: string; paragraphs: string[] };
  relatedArticles: { title: string; readTime: string; tag: string; path: string }[];
  blockquote: { quote: string; attribution: string };
  likeCount: number;
  commentCount: number;
}

export interface ArticleListItem {
  slug: string;
  heroImage: string;
  title: string;
  author: string;
  readTime: string;
  date: string;
  likeCount: number;
  commentCount: number;
}

/**
 * Article service — all article-related API calls.
 */
export const articleService = {
  /** Get lightweight list of all articles */
  getAll: () => api.get<ArticleListItem[]>('/articles'),

  /** Get a full article by slug */
  getBySlug: (slug: string) => api.get<ArticleData>(`/articles/${slug}`),
};
