"use client";

import { ListBookingResponse } from "@/features/bookings/api/booking-api";
import { useCountdown } from "@/lib/useCountdown";
import dayjs from "dayjs";
import {
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  Users,
  Lock,
} from "lucide-react";
import Link from "next/link";

interface Props {
  data: ListBookingResponse;
}

export default function ListHistoryOrderV3({ data }: Props) {
  const rawStatus = data?.payment?.status?.toUpperCase() || "";
  const rootBookingStatus = (data?.status || "").toUpperCase();
  const rawPaymentScheme = data?.paymentScheme || "FULL";
  const paymentSchemeLower = rawPaymentScheme.toLowerCase();
  const isDP = paymentSchemeLower === "dp" || rawPaymentScheme.toUpperCase() === "DP";

  // Helper for paid status check
  const isPaidStatus = (s?: string | null) =>
    ["PAID", "SUCCESS", "SETTLEMENT", "COMPLETED"].includes(s?.toUpperCase() || "");

  // Details array from payment
  const details = data?.payment?.details || [];

  // Filter main details (exclude additionals: TB-ADD- or TB-ADDL-)
  const mainDetails = details.filter(
    (p) => !p.orderId?.startsWith("TB-ADD-") && !p.orderId?.startsWith("TB-ADDL-")
  );

  // Check if any main payment detail item is paid
  const hasAnyPaidDetail =
    mainDetails.some((p) => isPaidStatus(p.status)) || isPaidStatus(rawStatus) || isPaidStatus(rootBookingStatus);

  // Find DP detail & final detail
  const dpDetail = details.find((p) => p.orderId?.endsWith("-DP")) || mainDetails[0] || details[0];
  const finalDetail = details.find((p) => p.orderId?.endsWith("-FINAL"));

  // Check if DP is paid
  const isDpPaid =
    isDP &&
    (isPaidStatus(dpDetail?.status) ||
      isPaidStatus(data?.payment?.dpPaymentStatus) ||
      rawStatus === "PARTIAL" ||
      hasAnyPaidDetail);

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
  const allowOverdueRepayment = Boolean(data?.allowOverdueRepayment);

  const isRepaymentEligible =
    allowOverdueRepayment ||
    (data?.tripDate?.date
      ? dayjs(data.tripDate.date).subtract(daysBefore, "day").endOf("day").diff(dayjs(), "second") > 0
      : false);

  const isPastRepaymentDeadline = !isRepaymentEligible;

  // Check if there is an ACTIVE pending payment invoice
  const activePendingDetail = details.find(
    (p) =>
      p.status?.toUpperCase() === "PENDING" &&
      Boolean(p.xenditInvoiceUrl) &&
      !isDetailExpired(p.createdAt, p.expiryDate || p.rawResponse?.expiry_date) &&
      !(isDP && (data?.repaymentPastDueDate || isPastRepaymentDeadline) && p.orderId?.endsWith("-FINAL"))
  );

  // Determine if main booking is fully paid
  const isSuccess =
    isPaidStatus(rawStatus) ||
    isPaidStatus(rootBookingStatus) ||
    (!activePendingDetail &&
      (isDP
        ? isDpPaid && (isPaidStatus(finalDetail?.status) || isPaidStatus(data?.payment?.repaymentStatus))
        : hasAnyPaidDetail));

  // Check for expired payment conditions identical to detail page
  const hasExpiredDP = details.some(
    (p) => p?.orderId?.endsWith("-DP") && (p.status?.toUpperCase() === "EXPIRED" || p.status?.toUpperCase() === "FAILED")
  );

  const expiredRepayment = details.find(
    (p) => p?.orderId?.endsWith("-FINAL") && (p.status?.toUpperCase() === "EXPIRED" || p.status?.toUpperCase() === "FAILED")
  );
  const hasExpiredRepayment = Boolean(expiredRepayment);

  const hasExpiredFullPayment =
    (!isDP || rawPaymentScheme === "FULL") &&
    mainDetails.some(
      (p) => p.status?.toUpperCase() === "EXPIRED" || p.status?.toUpperCase() === "FAILED"
    );

  const isDpForfeited = Boolean(data?.dpForfeited);

  const isRepaymentExpired =
    isDP &&
    !isSuccess &&
    (data?.repaymentPastDueDate || isPastRepaymentDeadline || isDpForfeited || (hasExpiredRepayment && !isRepaymentEligible));

  const isStaticExpired =
    !isSuccess &&
    (rootBookingStatus === "EXPIRED" ||
      rootBookingStatus === "FAILED" ||
      rootBookingStatus === "CANCELLED" ||
      rootBookingStatus === "CANCEL" ||
      rawStatus === "EXPIRED" ||
      rawStatus === "FAILED" ||
      rawStatus === "CANCELLED" ||
      rawStatus === "CANCEL" ||
      isDpForfeited ||
      (isDP
        ? hasExpiredDP || isRepaymentExpired || (!isSuccess && !isRepaymentEligible)
        : hasExpiredFullPayment));

  // Countdown hook
  const createdAtForCountdown = activePendingDetail?.createdAt || data?.payment?.createdAt || "";
  const showCountdown = Boolean(activePendingDetail);

  const { minutes, seconds, isExpired: isTimerExpired } = useCountdown(
    createdAtForCountdown,
    showCountdown ? "PENDING" : "",
    activePendingDetail?.expiryDate ||
      activePendingDetail?.rawResponse?.expiry_date ||
      activePendingDetail?.rawResponse?.invoiceDuration
  );

  const formattedCountdown = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Final isExpired combining static status and timer expiration
  const isExpired =
    !isSuccess &&
    (isStaticExpired ||
      (showCountdown ? isTimerExpired : !activePendingDetail && (hasExpiredFullPayment || hasExpiredDP || isRepaymentExpired)));

  const isTripCancelled = [
    "cancel",
    "cancelled",
    "canceled",
    "trip_cancelled",
    "batal",
    "dibatalkan",
  ].includes((data?.tripDate?.status || "").toLowerCase().trim());

  // Trip Status Mapping
  const getTripStatusDisplay = (status?: string | null) => {
    const s = (status || "").toLowerCase().trim();
    switch (s) {
      case "pending":
      case "waiting_quota":
        return {
          label: "Menunggu Kuota",
          border: "border-amber-200",
          text: "text-amber-800",
          dotBg: "bg-amber-500",
        };
      case "closed":
      case "booking_closed":
        return {
          label: "Ditutup",
          border: "border-slate-300",
          text: "text-slate-700",
          dotBg: "bg-slate-500",
        };
      case "full":
      case "full_booked":
        return {
          label: "Penuh",
          border: "border-indigo-200",
          text: "text-indigo-800",
          dotBg: "bg-indigo-600",
        };
      case "depart":
      case "trip_ongoing":
      case "ongoing":
        return {
          label: "Sedang Berjalan",
          border: "border-blue-200",
          text: "text-blue-800",
          dotBg: "bg-blue-600",
        };
      case "done":
      case "trip_completed":
      case "completed":
        return {
          label: "Selesai",
          border: "border-emerald-200",
          text: "text-emerald-800",
          dotBg: "bg-emerald-600",
        };
      case "cancel":
      case "cancelled":
      case "canceled":
      case "trip_cancelled":
      case "dibatalkan":
      case "batal":
        return {
          label: "Dibatalkan",
          border: "border-red-200",
          text: "text-red-700",
          dotBg: "bg-red-600",
        };
      default:
        return {
          label: status || "Menunggu Kuota",
          border: "border-gray-200",
          text: "text-gray-700",
          dotBg: "bg-gray-400",
        };
    }
  };

  const tripStatusInfo = getTripStatusDisplay(data?.tripDate?.status);

  // Payment Scheme / Type Badge Display
  let paymentTypeLabel = "Full Payment";
  let paymentTypeBg = "bg-cyan-100";
  let paymentTypeText = "text-cyan-800";

  if (paymentSchemeLower === "pelunasan" || (isDP && isDpPaid && !isSuccess)) {
    paymentTypeLabel = `Pelunasan H-${daysBefore}`;
    paymentTypeBg = "bg-fuchsia-100";
    paymentTypeText = "text-fuchsia-800";
  } else if (isDP) {
    paymentTypeLabel = "DP";
    paymentTypeBg = "bg-violet-100";
    paymentTypeText = "text-violet-800";
  } else {
    paymentTypeLabel = "Full Payment";
    paymentTypeBg = "bg-cyan-100";
    paymentTypeText = "text-cyan-800";
  }

  // Helper for trip duration (e.g. "3D 2N", "1D")
  const getTripDuration = () => {
    if (data?.trip?.duration) return data.trip.duration;
    const days = data?.trip?.days;
    if (!days || days <= 0) return null;
    if (days === 1) return "1D";
    return `${days}D ${days - 1}N`;
  };

  const tripDuration = getTripDuration();

  // Payment Status at Card Bottom
  let paymentStatusLabel = "Menunggu Pembayaran";
  let paymentStatusIcon = <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
  let isCardDisabled = false;

  if (isSuccess) {
    paymentStatusLabel = "Pembayaran Lunas";
    paymentStatusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
  } else if (isExpired) {
    isCardDisabled = true;
    paymentStatusLabel = "Kedaluwarsa";
    paymentStatusIcon = <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
  } else if (activePendingDetail && !isTimerExpired) {
    const orderId = activePendingDetail.orderId || "";

    if (orderId.startsWith("TB-ADD-")) {
      paymentStatusLabel = "Menunggu Pembayaran Tambah Peserta";
      paymentStatusIcon = <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    } else if (orderId.startsWith("TB-ADDL-")) {
      paymentStatusLabel = "Menunggu Pembayaran Additional";
      paymentStatusIcon = <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    } else if (orderId.endsWith("-FINAL") || (isDP && isDpPaid)) {
      paymentStatusLabel = "Menunggu Pembayaran Pelunasan";
      paymentStatusIcon = <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
    } else if (orderId.endsWith("-DP") || (isDP && !isDpPaid)) {
      paymentStatusLabel = "Menunggu Pembayaran DP";
      paymentStatusIcon = <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
    } else {
      paymentStatusLabel = "Menunggu Pembayaran";
      paymentStatusIcon = <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    }
  } else if (isDP && isDpPaid) {
    paymentStatusLabel = `Menunggu Pelunasan`;
    paymentStatusIcon = <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
  } else if (isDP && !isDpPaid) {
    paymentStatusLabel = "Menunggu Pembayaran DP";
    paymentStatusIcon = <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
  } else {
    paymentStatusLabel = "Menunggu Pembayaran";
    paymentStatusIcon = <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
  }

  const isDpPaidAndActive = isDP && isDpPaid && !isSuccess && !activePendingDetail && !isExpired;
  const isPrivateTrip = Boolean(data?.tripDate?.isGuarantee);

  return (
    <Link
      href={`/booking/${data?.bookingId}`}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden active:bg-gray-50 hover:shadow-md transition-all cursor-pointer flex flex-col mb-3 ${
        isCardDisabled ? "grayscale opacity-75 bg-gray-50 border-gray-300" : ""
      }`}
    >
      {/* Image & Trip Status Overlays (Clean Header without title overlay) */}
      <div className="relative w-full h-[115px] sm:h-[125px] bg-gray-200 overflow-hidden shrink-0">
        <img
          src={data?.trip?.image || "/images/empty-state.png"}
          alt={data?.trip?.title || "Trip Image"}
          className="w-full h-full object-cover"
        />

        {/* Trip Status Badge (Top Left) - Disembunyikan jika expired/forfeited/kadaluwarsa */}
        {!isExpired ? (
          <div
            className={`absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded shadow-sm border ${tripStatusInfo.border} flex items-center gap-1.5 max-w-[68%] min-w-0`}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tripStatusInfo.dotBg}`} />
            <span className={`text-[9px] font-bold uppercase tracking-wider truncate ${tripStatusInfo.text}`}>
              {tripStatusInfo.label}
            </span>
          </div>
        ) : (
          <div />
        )}

        {/* Trip Type Badge (Top Right) */}
        <div
          className={`absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded shadow-sm border flex items-center gap-1 flex-shrink-0 ${
            isPrivateTrip ? "border-amber-200 text-amber-700" : "border-blue-200 text-blue-700"
          }`}
        >
          {isPrivateTrip ? (
            <Lock className="w-2.5 h-2.5 shrink-0" />
          ) : (
            <Users className="w-2.5 h-2.5 shrink-0" />
          )}
          <span className="text-[9px] font-bold uppercase tracking-wider">
            {isPrivateTrip ? "Private" : "Open Trip"}
          </span>
        </div>
      </div>

      {/* Body (Compact, Matching HTML Reference) */}
      <div className="p-3 flex flex-col grow">
        {/* Judul & Lokasi */}
        <div className="mb-2">
          <h2 className="text-sm font-bold text-gray-900 leading-tight truncate">
            {data?.trip?.title}
          </h2>
          <div className="flex items-center text-[11px] text-gray-500 mt-0.5">
            <MapPin className="w-3 h-3 mr-1 shrink-0 text-gray-400" />
            <span className="truncate">{data?.trip?.location}</span>
          </div>
        </div>

        {/* Meta Data: Tanggal Trip & Durasi Trip */}
        <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500 mb-2.5">
          <div className="flex items-center gap-1.5 leading-none">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="leading-none pt-[0.5px]">
              {data?.tripDate?.date ? dayjs(data.tripDate.date).format("DD MMM YYYY") : "-"}
            </span>
          </div>

          {tripDuration && (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
              <div className="flex items-center gap-1.5 leading-none">
                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="leading-none pt-[0.5px]">{tripDuration}</span>
              </div>
            </>
          )}
        </div>

        {/* Payment Section (Paling Bawah Card) */}
        <div className="pt-2.5 border-t border-gray-100 mt-auto">
          {/* Header Status Pembayaran + Tipe Pembayaran */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              {paymentStatusIcon}
              <span className="text-[11px] font-bold text-gray-900 truncate">
                {paymentStatusLabel}
              </span>
            </div>

            {/* Badge Tipe Pembayaran (DP / Pelunasan / Full) */}
            <div
              className={`${paymentTypeBg} ${paymentTypeText} shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider`}
            >
              {paymentTypeLabel}
            </div>
          </div>

          {/* Countdown Area jika Menunggu Pembayaran dan ada Active Pending Detail */}
          {showCountdown && !isExpired && (
            <div className="mt-2 bg-orange-50 border border-orange-100 rounded-md p-2 flex flex-col gap-1.5">
              {paymentSchemeLower === "pelunasan" && (
                <div className="flex items-start gap-1.5 pb-1.5 border-b border-orange-200/50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-orange-800 leading-relaxed">
                    <span className="font-bold text-green-700">DP Lunas!</span> Silakan selesaikan pembayaran Pelunasan maksimal H-{daysBefore} sebelum keberangkatan.
                  </p>
                </div>
              )}
              <div className="flex items-center gap-1 text-orange-600">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[10px] font-medium">Sisa waktu bayar:</span>
                <span className="text-[11px] font-bold font-mono ml-auto bg-orange-100/80 px-1.5 py-0.5 rounded">
                  {formattedCountdown}
                </span>
              </div>
            </div>
          )}

          {/* Banner Pesan Tambahan: Trip Cancelled (sesuai referensi history_trip_app.html) */}
          {isTripCancelled && (
            <div className="bg-red-50 border border-red-100 rounded p-2.5 mt-2">
              <p className="text-[10px] text-red-800 leading-relaxed">
                Trip ini tidak dapat dilaksanakan. Silakan jadwalkan ulang atau pilih destinasi lain.
              </p>
            </div>
          )}

          {/* Banner Pesan Tambahan: Expired */}
          {isExpired && !isTripCancelled && (
            <div className="bg-red-50 border border-red-100 rounded p-2.5 mt-2 flex items-start gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-red-600 mt-0.5 shrink-0" />
              <p className="text-[10px] text-red-800 leading-relaxed">
                Waktu pembayaran <b>{isDP ? (isDpPaid ? "Pelunasan" : "DP") : "Trip"}</b> telah habis. Silakan pesan ulang jika kuota trip masih tersedia.
              </p>
            </div>
          )}

          {/* Banner Pesan Tambahan: DP Lunas & Menunggu Pelunasan (belum ada invoice pelunasan aktif) */}
          {isDpPaidAndActive && !isTripCancelled && !isExpired && (
            <div className="bg-blue-50 border border-blue-100 rounded p-2.5 mt-2 flex flex-col gap-2">
              <div className="flex items-start gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-[10px] text-blue-800 leading-relaxed">
                  DP berhasil dibayarkan. Silakan menuju halaman detail untuk memproses <b>Pelunasan (maksimal H-{daysBefore})</b>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export { ListHistoryOrderV3 as CardListHistoryOrderV3 };
