import { useMutation } from "@tanstack/react-query";
import { perdinApi, PerdinPayload } from "../api/perdin-api";

export const usePerdinMutation = () => {
  return useMutation({
    mutationKey: ["perdin-trip"],
    mutationFn: (payload: PerdinPayload) => perdinApi.postPerdin(payload),
  });
};
