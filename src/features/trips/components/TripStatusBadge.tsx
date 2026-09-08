import React from "react";
import { Users } from "lucide-react";
import Image from "next/image";
import Calendar from "../../../../public/icons/calendar.svg";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { Trip } from "@/features/trips/api/trip-api";

dayjs.locale("id");

interface TripStatusBadgeProps {
  trip: Trip;
  selectedDate?: string | null; // YYYY-MM-DD from search filter
}

export const TripStatusBadge: React.FC<TripStatusBadgeProps> = ({ trip, selectedDate }) => {
  const availability = trip.availability;

  const isUnavailable = availability?.type === "unavailable" || (!availability && !trip.hasAvailableDateThisWeek);
  const isFull =
    availability?.type === "full" || (!availability && (trip.quotaThisWeek ?? 0) <= 0 && trip.hasAvailableDateThisWeek);
  const isLimited =
    availability?.type === "limited" ||
    (!availability && (trip.quotaThisWeek ?? 0) > 0 && (trip.quotaThisWeek ?? 0) <= 5);

  const remainingQuota = trip.quotaThisWeek !== undefined ? trip.quotaThisWeek : (trip.quota ?? 0) - (trip.booked ?? 0);

  // Use selectedDate if available, otherwise fall back to dateRangeThisWeek
  const displayDate = selectedDate ? dayjs(selectedDate) : null;
  const startDate = dayjs(trip?.dateRangeThisWeek?.start);
  const endDate = dayjs(trip?.dateRangeThisWeek?.end);

  return (
    <div className="flex flex-col items-start gap-2">
      {/* ROW 1: Date or fallback labels */}
      {isUnavailable ? (
        <div className="bg-[#FEF3F2] text-[#B42318] px-2 py-1 rounded flex items-center gap-1.5 text-[10px] font-bold">
          <Image
            src={Calendar}
            alt="calendar"
            width={12}
            height={12}
            className="opacity-70"
            style={{
              filter: "invert(13%) sepia(85%) saturate(5414%) hue-rotate(352deg) brightness(91%) contrast(92%)",
            }}
          />
          <span>Jadwal tidak tersedia</span>
        </div>
      ) : isFull ? (
        <div className="bg-[#F2F4F7] text-[#475467] px-2 py-1 rounded flex items-center gap-1.5 text-[10px] font-bold">
          <Image src={Calendar} alt="calendar" width={12} height={12} className="opacity-70" />
          <span>Cek Jadwal Lainnya</span>
        </div>
      ) : (
        <div className="bg-[#F2F4F7] text-[#475467] px-2 py-1 rounded flex items-center gap-1.5 text-[10px] font-bold">
          <Image src={Calendar} alt="calendar" width={12} height={12} />
          <span>
            {displayDate
              ? displayDate.format("ddd, DD MMM YYYY")
              : `${startDate.format("DD")} - ${endDate.format("DD MMM YYYY")}`}
          </span>
        </div>
      )}

      {/* ROW 2: Availability Status Badge */}
      {isUnavailable ? (
        <div className="bg-[#c92519] text-white px-2 py-1 rounded flex items-center gap-1 text-[10px] font-bold uppercase shadow-sm">
          <i>
            <Users size={12} className="fill-white" />
          </i>
          {availability?.label}
        </div>
      ) : isFull ? (
        <div className="bg-[#D0D5DD] text-[#475467] px-2 py-1 rounded flex items-center gap-1 text-[10px] font-bold uppercase">
          <i>
            <Users size={12} className="opacity-70" />
          </i>
          {availability?.label}
        </div>
      ) : isLimited ? (
        <div className="bg-[#FFD600] text-black px-2 py-1 rounded flex items-center gap-1 text-[10px] font-bold uppercase shadow-sm">
          <i>
            <Users size={12} className="fill-black" />
          </i>
          {availability?.label}
        </div>
      ) : (
        <div className="bg-[#06b947] text-white px-2 py-1 rounded flex items-center gap-1 text-[10px] font-bold uppercase shadow-sm">
          <i>
            <Users size={12} className="fill-white" />
          </i>
          {availability?.label}
        </div>
      )}
    </div>
  );
};

