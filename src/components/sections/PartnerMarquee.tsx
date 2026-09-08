"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

// Swiper styles
import "swiper/css";
import { koperasi } from "@/data/partner";
import Image from "next/image";

export default function PartnerMarquee() {
  return (
    <div className="w-full py-10 overflow-hidden">
      <Swiper
        modules={[Autoplay]}
        slidesPerView="auto"
        spaceBetween={40}
        loop={true}
        speed={4000}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
        }}
        allowTouchMove={false}
        className="flex items-center"
      >
        {koperasi.map((logo, index) => (
          <SwiperSlide key={index} className="w-auto! flex items-center opacity-70 hover:opacity-100 transition">
            <Image src={`/images/partner/koperasi/${logo}.png`} alt={logo} width={90} height={55} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
