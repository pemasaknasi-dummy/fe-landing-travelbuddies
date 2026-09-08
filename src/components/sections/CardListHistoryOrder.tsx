import { ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ListBookingResponse } from "@/features/bookings/api/booking-api";
import dayjs from "dayjs";
import { StatusPayment } from "./StatusPayment";
import BadgeStatusTrip from "./BadgeStatusTrip";
import { useCountdown } from "@/lib/useCountdown";
import { getStatusTripConfig } from "@/lib/getStatusTripConfig";
import { getPaymentStatusConfig } from "@/lib/getPaymentStatusConfig";

interface Props {
  data: ListBookingResponse;
}

export default function CardListHistoryOrder({ data }: Props) {
  const totalAmount = data?.payment?.totalAmount;

  const statusConfig = getStatusTripConfig(data?.tripDate?.status);
  const paymentConfig = getPaymentStatusConfig(data?.payment?.status);

  // For countdown, we use the first pending payment or just the first payment

  const { minutes, seconds, isExpired } = useCountdown(
    data?.payment?.createdAt || "",
    data?.payment?.status,
  );

  return (
    <Link
      href={`/booking/${data?.bookingId}`}
      className="
        rounded-xl block
        shadow-md shadow-gray-200/80
        ring-1 ring-gray-200
        transition-all duration-300 ease-out
        hover:shadow-xl hover:shadow-gray-300/60
        hover:ring-2 hover:ring-blue-300/50
        hover:-translate-y-1
        group
        overflow-hidden
        bg-white
      "
    >
      {/* Image Section */}
      <div className="relative w-full h-36 overflow-hidden">
        <Image
          src={data?.trip?.image || "/images/empty-state.png"}
          alt="image-trip"
          fill
          className="object-cover rounded-t-xl transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent rounded-t-xl" />

        {/* ── Badge Status ── */}
        <BadgeStatusTrip
          status={data?.payment?.status}
          details={data?.payment?.details}
          paymentConfig={paymentConfig}
          statusConfig={statusConfig}
          minutes={minutes}
          seconds={seconds}
          isExpired={isExpired}
        />

        {/* Trip info */}
        <div className="text-white absolute left-4 bottom-3 right-4">
          <p className="text-sm font-bold leading-tight truncate">
            {data?.trip?.title}
          </p>
          <div className="flex items-center gap-1 mt-0.5 text-white/80">
            <MapPin size={13} />
            <p className="text-xs font-medium truncate">
              {data?.trip?.location}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-3 pt-3">
        {/* Date + Peserta */}
        <div className="flex items-start justify-between px-4">
          <h4 className="font-bold text-sm tracking-wider">Tanggal Trip</h4>
          <p className="text-gray-500 font-semibold text-sm mt-0.5">
            {dayjs(data?.tripDate?.date).format("MMMM DD, YYYY")}
          </p>
        </div>

        {/* ── Payment Status ── */}

        <StatusPayment
          payment={totalAmount}
          icon={paymentConfig.icon}
          iconWrap={paymentConfig.iconWrap}
          label={paymentConfig.label}
          labelColor={paymentConfig.labelColor}
        />

        {/* ── Detail Button ── */}
        <div className="flex items-center justify-between px-4 pb-3">
          <span
            className="
              text-sm text-blue-[#1D79B5] font-bold
              group-hover:text-blue-600
              transition-colors duration-200
            "
          >
            Lihat Detail
          </span>
          <ChevronRight
            size={18}
            className="
              text-blue-400
              transition-all duration-300
              group-hover:translate-x-1 group-hover:text-blue-600
            "
          />
        </div>
      </div>
    </Link>
  );
}

export { CardListHistoryOrder as ListHistoryOrderV1 };

