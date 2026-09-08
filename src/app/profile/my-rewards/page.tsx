"use client";

import { useAllUserVouchers } from "@/features/vouchers/hooks/useVouchers";
import { getUser } from "@/lib/session";
import { formatRupiah } from "@/lib/format-rupiah";
import { Gift, Clock, CheckCircle, AlertCircle, Ticket } from "lucide-react";
import dayjs from "dayjs";
import { useMemo } from "react";

export default function MyRewardsPage() {
  const authUser = useMemo(() => getUser(), []);
  const { data: vouchers, isLoading } = useAllUserVouchers(authUser?.id);

  const getStatusBadge = (status: string, isExpired: boolean) => {
    if (status === "available" && isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
          <AlertCircle className="w-3 h-3" />
          Expired
        </span>
      );
    }

    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" />
            Tersedia
          </span>
        );
      case "used":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            <CheckCircle className="w-3 h-3" />
            Sudah Digunakan
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
            <AlertCircle className="w-3 h-3" />
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const availableVouchers = vouchers?.filter(
    (v) => v.status === "available" && !v.isExpired
  ) || [];
  const otherVouchers = vouchers?.filter(
    (v) => v.status !== "available" || v.isExpired
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-amber-100 rounded-xl">
          <Gift className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Rewards</h2>
          <p className="text-sm text-gray-500">Voucher cashback dari pembelian trip kamu</p>
        </div>
      </div>

      {(!vouchers || vouchers.length === 0) ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">Belum Ada Voucher</h3>
          <p className="text-sm text-gray-400 mt-1">
            Voucher cashback akan muncul di sini setelah kamu booking trip dengan promo cashback.
          </p>
        </div>
      ) : (
        <>
          {/* Available Vouchers */}
          {availableVouchers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Voucher Aktif ({availableVouchers.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableVouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="relative bg-white rounded-xl border-2 border-amber-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Ticket notch decorations */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-gray-50 rounded-r-full border-r-2 border-amber-200"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-gray-50 rounded-l-full border-l-2 border-amber-200"></div>

                    <div className="p-5 pl-7 pr-7">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Gift className="w-5 h-5 text-amber-500" />
                          <span className="text-sm font-semibold text-gray-700">{voucher.promo?.name || "Cashback Voucher"}</span>
                        </div>
                        {getStatusBadge(voucher.status, voucher.isExpired)}
                      </div>

                      <div className="text-2xl font-bold text-amber-600 mb-2">
                        {formatRupiah(voucher.voucherAmount)}
                      </div>

                      <div className="space-y-1 text-xs text-gray-500">
                        {voucher.sourceTrip && (
                          <div className="flex items-center gap-1.5">
                            <Ticket className="w-3.5 h-3.5" />
                            <span>Dari trip: {voucher.sourceTrip}</span>
                          </div>
                        )}
                        {voucher.expiresAt && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Berlaku hingga {dayjs(voucher.expiresAt).format("DD MMM YYYY")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Used/Expired Vouchers */}
          {otherVouchers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                Riwayat ({otherVouchers.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherVouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="relative bg-gray-50 rounded-xl border border-gray-200 overflow-hidden opacity-70"
                  >
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-white rounded-r-full border-r border-gray-200"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-white rounded-l-full border-l border-gray-200"></div>

                    <div className="p-5 pl-7 pr-7">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Gift className="w-5 h-5 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-500">{voucher.promo?.name || "Cashback Voucher"}</span>
                        </div>
                        {getStatusBadge(voucher.status, voucher.isExpired)}
                      </div>

                      <div className="text-2xl font-bold text-gray-400 mb-2">
                        {formatRupiah(voucher.voucherAmount)}
                      </div>

                      <div className="space-y-1 text-xs text-gray-400">
                        {voucher.sourceTrip && (
                          <div className="flex items-center gap-1.5">
                            <Ticket className="w-3.5 h-3.5" />
                            <span>Dari trip: {voucher.sourceTrip}</span>
                          </div>
                        )}
                        {voucher.usedAt && (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Digunakan pada {dayjs(voucher.usedAt).format("DD MMM YYYY")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}