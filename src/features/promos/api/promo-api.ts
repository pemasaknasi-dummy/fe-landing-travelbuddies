import { httpClient } from "@/lib/api/http-client";

export type GetPromoParams = {
  tripId?: number;
  date?: string;
  q?: string;
  participantCount?: number;
};

export interface ApplicablePromosResponse {
  id: number;
  code?: string;
  name: string;
  description: string;
  image: string;
  discountMode: string;
  discountValue: number;
  estimatedDiscount: number;
  maximumDiscount: number | null;
  terms: string;
}

export interface PromoByCodeResponse {
  id: number;
  name: string;
  code: string;
  description: string;
  terms: string;
  purchasePeriodFrom: string | null;
  purchasePeriodTo: string | null;
  usagePeriodFrom: string;
  usagePeriodTo: string;
  minimumPax: number | null;
  quotaMinimum: number;
  quotaMaximum: number;
  used: number;
  type: string;
  discountValue: number;
  image: string;
  statusPublish: string;
  isUsable: boolean;
  discountMode: string;
  estimatedDiscount: number;
  maximumDiscount: number;
}

export interface GetPromoWebsite {
  slug: string;
  title: string;
  description: string;
  image?: string | null;
  type: string;
  code?: string
  trip?: string[]
  validUntil: string;
  discount: string;
  terms: string;
}

export const promoApi = {
  getApplicablePromos: async (params?: GetPromoParams) => {
    return httpClient.get<{ promos: ApplicablePromosResponse[] }>("/promos/applicable", params);
  },

  getPromoWebsite: async () => {
    return httpClient.get<{ items: GetPromoWebsite[] }>("/promos/website");
  },

  getDetailPromoWebsite: async (slug?: string) => {
    return httpClient.get<GetPromoWebsite>(`/promos/website/${slug}`);
  },

  getPromoByCode: async (userId: number, params?: GetPromoParams) => {
    return httpClient.get<PromoByCodeResponse[]>(`/promos/by-user/${userId}`, params);
  },
};
