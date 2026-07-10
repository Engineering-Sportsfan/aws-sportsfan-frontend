// types/news.ts

export interface NewsArticle {
  rank: number;
  title: string;
  summary: string;
  source: string;
  url: string;
  tag: string;
  cdn_url: string;
  createdAt?: number; // Timestamp for sorting
  likes?: number;
  id?: string; // Cricket article ID for sync
}