import { useQuery } from "@tanstack/react-query";
import { termsApi } from "../api/terms-api";

export const useTerms = () => {
  return useQuery({
    queryKey: ["terms", "published"],
    queryFn: () => termsApi.getPublishedTerms(),
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes - terms don't change frequently
    retry: 1,
  });
};
