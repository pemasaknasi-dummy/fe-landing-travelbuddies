import { httpClient } from "@/lib/api/http-client";

export interface Banner {
  id: number;
  name: string;
  imageUrl: string;
  position: number;
  url: string;
}

export const bannerApi = {
  getTrips: async () => {
    return httpClient.get<{ items: Banner[] }>("/banners");
  },
};
