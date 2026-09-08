import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "../api/category-api";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.getCategories(),
    refetchOnWindowFocus: false,
    // Optional: Add default query options
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
