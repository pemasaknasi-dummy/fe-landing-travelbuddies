import { useAuth } from "@/context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BodyCreateFeedback, feedbackApi } from "../api/feedback-api";

export const useShowBookingFeedback = (bookingId?: number) => {
  const { isReady, isAuth } = useAuth();

  return useQuery({
    queryKey: ["feedback", bookingId],
    queryFn: () => feedbackApi.showBookingFeedback(bookingId!),
    enabled: !!isReady && !!isAuth && !!bookingId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDetailFeedback = (bookingId?: number) => {
  const { isReady, isAuth } = useAuth();

  return useQuery({
    queryKey: ["detail-feedback", bookingId],
    queryFn: () => feedbackApi.getDetailFeedback(bookingId!),
    enabled: !!isReady && !!isAuth && !!bookingId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDocumentationLink = (bookingId?: number) => {
  const { isReady, isAuth } = useAuth();

  return useQuery({
    queryKey: ["feedback-doc", bookingId],
    queryFn: () => feedbackApi.getDocumentationLink(bookingId!),
    enabled: !!isReady && !!isAuth && !!bookingId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["feedback"],
    mutationFn: (body: BodyCreateFeedback) => feedbackApi.createFeedback(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      queryClient.invalidateQueries({ queryKey: ["pending-feedbacks"] });
    },
  });
};

export const useCreatePublicFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["public-feedback"],
    mutationFn: (body: BodyCreateFeedback) => feedbackApi.createPublicFeedback(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-feedback"] });
    },
  });
};

export const usePendingFeedbacks = () => {
  const { isReady, isAuth } = useAuth();

  return useQuery({
    queryKey: ["pending-feedbacks"],
    queryFn: () => feedbackApi.getPendingFeedbacks(),
    enabled: !!isReady && !!isAuth,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePublicDetailFeedback = (bookingId?: number, participantId?: number) => {
  return useQuery({
    queryKey: ["public-detail-feedback", bookingId, participantId],
    queryFn: () => feedbackApi.getPublicDetailFeedback(bookingId!, participantId),
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useVerifyParticipant = () => {
  return useMutation({
    mutationKey: ["verify-participant"],
    mutationFn: ({ tripDateId, phone }: { tripDateId: number; phone: string }) =>
      feedbackApi.verifyParticipant(tripDateId, phone),
  });
};
