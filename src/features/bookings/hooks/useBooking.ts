// hooks/useBooking.ts

import { useAuth } from "@/context/AuthContext";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  bookingApi,
  CreateBookingBody,
  PaginationParams,
  Participants,
  SummaryBookingPayload,
} from "../api/booking-api";
import { useDebounce } from "@/lib/useDebounce";

/* =======================
   CREATE BOOKING
======================= */
export const useCreateBooking = (tripId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-booking", tripId],
    mutationFn: (body: CreateBookingBody) =>
      bookingApi.createBooking(tripId!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["history-detail"] });
    },
  });
};

export const useBookingSummary = (payload: SummaryBookingPayload | null) => {
  const { isReady, isAuth, user } = useAuth();
  const debouncedPayload = useDebounce(payload, 600);

  return useQuery({
    queryKey: ["booking-summary", debouncedPayload, user?.id],
    queryFn: () => bookingApi.getSummaryBooking(debouncedPayload!),
    enabled:
      !!debouncedPayload &&
      !!debouncedPayload.tripId &&
      !!debouncedPayload.slots,
    staleTime: 1000 * 30, // cache 30 detik, tidak refetch jika data masih fresh
    gcTime: 1000 * 60 * 5, // garbage collect setelah 5 menit
    retry: 1,
  });
};

/* =======================
   HISTORY LIST
======================= */
export const useBookingHistory = () => {
  const { isReady, isAuth } = useAuth();

  return useQuery({
    queryKey: ["history"],
    queryFn: () => bookingApi.getListHistory(),
    enabled: !!isReady && !!isAuth,
    refetchOnMount: true,
  });
};

export const useInfiniteHistory = (params?: PaginationParams & { status?: string }) => {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: ["history", params, user?.id],
    initialPageParam: 1,

    queryFn: ({ pageParam }) =>
      bookingApi.getListHistory({
        ...params,
        page: pageParam,
        take: 12,
      }),

    getNextPageParam: (lastPage) => {
      if (lastPage?.page! < lastPage?.pageCount!) {
        return lastPage?.page! + 1;
      }
      return undefined;
    },

    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    retry: 1,
  });
};

/* =======================
   BOOKING DETAIL
======================= */
export const useBookingDetail = (bookingId?: number) => {
  const { isReady, isAuth } = useAuth();

  return useQuery({
    queryKey: ["history-detail", bookingId],
    queryFn: () => bookingApi.getBookingDetail(bookingId!),
    enabled: !!isReady && !!isAuth && !!bookingId,
    refetchOnWindowFocus: true,
  });
};

export const useAddParticipants = (bookingId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["add-participants", bookingId],
    mutationFn: (body: {
      participants: Partial<Participants>[];
      additional_order?: any[];
      paymentMethod?: string;
    }) => bookingApi.addParticipants(bookingId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["history-detail", bookingId],
      });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
};

export const useCompleteParticipants = (bookingId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["complete-participants", bookingId],
    mutationFn: (body: {
      participants: (Partial<Participants> & { id: number })[];
    }) => bookingApi.completeParticipants(bookingId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["history-detail", bookingId],
      });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
};

export const useAddParticipantsSummary = (
  bookingId: number,
  payload: {
    slots?: number;
    adultSlots?: number;
    childSlots?: number;
    participants?: { customerType?: string }[];
    additional_order?: any[];
  } | null,
) => {
  const { isReady, isAuth } = useAuth();
  const debouncedPayload = useDebounce(payload, 400);

  return useQuery({
    queryKey: ["add-participants-summary", bookingId, debouncedPayload],
    queryFn: () => bookingApi.getAddParticipantsSummary(bookingId, debouncedPayload!),
    enabled:
      !!isReady &&
      !!isAuth &&
      !!bookingId &&
      !!debouncedPayload &&
      ((typeof debouncedPayload.slots === "number" && debouncedPayload.slots > 0) ||
        (Array.isArray(debouncedPayload.participants) && debouncedPayload.participants.length > 0)),
    staleTime: 1000 * 5,
    retry: false,
  });
};

/* =======================
   UPCOMING TRIPS
======================= */
export const useUpcomingTrips = () => {
  const { isReady, isAuth } = useAuth();

  return useQuery({
    queryKey: ["upcoming-trips"],
    queryFn: () => bookingApi.getUpcomingTrips(),
    enabled: !!isReady && !!isAuth,
  });
};
