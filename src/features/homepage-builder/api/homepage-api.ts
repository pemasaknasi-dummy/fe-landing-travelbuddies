import { httpClient } from "@/lib/api/http-client";
import { Trip } from "@/features/trips/api/trip-api";

export type SectionType = "BANNER_ROW" | "TRIP" | "FULLWIDTH_BANNER" | "VIDEO" | "CTA_BANNER";

export interface VideoItem {
  title: string;
  thumbnail: string;
  url: string;
}

export interface HomepageSectionFields {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  url?: string;
  banners?: string[];
  isHasSeeMore?: boolean;
  tripIds?: number[];
  videos?: VideoItem[];
  actionType?: "single_link" | "app_download";
  appStoreUrl?: string;
  playStoreUrl?: string;
}

export interface HomepageSection {
  id: number;
  type: SectionType;
  title: string | null;
  sortOrder: number;
  isActive: boolean;
  fields: HomepageSectionFields;
  populatedTrips?: Trip[];
  createdAt: string;
  updatedAt: string;
}

export const homepageApi = {
  getHomepageSections: async () => {
    return httpClient.get<HomepageSection[]>("/homepageSections", {
      activeOnly: "true",
    });
  },
};
