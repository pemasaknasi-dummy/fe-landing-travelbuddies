import { httpClient } from "@/lib/api/http-client";
import dayjs from "dayjs";

export interface PerdinPayload {
  name: string;
  email: string;
  phone: string;
  position: string;
  companyName: string;
  companySegment: string;
  companyWebsite?: string;
  companySegmentOther?: string;
}

export const perdinApi = {
  postPerdin: async (payload?: PerdinPayload) => {
    return httpClient.post("/perdin-trip", payload);
  },
};
