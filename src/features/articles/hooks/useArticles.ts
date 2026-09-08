import { useQuery } from "@tanstack/react-query";
import { articlesApi } from "../api/articles-api";

export const useArticles = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["articles", params],
    queryFn: () => articlesApi.getArticles(params),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const useArticleBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["article", slug],
    queryFn: () => articlesApi.getArticleBySlug(slug),
    enabled: !!slug,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
};
