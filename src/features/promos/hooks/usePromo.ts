import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { GetPromoParams, promoApi } from "../api/promo-api";

export const usePromos = (params?: GetPromoParams) => {
  const tripId = params?.tripId;
  const date = params?.date;
  const participantCount = params?.participantCount;

  return useQuery({
    queryKey: ["promo-applicable", tripId, date, participantCount],
    queryFn: () =>
      promoApi.getApplicablePromos({
        tripId,
        date,
        participantCount,
      }),
    enabled: !!tripId && !!date && !!participantCount,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const usePromoWebsite = () => {
  return useQuery({
    queryKey: ["promo-website"],
    queryFn: () => promoApi.getPromoWebsite(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useDetailPromoWebsite = (slug?: string) => {
  return useQuery({
    queryKey: ["promo-website-detail", slug],
    queryFn: () => promoApi.getDetailPromoWebsite(slug),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const usePromoCode = (params?: GetPromoParams) => {
  const { isReady, isAuth, user } = useAuth();

  return useQuery({
    queryKey: ["promo-code", params, user?.id],
    queryFn: () => promoApi.getPromoByCode(user?.id!, params),
    enabled: !!isReady && !!isAuth && !!(params?.tripId && params?.q),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};
