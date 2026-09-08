import { httpClient } from "@/lib/api/http-client";

interface PromoBadge {
  name: string;
  code: string;
  discountMode: string;
  id: number;
  minimumPax: number;
}

export interface PromoTrip {
  id: number;
  promo: {
    id: number;
    name: string;
    dateRuleType: string;
    exceptionDates: string[];
    usagePeriodFrom?: string;
    usagePeriodTo?: string;
  };
  discountMode: string;
  discountValue: string;

  promoId: number;
  quotaMaximum: number;
  tripId: number;
  dailyUsages: {
    id: number;
    promoTripId: number;
    remaining: number;
    tripDateId: number;
    usage: number;
  }[];
}

export interface Trip {
  id: number;
  title: string;
  subtitle: string;
  categories: TripCategories[];
  sections: string[];
  promos: PromoBadge[];
  promoTrips: PromoTrip[];
  tripPrices?: any[];
  additionals: {
    id: number;
    additionalId: number;
    isRequired: boolean;
    tripId: number;
    price?: number;
    additional?: {
      id: number;
      name: string;
      unit: string;
    };
  }[];
  location: string;
  rating: number;
  reviews: number;
  duration: string;
  description: string;
  promoPrice: number | null;
  price: number;
  days: number;
  basePrice: number;
  image: string;
  images: {
    images: string[];
    name: string;
  }[];
  videos?: {
    video_title: string;
    video_file: string;
    thumbnail: string;
  }[];
  facilityImages?: {
    name: string;
    image: string;
  }[];
  badge?: string;
  slug: string;
  views?: number;
  shareCount?: number;
  inclusions?: string[];
  exclusions?: string[];
  destinations?: Destination[];
  availableDates?: AvailableDates[];
  itineraries?: any[];
  booked?: number;
  quota?: number;
  cardTitle?: string;
  buyers?: number;
  dateRangeThisWeek?: {
    start: string;
    end: string;
  };
  hasAvailableDateThisWeek?: boolean;
  quotaThisWeek?: number;
  availability?: {
    label: string;
    color: string;
    type: "available" | "limited" | "full" | "unavailable";
  };
  isTripGuarantee: boolean;
  guaranteeTiers: { id: number; pax: number; price: number }[];
  seasonalPrices: {
    id: number;
    startDate: string;
    endDate: string;
    price: number;
    note?: string;
    tiers?: {
      pax: number;
      price: number;
    }[];
  }[];
  blackoutDates: { id: number; date: string; reason?: string }[];
  privateTripPrice: number;
  dpEnabled?: boolean;
  dpMinimumAmount?: number | null;
  dpRepaymentDaysBefore?: number | null;
}

export interface TripCategories {
  id: number;
  name: string;
}

export interface Itinerary {
  activities: {
    activity: string;
    time: string;
  }[];
}

export interface AvailableDates {
  id: number;
  date: string;
  price: number | null;
  minimum: number;
  quota: number;
  remaining: number;
  status: string;
  isGuarantee: boolean;
}

export interface Destination {
  id: number;
  additional_prices: {
    additionalId: number;
    basePrice: number;
    price: number;
    promoPrice: number | null;
  }[];
  destinationMeetingPoints: {
    id: number;
    destinationId: number;
    meetingPointId: number;
    time: string;
    isActive: boolean;
    meetingPoint: { id: number; location: string };
  }[];
  additionals: Additional[];
  meetingPoints: MeetingPoint[];
}

export interface MeetingPoint {
  id: number;
  location: string;
  time: string;
  isActive: boolean;
}

export interface Additional {
  id: number;
  name: string;
  unit: string;
}

export type GetTripsParams = {
  pageSize?: number;
  page?: number;
  total?: number;
  days?: string | null;
  section?: ("popular" | "recommended")[];
  category?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  q?: string;
  take?: number;
  isTripGuarantee?: boolean;
  sortBy?: string;
  maxQuota?: number;
  date?: string | null; // Single date filter (YYYY-MM-DD)
};

export interface TripListResponse {
  items: Trip[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

export const tripApi = {
  getTrips: async (params?: GetTripsParams) => {
    const { date, ...rest } = params || {};
    const queryParams: Record<string, any> = { ...rest };
    if (date) {
      queryParams.start_date = date;
    }
    return httpClient.get<TripListResponse>("/trips", queryParams);
  },

  getTop10Trips: async (params?: GetTripsParams) => {
    return httpClient.get<TripListResponse>("/trips/top-10", params);
  },

  getTripById: async (id: string) => {
    return httpClient.get<Trip>(`/trips/${id}`);
  },
};
