"use client";

import { ListBookingResponse } from "@/features/bookings/api/booking-api";
import { formatRupiah } from "@/lib/format-rupiah";
import { useCountdown } from "@/lib/useCountdown";
import dayjs from "dayjs";
import { ChevronRight, Clock, CheckCircle2, XCircle, MapPin, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Props {
  data: ListBookingResponse;
}

export default function ListHistoryOrderV2({ data }: Props) {
  const rawStatus = data?.payment?.status?.toUpperCase() || "";
  const paymentScheme = data?.paymentScheme?.toUpperCase() || "FULL";
  const isDP = paymentScheme === "DP";

  // Helper for paid status check
  const isPaidStatus = (s?: string | null) =>
    ["PAID", "SUCCESS", "SETTLEMENT", "COMPLETED"].includes(s?.toUpperCase() || "");

  // Details array from payment
  const details = data?.payment?.details || [];

  // Filter active payment details (exclude expired/failed additionals: TB-ADD- or TB-ADDL-)
  const activePayments = details.filter((p) => {
    const isAddition = p.orderId?.startsWith("TB-ADD-") || p.orderId?.startsWith("TB-ADDL-");
    const status = p.status?.toUpperCase();
    if (isAddition && (status === "EXPIRED" || status === "FAILED")) {
      return false;
    }
    return true;
  });

  // Filter main details (exclude additionals: TB-ADD- or TB-ADDL-)
  const mainDetails = details.filter(
    (p) => !p.orderId?.startsWith("TB-ADD-") && !p.orderId?.startsWith("TB-ADDL-")
  );

  // Check if any main payment detail item is paid
  const hasAnyPaidDetail =
    mainDetails.some((p) => isPaidStatus(p.status)) || isPaidStatus(rawStatus);

  // Find DP detail & final detail
  const dpDetail = details.find((p) => p.orderId?.endsWith("-DP")) || mainDetails[0] || details[0];
  const finalDetail = details.find((p) => p.orderId?.endsWith("-FINAL"));

  // Calculate total paid from details
  const totalPaid = details
    .filter((p) => isPaidStatus(p.status))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // Calculate clean totalAmount from activePayments if details exist
  const totalAmount =
    details.length > 0
      ? activePayments.reduce((sum, p) => sum + (p.amount || 0), 0)
      : data?.payment?.totalAmount || 0;

  const dpAmount = totalPaid > 0 ? totalPaid : (dpDetail?.amount || data?.payment?.dpAmount || 0);

  // Clean repayment amount (active total minus DP paid)
  const repaymentAmount = Math.max(0, totalAmount - (totalPaid > 0 ? totalPaid : dpAmount));

  // Check if DP is paid
  const isDpPaid =
    isDP &&
    (isPaidStatus(dpDetail?.status) ||
      isPaidStatus(data?.payment?.dpPaymentStatus) ||
      rawStatus === "PARTIAL" ||
      hasAnyPaidDetail);

  const isDpPending =
    isDP &&
    !isDpPaid &&
    (dpDetail?.status?.toUpperCase() === "PENDING" ||
      data?.payment?.dpPaymentStatus?.toUpperCase() === "PENDING" ||
      rawStatus === "PENDING");

  // Determine environment countdown duration (3 minutes in dev, 45 minutes in prod)
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
    const now = new Date().getTime();
    return now >= createdTime + expiryMinutes * 60 * 1000;
  };

  const daysBefore = data?.trip?.dpRepaymentDaysBefore ?? 7;
  const isPastRepaymentDeadline = data?.tripDate?.date
    ? dayjs().isAfter(dayjs(data.tripDate.date).subtract(daysBefore, "day").endOf("day"))
    : false;

  // Check if there is an ACTIVE pending payment invoice (has PENDING status, xenditInvoiceUrl, AND timer is not expired)
  const activePendingDetail = details.find(
    (p) =>
      p.status?.toUpperCase() === "PENDING" &&
      !!p.xenditInvoiceUrl &&
      !isDetailExpired(p.createdAt, p.expiryDate || (p as any).rawResponse?.expiry_date) &&
      !(isDP && (data?.repaymentPastDueDate || isPastRepaymentDeadline) && p.orderId?.endsWith("-FINAL"))
  );

  // Determine if main booking is fully paid
  const isSuccess =
    isPaidStatus(rawStatus) ||
    (!activePendingDetail &&
      (isDP
        ? isDpPaid && (isPaidStatus(finalDetail?.status) || isPaidStatus(data?.payment?.repaymentStatus))
        : hasAnyPaidDetail));

  // DP booking is expired ONLY IF repayment deadline passed or backend flag repaymentPastDueDate is true
  const isRepaymentExpired =
    isDP &&
    isDpPaid &&
    !isSuccess &&
    (data?.repaymentPastDueDate || isPastRepaymentDeadline);

  const hasExpiredFullPayment =
    !isDP &&
    mainDetails.length > 0 &&
    mainDetails.every((p) => p.status?.toUpperCase() === "EXPIRED" || p.status?.toUpperCase() === "FAILED");

  const hasExpiredDP =
    isDP &&
    !isDpPaid &&
    (dpDetail?.status?.toUpperCase() === "EXPIRED" || dpDetail?.status?.toUpperCase() === "FAILED");

  const isExpired =
    !isSuccess &&
    (isRepaymentExpired ||
      rawStatus === "EXPIRED" ||
      rawStatus === "FAILED" ||
      rawStatus === "CANCELLED" ||
      rawStatus === "CANCEL" ||
      hasExpiredFullPayment ||
      hasExpiredDP);

  let tagBg = "bg-orange-500";
  let tagIcon = <Clock className="w-3.5 h-3.5 mr-1 inline-block" />;
  let tagText = "Menunggu Pembayaran";
  let priceLabel = "TOTAL TAGIHAN";
  let priceValue = formatRupiah(totalAmount);
  let priceColor = "text-orange-700";
  let actionText = "Lihat Detail";
  let actionColor = "text-orange-600";
  let borderColor = "border-orange-200/60";
  let isCardDisabled = false;
  let dateSubText = null;
  let createdAtForCountdown = "";
  let showCountdown = false;

  if (activePendingDetail) {
    // ── KASUS 1: ADA INVOICE XENDIT AKTIF & BELUM EXPIRED ──
    createdAtForCountdown = activePendingDetail.createdAt || data?.payment?.createdAt || "";
    showCountdown = true;

    const orderId = activePendingDetail.orderId || "";

    if (orderId.startsWith("TB-ADD-")) {
      tagBg = "bg-orange-500";
      tagIcon = <Clock className="w-3.5 h-3.5 mr-1 inline-block" />;
      tagText = "Menunggu Pembayaran Tambah Peserta";
      priceLabel = "TAGIHAN PENAMBAHAN";
      priceValue = formatRupiah(activePendingDetail.amount);
      priceColor = "text-orange-700";
      actionText = "Bayar Sekarang";
      actionColor = "text-orange-600";
      borderColor = "border-orange-200/60";
    } else if (orderId.startsWith("TB-ADDL-")) {
      tagBg = "bg-orange-500";
      tagIcon = <Clock className="w-3.5 h-3.5 mr-1 inline-block" />;
      tagText = "Menunggu Pembayaran Additional";
      priceLabel = "TAGIHAN ADDITIONAL";
      priceValue = formatRupiah(activePendingDetail.amount);
      priceColor = "text-orange-700";
      actionText = "Bayar Sekarang";
      actionColor = "text-orange-600";
      borderColor = "border-orange-200/60";
    } else if (orderId.endsWith("-FINAL") || (isDP && isDpPaid)) {
      tagBg = "bg-[#1D79B5]";
      tagIcon = <Clock className="w-3.5 h-3.5 mr-1 inline-block" />;
      tagText = "Menunggu Pembayaran Pelunasan";
      priceLabel = "SISA PELUNASAN";
      priceValue = formatRupiah(activePendingDetail.amount || repaymentAmount);
      priceColor = "text-[#1D79B5]";
      actionText = "Bayar Pelunasan";
      actionColor = "text-[#1D79B5]";
      borderColor = "border-blue-200/60";
    } else if (orderId.endsWith("-DP") || (isDP && !isDpPaid)) {
      tagBg = "bg-red-500";
      tagIcon = <Clock className="w-3.5 h-3.5 mr-1 inline-block" />;
      tagText = "Menunggu Pembayaran DP";
      priceLabel = "TAGIHAN DP";
      priceValue = formatRupiah(activePendingDetail.amount || dpAmount || totalAmount);
      priceColor = "text-red-600";
      actionText = "Bayar DP Sekarang";
      actionColor = "text-red-600";
      borderColor = "border-red-200/60";
    } else {
      tagBg = "bg-orange-500";
      tagIcon = <Clock className="w-3.5 h-3.5 mr-1 inline-block" />;
      tagText = "Menunggu Pembayaran";
      priceLabel = "TOTAL TAGIHAN";
      priceValue = formatRupiah(totalAmount);
      priceColor = "text-orange-700";
      actionText = "Lihat Tagihan";
      actionColor = "text-orange-600";
      borderColor = "border-orange-200/60";
    }

    if (isDP && isDpPaid) {
      dateSubText = (
        <p className="text-[10px] font-semibold text-green-600 flex items-center mt-1">
          <Check className="w-3 h-3 mr-0.5" /> DP {formatRupiah(dpAmount)} Lunas
        </p>
      );
    }
  } else {
    // ── KASUS 2: TIDAK ADA INVOICE XENDIT AKTIF / TIMER PENDING SUDAH EXPIRED ──
    showCountdown = false;

    if (isSuccess) {
      tagBg = "bg-green-500";
      tagIcon = <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline-block" />;
      tagText = "Pembayaran Sukses";
      priceLabel = "TOTAL DIBAYAR";
      priceValue = formatRupiah(totalAmount);
      priceColor = "text-green-700";
      actionText = "Lihat Detail";
      actionColor = "text-green-700";
      borderColor = "border-green-200/60";
    } else if (isExpired) {
      isCardDisabled = true;
      tagBg = "bg-gray-600";
      tagIcon = <XCircle className="w-3.5 h-3.5 mr-1 inline-block" />;
      tagText = "Kedaluwarsa";
      priceLabel = "TOTAL TAGIHAN";
      priceValue = formatRupiah(totalAmount);
      priceColor = "text-gray-500 line-through";
      actionText = "Lihat Detail";
      actionColor = "text-gray-500";
      borderColor = "border-gray-300/60";
    } else if (isDP && isDpPaid) {
      tagBg = "bg-blue-500";
      tagIcon = <Clock className="w-3.5 h-3.5 mr-1 inline-block" />;
      const daysBefore = data?.trip?.dpRepaymentDaysBefore ?? 7;
      tagText = `Menunggu Pelunasan H-${daysBefore}`;
      dateSubText = (
        <p className="text-[10px] font-semibold text-green-600 flex items-center mt-1">
          <Check className="w-3 h-3 mr-0.5" /> DP {formatRupiah(dpAmount)} Lunas
        </p>
      );
      priceLabel = "SISA PELUNASAN";
      priceValue = formatRupiah(repaymentAmount);
      priceColor = "text-blue-600";
      actionText = "Bayar Pelunasan";
      actionColor = "text-blue-600";
      borderColor = "border-blue-200/60";
    } else if (isDP && !isDpPaid) {
      tagBg = "bg-red-500";
      tagIcon = <Clock className="w-3.5 h-3.5 mr-1 inline-block" />;
      tagText = "Menunggu Pembayaran DP";
      priceLabel = "TAGIHAN DP";
      priceValue = formatRupiah(dpAmount || totalAmount);
      priceColor = "text-red-600";
      actionText = "Bayar DP Sekarang";
      actionColor = "text-red-600";
      borderColor = "border-red-200/60";
    } else {
      tagBg = "bg-orange-500";
      tagIcon = <Clock className="w-3.5 h-3.5 mr-1 inline-block" />;
      tagText = "Menunggu Pembayaran";
      priceLabel = "TOTAL TAGIHAN";
      priceValue = formatRupiah(totalAmount);
      priceColor = "text-orange-700";
      actionText = "Lihat Tagihan";
      actionColor = "text-orange-600";
      borderColor = "border-orange-200/60";
    }
  }

  const { minutes, seconds, isExpired: isTimerExpired } = useCountdown(
    createdAtForCountdown,
    showCountdown ? "PENDING" : "",
    activePendingDetail?.expiryDate || (activePendingDetail as any)?.rawResponse?.expiry_date || (activePendingDetail as any)?.rawResponse?.invoiceDuration
  );

  const formattedCountdown = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <Link
      href={`/booking/${data?.bookingId}`}
      className={`block bg-white rounded-2xl border border-gray-200 shadow-sm transition-all duration-300 active:scale-[0.98] hover:shadow-md hover:scale-105 overflow-hidden ${isCardDisabled ? "opacity-80" : ""
        }`}
    >
      {/* Top Image Banner */}
      <div
        className={`relative h-32 lg:h-36 bg-cover bg-center ${isCardDisabled ? "grayscale" : ""}`}
        style={{
          backgroundImage: `url('${data?.trip?.image || "/images/empty-state.png"}')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

        {/* Top Header Bar (Zero Overlap Flex Layout) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-10">
          {/* Status Badge with Countdown */}
          <div className={`${tagBg} text-white px-2.5 py-1 rounded-lg flex items-center shadow-md text-[11px] font-bold max-w-[72%] min-w-0`}>
            <span className="flex items-center min-w-0">
              {tagIcon}
              <span className="truncate">
                {showCountdown && !isTimerExpired
                  ? tagText.startsWith("Menunggu Pembayaran ")
                    ? tagText.replace("Menunggu Pembayaran ", "Bayar ")
                    : tagText === "Menunggu Pembayaran"
                      ? "Menunggu Bayar"
                      : tagText
                  : tagText}
              </span>
              {showCountdown && !isTimerExpired && (
                <span className="bg-black/35 text-white px-1.5 py-0.5 rounded ml-1.5 font-mono text-[10px] font-extrabold flex-shrink-0">
                  {formattedCountdown}
                </span>
              )}
            </span>
          </div>

          {/* Trip Type Badge */}
          <div
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md backdrop-blur-md flex-shrink-0 ${data?.tripDate?.isGuarantee
              ? "bg-orange-600/90 text-white"
              : "bg-sky-600/90 text-white"
              }`}
          >
            {data?.tripDate?.isGuarantee ? "Private" : "Open Trip"}
          </div>
        </div>

        {/* Title & Location Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h2 className={`text-sm lg:text-base font-bold truncate ${isCardDisabled ? "text-gray-300" : "text-white"}`}>
            {data?.trip?.title}
          </h2>
          <div className={`flex items-center text-[11px] font-medium mt-0.5 ${isCardDisabled ? "text-gray-400" : "text-gray-200"}`}>
            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">{data?.trip?.location}</span>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-3.5 lg:p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-[10px] text-gray-500 font-medium mb-0.5 uppercase tracking-wider">TANGGAL TRIP</p>
            <p className={`text-xs lg:text-sm font-bold ${isCardDisabled ? "text-gray-600" : "text-gray-800"}`}>
              {dayjs(data?.tripDate?.date).format("DD MMM YYYY")}
            </p>
            {dateSubText}
          </div>

          <div className="text-right">
            <p className={`text-[10px] ${isSuccess ? "text-green-700" : isDP ? "text-blue-600" : "text-gray-500"} font-semibold mb-0.5 uppercase tracking-wider`}>
              {priceLabel}
            </p>
            <p className={`text-sm lg:text-base font-bold ${priceColor}`}>
              {priceValue}
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className={`border-t ${borderColor} pt-3 flex justify-between items-center group`}>
          <span className={`${actionColor} font-semibold text-xs lg:text-sm group-hover:underline`}>
            {actionText}
          </span>
          <div className={`${actionColor}`}>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export { ListHistoryOrderV2 as CardListHistoryOrderV2 };
