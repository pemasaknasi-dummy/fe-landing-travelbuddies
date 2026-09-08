import { Gender } from "@/features/profile/api/profile-api";
import { Destination, MeetingPoint, Trip } from "@/features/trips/api/trip-api";
import { httpClient } from "@/lib/api/http-client";

export type PaginationParams = {
  pageSize?: number;
  pageCount?: number;
  page?: number;
  total?: number;
  take?: number;
};

export interface FeedbackData {
  tourLeaderRating: number;
  tourLeaderServiceRating: number;
  facilityRating: number;
  itineraryRating: number;
  documentationRating: number;
  comment: string;
}

export interface Participants {
  name: string;
  noKtp: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  meetingPoint: string;
  label: string;
  isOpen: boolean;
}

export interface CreateBookingBody {
  userId?: number;
  sourceId: number;
  promoId?: number;
  voucherId?: number;
  slots: number;
  paymentMethod?: string;
  participants: Participants[];
  meetingPoint: number[];
  additional_order: {
    quantity: number;
    additionalId: number;
  }[];
  personInCharge?: any;
}

export interface BookingDetailResponse {
  allowOverdueRepayment: boolean;
  repaymentPastDueDate: boolean;
  hasFeedback: boolean;
  bookingId: number;
  orderId: string;
  status: string;
  slots: number;
  location: string;
  booked: number;
  quota: number;
  additionalOrder: {
    additionalId: number;
    name: string;
    quantity: number;
    price: number;
  }[];
  orderDetail?: any;
  hasDocumentation: boolean;
  documentationLink: string[];
  paymentScheme?: string;
  dpPaid?: boolean;
  dpForfeited?: boolean;
  trip: {
    id: number;
    slug: string;
    title: string;
    location: string;
    subtitle: string;
    price: string;
    promoPrice: string | null;
    days: number;
    destinations: Destination[];
    date: string;
    type: string;
    image: string;
    additionals: {
      id: number;
      additionalId: number;
      isRequired: boolean;
      tripId: number;
    }[];
    dpRepaymentDaysBefore: number;
  };
  tripDate: {
    id: number;
    booked: number;
    date: string;
    remaining: number;
    status: string;
    quota: number;
    isGuarantee: boolean;
  };
  user: {
    id: number;
    name: string;
    phone: string;
  };
  personInCharge?: {
    id: number;
    fullName: string;
    ktp: string;
    dateOfBirth?: string;
    gender?: string;
    phoneNumber?: string;
    email?: string;
  };
  averageRating: number | null;
  feedback: FeedbackData;
  payment: {
    totalAmount: number;
    status: string;
    createdAt: string;
    details: {
      id: number;
      method: string;
      status: string;
      amount: number;
      grossAmount: number;
      createdAt: string;
      xenditInvoiceUrl: string;
      uniqueNumber: number;
      orderId?: string;
      rawResponse?: any;
      finalPrice?: number;
      expiryDate?: string;
      paymentInvoices?: {
        id: number;
        invoiceNumber: string;
        createdAt: string;
      }[];
    }[];
  };
  bookingParticipants: {
    id: number;
    label: string;
    participant: Participants;
    meetingPoints: MeetingPoint;
    meetingPointId?: number | string;
  }[];
  meetingPointParticipants?: any[];
  items: {
    name: string;
    price: number;
    quantity: number;
    status: string;
  }[];
  createdAt: string;
  amount: number;
}

export interface ListBookingResponse {
  bookingId: string;
  orderId: string;
  status?: string;
  paymentScheme?: string;
  repaymentPastDueDate?: boolean;
  allowOverdueRepayment?: boolean;
  dpForfeited?: boolean;
  trip: {
    id?: number;
    title: string;
    subtTitle?: string;
    location: string;
    image: string | null;
    days?: number;
    duration?: string;
    dpRepaymentDaysBefore?: number;
  };
  tripDate: {
    id: number;
    date: string;
    status: string;
    isGuarantee?: boolean;
  };
  quota: number;
  booked: string;
  payment: {
    totalAmount: number;
    dpAmount?: number;
    repaymentAmount?: number;
    dpPaymentStatus?: string | null;
    repaymentStatus?: string | null;
    dpRepaymentDueDate?: string | null;
    status: string;
    createdAt: string;
    xenditInvoiceUrl?: string;
    details?: {
      id?: number;
      orderId?: string;
      amount: number;
      status: string;
      method?: string;
      methodLabel?: string;
      createdAt: string;
      xenditInvoiceUrl?: string;
      expiryDate?: string;
      rawResponse?: {
        expiry_date?: string;
        invoiceDuration?: number;
      };
    }[];
  };
}

