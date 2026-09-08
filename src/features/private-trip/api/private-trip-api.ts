import { httpClient } from "@/lib/api/http-client";
import dayjs from "dayjs";

export interface PrivateTripBody {
  name: string;
  email: string;
  phone: string;
  destination: string;
  departDate: Date | null;
  days: number;
  source: string
  totalParticipant?: number;
  note?: string;
}

export const privateTripApi = {
  postPrivateTrip: async (body?: PrivateTripBody) => {
    return httpClient.post("/leads-private-trip/public", {
      ...body,
      departDate: dayjs(body?.departDate).format("YYYY-MM-DD"),
    });
  },
};
