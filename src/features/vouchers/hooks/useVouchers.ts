import { useQuery } from "@tanstack/react-query";
import { voucherApi } from "../api/voucher-api";

export const useUserVouchers = (userId?: number) => {
  return useQuery({
    queryKey: ["user-vouchers", userId],
    queryFn: () => voucherApi.getUserVouchers(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};

export const useAllUserVouchers = (userId?: number) => {
  return useQuery({
    queryKey: ["user-vouchers-all", userId],
    queryFn: () => voucherApi.getAllUserVouchers(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};
