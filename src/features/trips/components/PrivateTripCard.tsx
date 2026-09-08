"use client";

import React, { useState } from "react";
import { Clock, Star, User, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Trip } from "@/features/trips/api/trip-api";
import { formatRupiah } from "@/lib/format-rupiah";
import { formatViews } from "@/lib/format-views";

interface PrivateTripCardProps {
  trip: Trip;
  baseUrl?: string;
  selectedDate?: string | null;
}

const PrivateTripCard: React.FC<PrivateTripCardProps> = ({
  trip,
  baseUrl = "/private-trip",
  selectedDate,
}) => {
  const [imgSrc, setImgSrc] = useState(trip.image || "/images/empty-state.png");

  const sortedTiers = trip.guaranteeTiers
    ? [...trip.guaranteeTiers].sort((a, b) => a.pax - b.pax)
    : [];
  const minPax = sortedTiers.length > 0 ? sortedTiers[0].pax : 2;
  const bestPrice = trip.privateTripPrice ?? trip.promoPrice ?? trip.price;

  const detailUrl = selectedDate
    ? `${baseUrl}/${trip.slug}?date=${selectedDate}`
    : `${baseUrl}/${trip.slug}`;

  return (
    <Link href={detailUrl} className="block h-full">
      <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group h-full cursor-pointer">
        {/* IMAGE SECTION */}
        <div className="relative overflow-hidden aspect-[4/3] w-full">
          {trip.days && (
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold text-[#0f172a] shadow-sm z-10 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#25A6DD]" />
              <span>{trip.days} Hari</span>
            </div>
          )}

          <Image
            src={imgSrc}
            alt={trip.title}
            fill
            onError={() => setImgSrc("/images/empty-state.png")}
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>

        {/* CONTENT SECTION */}
        <div className="p-4 sm:p-5 flex flex-col flex-grow">
          <h3
            className="text-base sm:text-lg font-bold text-[#0f172a] group-hover:text-[#25A6DD] transition-colors mb-2 truncate"
            title={trip?.cardTitle || trip?.title}
          >
            {trip?.cardTitle || trip?.title}
          </h3>

          {/* RATING & SOLD */}
          <div className="flex items-center text-[11px] sm:text-xs mb-3 gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-gray-700 mr-0.5">
              {trip.rating ?? "5.0"}
            </span>
            <span className="text-gray-400">
              ({trip.buyers ? formatViews(trip.buyers) : 0} terjual)
            </span>
          </div>

          {/* MIN PARTICIPANT */}
          <div className="flex items-center text-[11px] sm:text-xs text-gray-600 mb-4 sm:mb-6 gap-1.5">
            <User className="w-3.5 h-3.5 text-[#25A6DD]" />
            <span>Peserta minimal {minPax}</span>
          </div>

          {/* FOOTER & PRICING */}
          <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 mb-1">
                Harga mulai dari
              </p>
              <p className="text-[#f97316] font-bold text-base sm:text-lg leading-none">
                {formatRupiah(bestPrice)}{" "}
                <span className="text-[10px] sm:text-xs font-normal text-gray-400">
                  /org
                </span>
              </p>
            </div>

            <div className="w-full py-2.5 bg-[#25A6DD]/10 text-[#25A6DD] font-bold rounded-xl group-hover:bg-[#25A6DD] group-hover:text-white transition-colors text-xs sm:text-sm flex items-center justify-center gap-1 text-center">
              Lihat Paket <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PrivateTripCard;
