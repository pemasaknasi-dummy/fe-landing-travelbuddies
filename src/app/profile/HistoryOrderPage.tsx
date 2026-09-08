"use client";

import { SpinnerLoading } from "@/components/sections/SpinnerLoading";
import { useInfiniteHistory } from "@/features/bookings/hooks/useBooking";
import { History, ChevronRight, Filter } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";
import { ListBookingResponse } from "@/features/bookings/api/booking-api";
import dayjs from "dayjs";
import ListHistoryOrderV3 from "@/components/sections/CardListHistoryOrderV3";

export default function HistoryOrderPage() {
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "paid" | "cancel">("all");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteHistory({
    take: 12,
    status: activeFilter,
  });

  const getBookingCategory = (item: ListBookingResponse) => {
    const rawStatus = item?.payment?.status?.toUpperCase() || "";
    const rootBookingStatus = (item?.status || "").toUpperCase();
    const rawPaymentScheme = item?.paymentScheme || "FULL";
    const isDP = rawPaymentScheme.toUpperCase() === "DP";
    const isPaidStatus = (s?: string | null) =>
      ["PAID", "SUCCESS", "SETTLEMENT", "COMPLETED"].includes(s?.toUpperCase() || "");

    const details = item?.payment?.details || [];
    const mainDetails = details.filter(
      (p) => !p.orderId?.startsWith("TB-ADD-") && !p.orderId?.startsWith("TB-ADDL-")
    );

    const dpDetail = details.find((p) => p.orderId?.endsWith("-DP")) || mainDetails[0] || details[0];
    const finalDetail = details.find((p) => p.orderId?.endsWith("-FINAL"));

    const hasAnyPaidDetail =
      mainDetails.some((p) => isPaidStatus(p.status)) || isPaidStatus(rawStatus) || isPaidStatus(rootBookingStatus);

    const isDpPaid =
      isDP &&
      (isPaidStatus(dpDetail?.status) ||
        isPaidStatus(item?.payment?.dpPaymentStatus) ||
        rawStatus === "PARTIAL" ||
        hasAnyPaidDetail);

    const isDev =
      process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_NEXT_ENV === "development" ||
      process.env.NEXT_ENV === "development";
    const expiryMinutes = isDev ? 3 : 45;

    const isDetailExpired = (createdAt?: string, expiryDate?: string) => {
      if (expiryDate) {
        const expTime = new Date(expiryDate).getTime();
        if (!isNaN(expTime)) {
          return Date.now() >= expTime;
        }
      }
      if (!createdAt) return true;
      const createdTime = new Date(createdAt).getTime();
      const now = Date.now();
      return now >= createdTime + expiryMinutes * 60 * 1000;
    };

    const daysBefore = item?.trip?.dpRepaymentDaysBefore ?? 7;
    const allowOverdueRepayment = Boolean(item?.allowOverdueRepayment);
    const tripDateVal = item?.tripDate?.date;

    const isRepaymentEligible =
      allowOverdueRepayment ||
      (tripDateVal
        ? dayjs(tripDateVal).subtract(daysBefore, "day").endOf("day").diff(dayjs(), "second") > 0
        : false);

    const isPastRepaymentDeadline = !isRepaymentEligible;

    const activePendingDetail = details.find(
      (p: any) =>
        p.status?.toUpperCase() === "PENDING" &&
        Boolean(p.xenditInvoiceUrl) &&
        !isDetailExpired(p.createdAt, p.expiryDate || (p as any)?.rawResponse?.expiry_date) &&
        !(isDP && (item?.repaymentPastDueDate || isPastRepaymentDeadline) && p.orderId?.endsWith("-FINAL"))
    );

    const isSuccess =
      isPaidStatus(rawStatus) ||
      isPaidStatus(rootBookingStatus) ||
      (!activePendingDetail &&
        (isDP
          ? isDpPaid && (isPaidStatus(finalDetail?.status) || isPaidStatus(item?.payment?.repaymentStatus))
          : hasAnyPaidDetail));

    const isTripCancelled = [
      "cancel",
      "cancelled",
      "canceled",
      "trip_cancelled",
      "batal",
      "dibatalkan",
    ].includes((item?.tripDate?.status || "").toLowerCase().trim());

    // 1. Prioritaskan jika trip dibatalkan
    if (isTripCancelled) return "cancel";

    // 2. Prioritaskan jika pembayaran sukses/lunas
    if (isSuccess) return "paid";

    // 3. Cek expired
    const hasExpiredDP = details.some(
      (p: any) => p?.orderId?.endsWith("-DP") && (p.status?.toUpperCase() === "EXPIRED" || p.status?.toUpperCase() === "FAILED")
    );

    const expiredRepayment = details.find(
      (p: any) => p?.orderId?.endsWith("-FINAL") && (p.status?.toUpperCase() === "EXPIRED" || p.status?.toUpperCase() === "FAILED")
    );
    const hasExpiredRepayment = Boolean(expiredRepayment);

    const hasExpiredFullPayment =
      (!isDP || rawPaymentScheme === "FULL") &&
      mainDetails.some(
        (p: any) => p.status?.toUpperCase() === "EXPIRED" || p.status?.toUpperCase() === "FAILED"
      );

    const isDpForfeited = Boolean(item?.dpForfeited);

    const isRepaymentExpired =
      isDP &&
      !isSuccess &&
      (item?.repaymentPastDueDate || isPastRepaymentDeadline || isDpForfeited || (hasExpiredRepayment && !isRepaymentEligible));

    if (
      rootBookingStatus === "EXPIRED" ||
      rootBookingStatus === "FAILED" ||
      rootBookingStatus === "CANCELLED" ||
      rootBookingStatus === "CANCEL" ||
      rawStatus === "EXPIRED" ||
      rawStatus === "FAILED" ||
      rawStatus === "CANCELLED" ||
      rawStatus === "CANCEL" ||
      isDpForfeited ||
      (isDP ? hasExpiredDP || isRepaymentExpired || (!isSuccess && !isRepaymentEligible) : hasExpiredFullPayment)
    ) {
      return "cancel";
    }

    return "active";
  };

  const filteredBookings = useMemo(() => {
    const raw = data?.pages.flatMap((page) => page.items) ?? [];
    if (activeFilter === "all") return raw;
    return raw.filter((item) => getBookingCategory(item) === activeFilter);
  }, [data, activeFilter]);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        fetchNextPage();
      }
    });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) return <SpinnerLoading />;

  return (
    <div className="mt-2">
      <div className="bg-transparent lg:bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100/50 lg:p-5">
        
        {/* Row Filter Horizontal */}
        <div className="flex items-center gap-2 lg:gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
          <div className="hidden lg:flex items-center gap-1.5 mr-2 text-gray-400">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Filter:</span>
          </div>

          <button
            onClick={() => setActiveFilter("all")}
            className={`shrink-0 hover:cursor-pointer px-4 py-2 rounded-full text-xs lg:text-[13px] font-semibold transition-all border ${
              activeFilter === "all"
                ? "bg-[#1D79B5]/10 border-[#1D79B5] text-[#1D79B5]"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            Semua Status
          </button>

          <button
            onClick={() => setActiveFilter("active")}
            className={`shrink-0 hover:cursor-pointer px-4 py-2 rounded-full text-xs lg:text-[13px] font-semibold transition-all border ${
              activeFilter === "active"
                ? "bg-[#1D79B5]/10 border-[#1D79B5] text-[#1D79B5]"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            Aktif (Menunggu)
          </button>

          <button
            onClick={() => setActiveFilter("paid")}
            className={`shrink-0 hover:cursor-pointer px-4 py-2 rounded-full text-xs lg:text-[13px] font-semibold transition-all border ${
              activeFilter === "paid"
                ? "bg-[#1D79B5]/10 border-[#1D79B5] text-[#1D79B5]"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            Selesai / Lunas
          </button>

          <button
            onClick={() => setActiveFilter("cancel")}
            className={`shrink-0 hover:cursor-pointer px-4 py-2 rounded-full text-xs lg:text-[13px] font-semibold transition-all border ${
              activeFilter === "cancel"
                ? "bg-[#1D79B5]/10 border-[#1D79B5] text-[#1D79B5]"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            Dibatalkan
          </button>
        </div>

        {/* Separator (Desktop Only) */}
        <div className="hidden lg:block h-px bg-gray-100 w-full my-5"></div>

        {/* Empty State */}
        {filteredBookings.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-2xl border border-gray-100 my-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-[#1D79B5]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Tidak ada history ditemukan</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm">
              Coba ubah status filter atau jelajahi destinasi trip menarik lainnya.
            </p>
            <Link
              href="/open-trip"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1D79B5] text-white rounded-xl hover:bg-[#155A8A] transition-all text-sm font-semibold shadow-sm"
            >
              Jelajahi Trip
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Grid Cards Container */}
        {filteredBookings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 mt-4 lg:mt-0">
            {filteredBookings.map((booking, index) => (
              <ListHistoryOrderV3 data={booking} key={booking.bookingId || index} />
            ))}
          </div>
        )}

        {/* SENTINEL */}
        <div ref={loadMoreRef} className="h-10" />

        {isFetchingNextPage && (
          <span className="flex justify-center items-center gap-3 mt-4">
            <div className="w-6 h-6 border-4 border-gray-300 border-t-[#1D79B5] rounded-full animate-spin" />
            <p className="font-semibold text-gray-500 text-sm">Memuat history lainnya...</p>
          </span>
        )}

        {/* Footer Count */}
        <div className="flex items-center justify-center gap-3 mt-8 pb-4 text-gray-400 opacity-70">
          <div className="w-10 lg:w-12 h-px bg-gray-300"></div>
          <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider">
            Menampilkan {filteredBookings.length} History
          </span>
          <div className="w-10 lg:w-12 h-px bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
}
