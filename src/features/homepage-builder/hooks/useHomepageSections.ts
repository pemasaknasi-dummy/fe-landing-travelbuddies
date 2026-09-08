import { useQuery } from "@tanstack/react-query";
import { homepageApi } from "../api/homepage-api";

export const useHomepageSections = () => {
  return useQuery({
    queryKey: ["homepage-sections-active"],
    queryFn: () => homepageApi.getHomepageSections(),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
