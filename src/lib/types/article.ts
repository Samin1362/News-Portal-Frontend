/**
 * Mirrors the backend's article DTOs (see backend/src/views/article.view.ts).
 * Updated whenever the backend contract changes.
 */

export interface ArticleMediaItem {
  url: string;
  publicId: string;
  alt?: string;
  caption?: string;
}

export interface ArticleVideoItem {
  url: string;
  publicId: string;
  thumbnail?: string;
  caption?: string;
}

export interface ArticleSeo {
  title: string;
  description: string;
  ogImage: string | null;
  canonicalUrl: string | null;
  keywords: string[];
}

export type ArticleStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "published"
  | "rejected"
  | "archived";

export interface ArticleCardDTO {
  id: string;
  headline: string;
  slug: string;
  summary: string;
  authorId: string;
  categoryId: string;
  tags: string[];
  featuredImage: ArticleMediaItem | null;
  status: ArticleStatus;
  isBreaking: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  publishedAt: string | null;
  scheduledAt: string | null;
  viewCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryDTO {
  action: string;
  by: string | null;
  at: string;
  note?: string;
}

export interface ArticleFullDTO extends ArticleCardDTO {
  content: string;
  gallery: ArticleMediaItem[];
  videos: ArticleVideoItem[];
  rejectionReason: string | null;
  reviewerId: string | null;
  approverId: string | null;
  history: HistoryDTO[];
  seo: ArticleSeo;
  recentViews: number;
  isCommentsEnabled: boolean;
}

export interface ArticleSuggestionDTO {
  id: string;
  headline: string;
  slug: string;
}

export interface HomepageCategoryBlockDTO {
  category: import("@/lib/api/categories.api").CategoryDTO;
  articles: ArticleCardDTO[];
}

export interface HomepageDTO {
  breaking: ArticleCardDTO[];
  topHeadlines: ArticleCardDTO[];
  featured: ArticleCardDTO[];
  trending: ArticleCardDTO[];
  latest: ArticleCardDTO[];
  categories: HomepageCategoryBlockDTO[];
  videos: ArticleCardDTO[];
  gallery: ArticleCardDTO[];
  generatedAt: string;
}

export interface PublicArticleResponseDTO {
  article: ArticleFullDTO;
  related: ArticleCardDTO[];
}

export interface CategoryArticlesDTO {
  category: import("@/lib/api/categories.api").CategoryDTO;
  articles: ArticleCardDTO[];
}

export interface TagDTO {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface TagArticlesDTO {
  tag: TagDTO;
  articles: ArticleCardDTO[];
}

export interface SearchResultDTO {
  q: string;
  items: ArticleCardDTO[];
  facets: { byCategory: Array<{ categoryId: string; count: number }> };
}

export interface ArticleOgPayload {
  title: string;
  description: string;
  url: string;
  image: string | null;
  type: "article";
  siteName: string;
  publishedTime: string | null;
  modifiedTime: string;
  author: string | null;
  section: string | null;
  tags: string[];
  structuredData: Record<string, unknown>;
}
