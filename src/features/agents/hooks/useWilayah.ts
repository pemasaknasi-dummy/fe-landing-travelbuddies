import { useQuery } from "@tanstack/react-query";
import { wilayahApi } from "../api/wilayah-api";

export const useProvinces = () => {
  return useQuery({
    queryKey: ["wilayah", "provinces"],
    queryFn: () => wilayahApi.getProvinces(),
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useRegencies = (provinceId: string | null | undefined) => {
  return useQuery({
    queryKey: ["wilayah", "regencies", provinceId],
    queryFn: () => wilayahApi.getRegencies(provinceId as string),
    enabled: Boolean(provinceId),
    staleTime: 60 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useDistricts = (regencyId: string | null | undefined) => {
  return useQuery({
    queryKey: ["wilayah", "districts", regencyId],
    queryFn: () => wilayahApi.getDistricts(regencyId as string),
    enabled: Boolean(regencyId),
    staleTime: 60 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useVillages = (districtId: string | null | undefined) => {
  return useQuery({
    queryKey: ["wilayah", "villages", districtId],
    queryFn: () => wilayahApi.getVillages(districtId as string),
    enabled: Boolean(districtId),
    staleTime: 60 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const usePostalCodeLookup = (query: string | null | undefined) => {
  return useQuery({
    queryKey: ["wilayah", "postal-code", query],
    queryFn: () => wilayahApi.getPostalCodes(query as string),
    enabled: Boolean(query && query.trim().length >= 3),
    staleTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

