import { useQuery } from "@tanstack/react-query";
import { bannerApi } from "../api/banner-api";

export const useBanners = () => {
  return useQuery({
    queryKey: ["banners"],
    queryFn: () => bannerApi.getTrips(),
    refetchOnWindowFocus: false,
    // Optional: Add default query options
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
