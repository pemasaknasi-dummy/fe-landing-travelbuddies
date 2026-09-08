"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useBanners } from "@/features/banners/hooks/useBanners";
import Skeleton from "react-loading-skeleton";

const HeroCarousel: React.FC = () => {
  const { data, isLoading } = useBanners();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton height={24} width="30%" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="min-w-[280px] md:min-w-[320px]">
              <Skeleton height={140} borderRadius={16} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data?.items || data.items.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <h2 className="text-xl md:text-3xl font-bold text-slate-900">Terbaik Buatmu</h2>

      {/* Compact Banner Swiper */}
      <Swiper
        slidesPerView={1.15}
        spaceBetween={12}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          480: { slidesPerView: 1.35, spaceBetween: 14 },
          640: { slidesPerView: 1.75, spaceBetween: 16 },
          768: { slidesPerView: 2.2, spaceBetween: 16 },
          1024: { slidesPerView: 2.3, spaceBetween: 20 },
        }}
        modules={[Autoplay]}
        className="w-full"
      >
        {data.items.map((banner, index) => {
          const isExternal = banner.url?.startsWith("http");
          return (
            <SwiperSlide key={banner.id || index} className="h-auto ">
              {banner.url ? (
                isExternal ? (
                  <a href={banner.url} target="_blank" rel="noopener noreferrer" className="block">
                    <BannerCard banner={banner} index={index} />
                  </a>
                ) : (
                  <Link href={banner.url} className="block">
                    <BannerCard banner={banner} index={index} />
                  </Link>
                )
              ) : (
                <BannerCard banner={banner} index={index} />
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

interface BannerCardProps {
  banner: {
    id: number;
    name: string;
    imageUrl: string;
    url: string | null;
  };
  index: number;
}

const BannerCard: React.FC<BannerCardProps> = ({ banner, index }) => {
  return (
    <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden shadow-md group cursor-pointer">
      <Image
        src={banner.imageUrl}
        alt={banner.name || `Banner ${index + 1}`}
        fill
        quality={100}
        className="object-fill transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 680px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      {/* Subtle gradient for visual depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export default HeroCarousel;
