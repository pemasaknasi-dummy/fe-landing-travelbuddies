"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Clock,
  Eye,
  MapPin,
  Star,
  Tag,
  Users,
} from "lucide-react";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Link from "next/link";
import { Trip } from "@/features/trips/api/trip-api";
import { formatRupiah } from "@/lib/format-rupiah";
import Image from "next/image";
import { formatViews } from "@/lib/format-views";
import Fire from "../../../../public/icons/fire.svg";
import Calendar from "../../../../public/icons/calendar.svg";
import dayjs from "dayjs";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import { TripStatusBadge } from "./TripStatusBadge";

interface TripCardProps {
  trip: Trip;
  baseUrl?: string;
  isPrivateTrip?: boolean;
  selectedDate?: string | null; // YYYY-MM-DD from search filter
}

const TripCard: React.FC<TripCardProps> = ({
  trip,
  baseUrl = "/open-trip",
  isPrivateTrip = false,
  selectedDate,
}) => {
  const [imgSrc, setImgSrc] = useState(trip.image || "/images/empty-state.png");

  const calculateDiscount = (price: number, promoPrice: number) => {
    return Math.round(((price - promoPrice) / price) * 100);
  };

  const sortedTiers = trip.guaranteeTiers
    ? [...trip.guaranteeTiers].sort((a, b) => a.pax - b.pax)
    : [];
  const minPax = sortedTiers.length > 0 ? sortedTiers[0].pax : 2;
  const bestPax =
    sortedTiers.length > 0 ? sortedTiers[sortedTiers.length - 1].pax : 15;
  const bestPrice = trip.privateTripPrice ?? trip.promoPrice ?? trip.price;

  const detailUrl = selectedDate
    ? `${baseUrl}/${trip.slug}?date=${selectedDate}`
    : `${baseUrl}/${trip.slug}`;

  return (
    <Link href={detailUrl} className="block h-full">
      <Card
        className="
          group cursor-pointer
          flex flex-col h-full
          rounded-2xl
          overflow-hidden
          transition-all duration-300
          hover:shadow-2xl border-none shadow-md
        "
      >
        {/* IMAGE SECTION */}
        <div className="relative w-full h-56 md:h-60 overflow-hidden">
          <Image
            src={imgSrc}
            alt={trip.title}
            fill
            onError={() => setImgSrc("/images/empty-state.png")}
            className="
              object-cover
              transition-transform duration-700 ease-out
              group-hover:scale-110
            "
          />

          {/* VIEW COUNT BADGE (TOP RIGHT) */}
          {!isPrivateTrip && (
            <div className="absolute top-4 right-4">
              <div className="bg-black/60 backdrop-blur-md text-white rounded-full px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-medium border border-white/20">
                <Eye size={14} className="stroke-[2.5px]" />
                <span>{formatViews(trip?.views)} Dilihat</span>
              </div>
            </div>
          )}

          {/* DURATION BADGE (BOTTOM RIGHT) */}
          {trip.days && (
            <div className="absolute bottom-4 right-4">
              <div className="bg-[#FE5E00] text-white rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold shadow-lg border border-white/20">
                <Clock size={14} className="stroke-[3px]" />
                <span>{trip?.days} Hari</span>
              </div>
            </div>
          )}
        </div>

        {/* CONTENT SECTION */}
        <div className="p-5 flex flex-col flex-1 gap-3">
          {/* PROMO BADGE */}
          <div className="min-h-[5px] flex items-center">
            {!isPrivateTrip && trip?.promos?.length > 0 && (
              <div className="-mt-3 flex items-center gap-1 text-[#FE5E00] font-bold text-sm">
                <Image
                  src={Fire}
                  alt="fire"
                  width={14}
                  height={14}
                  className="animate-pulse"
                />
                <span className="truncate text-xs">{trip.promos[0].name}</span>
              </div>
            )}
          </div>

          {/* STATUS & DATE ROW */}
          {!isPrivateTrip && <TripStatusBadge trip={trip} selectedDate={selectedDate} />}

          {/* TITLE & SUBTITLE */}
          <div className="flex flex-col gap-1 -mt-2">
            <h3 className="text-sm md:text-md font-bold text-[#101828] leading-tight group-hover:text-[#FE5E00] transition-colors line-clamp-2 min-h-[2rem]">
              {trip?.cardTitle || trip?.title}
            </h3>
            <p className="text-xs -mt-1 md:text-sms text-[#475467] line-clamp-1">
              {trip?.subtitle}
            </p>
          </div>

          {/* RATING & SOCIAL PROOF */}
          <div
            className={`flex items-center gap-2 ${!isPrivateTrip ? "mt-auto" : ""}`}
          >
            <div className="flex items-center gap-1 text-[#FFD600]">
              <Star size={16} fill="currentColor" />
              <span className="text-sm font-bold text-[#101828]">
                {trip.rating}
              </span>
            </div>
            {trip.buyers && (
              <span className="text-[10px] md:text-xs text-[#667085]">
                •{" "}
                {trip?.buyers > 50
                  ? `${formatViews(trip.buyers)}+`
                  : `${formatViews(trip.buyers)}`}{" "}
                user lain telah membeli
              </span>
            )}
          </div>

          {isPrivateTrip && (
            <>
              <hr className="border-gray-100" />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">
                  MULAI DARI
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-[#FE5E00]">
                    {formatRupiah(bestPrice)}
                  </span>
                  <span className="text-sm font-medium text-[#667085]">
                    /pax
                  </span>
                </div>
              </div>

              {/* INFO TAG */}
              <div className="flex items-start gap-2 bg-[#F9FAFB] p-2.5 rounded-xl border border-gray-100">
                <Tag size={14} className="text-[#FE5E00] mt-0.5 shrink-0" />
                <p className="text-[10px] leading-relaxed text-[#475467]">
                  Harga terbaik untuk{" "}
                  <span className="font-bold text-[#101828]">
                    {bestPax === 15 ? "13-15" : bestPax} peserta
                  </span>
                  . Private trip tersedia mulai{" "}
                  <span className="font-bold text-[#101828]">
                    {minPax} orang
                  </span>
                </p>
              </div>

              {/* BUTTON */}
              <div className="mt-1 w-full py-2.5 rounded-xl bg-[#FE5E00]/5 text-[#FE5E00] font-bold text-center flex items-center justify-center gap-2 text-sm border border-[#FE5E00]/10 hover:bg-[#FE5E00] hover:text-white transition-all duration-300">
                Lihat Detail Trip <ChevronRight size={16} />
              </div>
            </>
          )}

          {/* PRICING (OPEN TRIP ONLY) */}
          {!isPrivateTrip && (
            <div className="mt-1">
              <p className="text-xl font-bold text-[#101828] -mb-2">
                {formatRupiah(trip.promoPrice ?? trip.price)}
              </p>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default TripCard;
