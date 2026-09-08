import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IProfileUpdate, profileApi } from "../api/profile-api";
import { useAuth } from "@/context/AuthContext";
import { setSession } from "@/lib/session";

/* =======================
   GET PROFILE
======================= */
export const useProfileQuery = () => {
  const { isReady, isAuth } = useAuth();

  return useQuery({
    queryKey: ["profile"],
    queryFn: () => profileApi.getProfile(),
    enabled: !!isReady && !!isAuth,
    staleTime: 5 * 60 * 1000,
  });
};

/* =======================
   UPDATE PROFILE
======================= */
export const useUpdateProfile = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-profile"],
    mutationFn: (body: IProfileUpdate) => profileApi.updateProfile(body),
    onSuccess: (data) => {
      setSession(token!, data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
