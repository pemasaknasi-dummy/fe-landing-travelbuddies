import { httpClient } from "@/lib/api/http-client";

export interface Article {
  id: number;
  title: string;
  slug: string;
  category: string;
  location: string;
  writtenDate?: string;
  readTime?: string;
  image: string;
  shortDesc: string;
  content: string;
  highlights: string[];
  statusPublish: string;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const articlesApi = {
  getArticles: async (params?: Record<string, any>) => {
    return httpClient.get<{ items: Article[]; total: number; page: number; pageSize: number }>("/articles", params);
  },
  getArticleBySlug: async (slug: string) => {
    return httpClient.get<Article>(`/articles/slug/${slug}`);
  },
};