export interface FinalBookingResponse extends PaginationParams {
  items: ListBookingResponse[];
}

interface UpcomingTripsResponse {
  bookingId: number;
  remainingDays: number;
  totalParticipants: number;
  tripDate: string;
  trip: {
    id: number;
    title: string;
    slug: string;
    location: string;
    image: string;
  };
}

export interface SummaryBookingPayload {
  userId?: number;
  tripId: number;
  tripDateId: number;
  slots: number;
  sourceId: number;
  participants?: { customerType?: string }[];
  additional_order: {
    name: string;
    additionalId: number;
    quantity: number;
  }[];
  promoId?: number;
  voucherId?: number;
}

export const bookingApi = {
  createBooking: async (tripId: number, body: CreateBookingBody) => {
    return httpClient.post(`/bookings/${tripId}`, body);
  },

  createRepaymentInvoice: async (
    bookingId: number,
    paymentMethod: string,
    additional_order?: { additionalId: number; quantity: number }[]
  ): Promise<{ invoiceUrl: string }> => {
    return httpClient.post(`/bookings/repayment/${bookingId}`, {
      paymentMethod,
      additional_order,
    });
  },

  getListHistory: async (params?: PaginationParams & { status?: string }) => {
    return httpClient.get<FinalBookingResponse>(
      "/users/booking-history",
      params,
    );
  },

  getBookingDetail: async (
    bookingId: number,
  ): Promise<BookingDetailResponse> => {
    return httpClient.get(`/users/bookings/${bookingId}`);
  },

  getUpcomingTrips: async (): Promise<{ items: UpcomingTripsResponse[] }> => {
    return httpClient.get("/users/bookings/upcoming-trips");
  },

  getSummaryBooking: async (
    payload: SummaryBookingPayload,
  ): Promise<{
    totalAmount: number;
    discountValue: number;
    item_details: {
      id: number;
      name: string;
      price: number;
      quantity: number;
    }[];
    dpEligible?: boolean;
    dpDeadline?: string | null;
    dpAmount?: number | null;
    remainingAmount?: number | null;
    basePublicPrice?: number | null;
  }> => {
    return httpClient.post("/bookings/summary-price", payload);
  },

  addParticipants: async (
    bookingId: number,
    body: {
      participants: Partial<Participants>[];
      additional_order?: any[];
      paymentMethod?: string;
    },
  ) => {
    return httpClient.post(`/bookings/${bookingId}/add-participants`, body);
  },

  completeParticipants: async (
    bookingId: number,
    body: {
      participants: (Partial<Participants> & { id: number })[];
    }
  ) => {
    return httpClient.put(`/bookings/${bookingId}/complete-participants`, body);
  },

  getBookingDocumentation: async (
    bookingId: number,
    participantId?: number,
  ): Promise<{ id: string; name: string; mimeType: string; size: number | null; url: string }[]> => {
    return httpClient.get(`/bookings/${bookingId}/documentation`, {
      participantId: participantId ?? null,
    });
  },

  getAddParticipantsSummary: async (
    bookingId: number,
    body: {
      slots?: number;
      adultSlots?: number;
      childSlots?: number;
      participants?: { customerType?: string }[];
      additional_order?: any[];
    },
  ): Promise<{
    oldSlots: number;
    addedSlots: number;
    totalSlots: number;
    oldAdultSlots?: number;
    oldChildSlots?: number;
    addedAdultSlots?: number;
    addedChildSlots?: number;
    newAdultSlots?: number;
    newChildSlots?: number;
    oldBasePrice: number;
    newBasePrice: number;
    oldPaxTotal: number;
    newPaxTotal: number;
    paxDiffAmount: number;
    additionalDiffAmount: number;
    uniqueNumber: number;
    totalDiffAmount: number;
    item_details: {
      id: string;
      name: string;
      price: number;
      quantity: number;
    }[];
  }> => {
    return httpClient.post(`/bookings/${bookingId}/add-participants-summary`, body);
  },

  orderAdditional: async (
    bookingId: number,
    paymentMethod: string,
    additional_order: { additionalId: number; quantity: number }[]
  ): Promise<{ invoiceUrl: string }> => {
    return httpClient.post(`/bookings/${bookingId}/order-additional`, {
      paymentMethod,
      additional_order,
    });
  },
};
