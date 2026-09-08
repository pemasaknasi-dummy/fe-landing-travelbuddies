import { useInfiniteQuery } from "@tanstack/react-query";
import { tripApi, GetTripsParams } from "../api/trip-api";

export const useInfiniteTrips = (params?: GetTripsParams) => {
  return useInfiniteQuery({
    queryKey: ["trips", params],
    initialPageParam: 1,

    queryFn: ({ pageParam }) =>
      tripApi.getTrips({
        ...params,
        page: pageParam,
        sortBy: "most_booked",
        take: 12,
      }),

    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.pageCount) {
        return lastPage.page + 1;
      }
      return undefined;
    },

    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
