import { useQuery } from "@tanstack/react-query";
import { tripApi, type GetTripsParams } from "../api/trip-api";

export const useTrips = (params?: GetTripsParams) => {
  return useQuery({
    queryKey: ["trips", params],
    queryFn: () => tripApi.getTrips(params),
    refetchOnWindowFocus: false,
    // Optional: Add default query options
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const useTop10Trips = (params?: GetTripsParams) => {
  return useQuery({
    queryKey: ["top-10-trips", params],
    queryFn: () => tripApi.getTop10Trips(params),
    refetchOnWindowFocus: false,
    // Optional: Add default query options
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const useTrip = (id: string) => {
  return useQuery({
    queryKey: ["trip", id],
    queryFn: () => tripApi.getTripById(id),
    enabled: !!id, // Only run the query if the ID exists
    refetchOnWindowFocus: false,
  });
};
