import { httpClient } from "@/lib/api/http-client";

export interface UserVoucher {
  id: number;
  voucherAmount: number;
  status: "available" | "used" | "expired";
  expiresAt: string | null;
  usedAt: string | null;
  createdAt: string;
  isExpired: boolean;
  sourceTrip: string | null;
  promo: {
    id: number;
    name: string;
    description: string;
    image: string | null;
  } | null;
}

export const voucherApi = {
  getUserVouchers: async (userId: number) => {
    const res = await httpClient.get<{ vouchers: UserVoucher[] }>(`/promos/vouchers/${userId}`);
    return res.vouchers;
  },

  getAllUserVouchers: async (userId: number) => {
    const res = await httpClient.get<{ vouchers: UserVoucher[] }>(`/promos/vouchers/${userId}`, { status: "available" });
    return res.vouchers;
  },
};