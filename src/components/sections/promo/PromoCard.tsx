import { Calendar, ArrowRight, Tag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { BadgeType, PromoBadge } from "./PromoBadge";
import { GetPromoWebsite } from "@/features/promos/api/promo-api";

export interface PromoData {
  slug?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  validUntil?: string;
  category?: string;
  badgeType?: BadgeType;
}

interface PromoCardProps {
  promo: GetPromoWebsite;
}

export function PromoCard({ promo }: PromoCardProps) {
  const sanitizedContentDescription = promo?.description?.replace(/&nbsp;/g, " ") ?? "";

  return (
    <Link href={`/promo/${promo.slug}`} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        <Image src={promo.image || "/images/empty-state.png"} alt={promo.title!} fill className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />

        {/* Badge */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <PromoBadge type={promo.type as BadgeType} />
        </div>

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col">
        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors duration-200">{promo.title}</h3>

        {/* Description */}
        <div className="html-content prose prose-lg max-w-full line-clamp-2" dangerouslySetInnerHTML={{ __html: sanitizedContentDescription }} />

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 mt-auto">
          {/* Valid Until */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">Periode {promo.validUntil}</span>
          </div>

          {/* CTA */}
          <div className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all duration-200">
            <span className="hidden sm:inline">Lihat Detail</span>
            <span className="sm:hidden">Detail</span>
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
