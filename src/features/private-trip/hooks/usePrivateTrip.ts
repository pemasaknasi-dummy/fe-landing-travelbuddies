import { useMutation, useQuery } from "@tanstack/react-query";
import { privateTripApi, PrivateTripBody } from "../api/private-trip-api";

export const usePrivateTripMutation = () => {
  return useMutation({
    mutationKey: ["private-trip"],
    mutationFn: (body: PrivateTripBody) => privateTripApi.postPrivateTrip(body),
  });
};
