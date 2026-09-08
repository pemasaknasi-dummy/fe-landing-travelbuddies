import { httpClient } from "@/lib/api/http-client";

export interface TermsItem {
  id: number;
  title: string;
  content: string;
  version: string;
  statusPublish: string;
  createdAt: string;
  updatedAt: string;
}

export interface TermsResponse {
  items: TermsItem[];
  total: number;
}

export const termsApi = {
  getPublishedTerms: async () => {
    return httpClient.get<TermsResponse>("/terms/published");
  },
};
