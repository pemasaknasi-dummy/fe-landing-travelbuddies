import { httpClient } from "@/lib/api/http-client";

export interface ShowBookingFeedbackResponse {
  bookingId: number;
  userId: number
  trip: {
    title: string;
    type: string;
  };
  tripDate: { date: string; documentationLink?: string[] | null };
  feedback: {
    id: number;
    bookingId: number;
    tripDateId: number;
    type: string;
    tourLeaderRating: number;
    tourLeaderServiceRating: number;
    facilityRating: number;
    itineraryRating: number;
    documentationRating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface PendingFeedbackItem {
  bookingId: number;
  trip: {
    id: number;
    title: string;
    image: string | null;
    location: string | null;
  };
  tripDate: {
    id: number;
    date: string;
  };
}

export interface BodyCreateFeedback {
  bookingId: number;
  participantId?: number;
  type: string;
  tourLeaderRating: number;
  tourLeaderServiceRating: number;
  facilityRating: number;
  itineraryRating: number;
  documentationRating: number;
  comment: string;
}

interface GetDocumentationLink {
  tripDateId: number;
  documentationLinks: string[];
}

export interface VerifyParticipantResponse {
  bookingId: number;
  participantId: number;
  participantName: string;
  tripTitle: string;
  tripDate: string;
  phoneMasked: string;
  isFeedbackFilled: boolean;
  documentationLink?: string[] | null;
}

export const feedbackApi = {
  showBookingFeedback: async (bookingId: number): Promise<ShowBookingFeedbackResponse> => {
    return httpClient.get(`/feedbacks/booking/${bookingId}`);
  },

  getDetailFeedback: async (bookingId: number): Promise<ShowBookingFeedbackResponse> => {
    return httpClient.get(`/feedbacks/booking/${bookingId}`)
  },

  getPublicDetailFeedback: async (bookingId: number, participantId?: number): Promise<ShowBookingFeedbackResponse> => {
    return httpClient.get(`/feedbacks/public/booking/${bookingId}`, {
      participantId: participantId ?? null
    });
  },

  createFeedback: async (body: BodyCreateFeedback) => {
    return httpClient.post("/feedbacks", body);
  },

  createPublicFeedback: async (body: BodyCreateFeedback) => {
    return httpClient.post("/feedbacks/public", body);
  },

  getDocumentationLink: async (bookingId: number): Promise<GetDocumentationLink> => {
    return httpClient.get(`/feedbacks/booking/${bookingId}/documentation-link`);
  },

  getPendingFeedbacks: async (): Promise<{ items: PendingFeedbackItem[] }> => {
    return httpClient.get("/feedbacks/pending");
  },

  verifyParticipant: async (tripDateId: number, phone: string): Promise<VerifyParticipantResponse[]> => {
    return httpClient.get("/feedbacks/verify-participant", {
      tripDateId, phone
    });
  },
};
