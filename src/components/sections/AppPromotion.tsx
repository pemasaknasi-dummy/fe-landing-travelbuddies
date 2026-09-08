"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

const AppPromotion: React.FC = () => {
  const handleBannerClick = () => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent || "";
    const isIos = /iPad|iPhone|iPod/.test(ua);

    if (isIos) {
      window.open("https://apps.apple.com/id/app/travel-buddies/id6757420967", "_blank");
    } else {
      window.open("https://play.google.com/store/apps/details?id=id.travelbuddies.app&hl=id", "_blank");
    }
  };

  return (
    <section className="px-5 max-w-[1024px] 2xl:max-w-[1440px] md:mx-auto xl:px-0">
      {/* Banner Container */}
      <div className="relative w-full aspect-[1440/576] rounded-[14px] overflow-hidden shadow-2xl border border-slate-200/50 group">
        <Image
          src="/images/banner/banner-app-promotion.png"
          alt="Semua Jenis Trip Dalam Satu Aplikasi Travel Buddies"
          fill
          priority
          className="object-cover"
        />

        {/* Dynamic Store Redirect Overlay for the entire banner */}
        <button
          onClick={handleBannerClick}
          className="absolute inset-0 w-full h-full cursor-pointer z-0 outline-none bg-transparent border-0 p-0 m-0"
          aria-label="Download Travel Buddies App"
        />

        {/* Desktop CTA App Store Button Overlay */}
        <Link
          href="https://apps.apple.com/id/app/travel-buddies/id6757420967"
          target="_blank"
          className="absolute left-[18.4%] bottom-[7.5%] w-[8.2%] h-[7.2%] rounded-[6px] hover:bg-white/10 transition-all duration-200 active:scale-95 cursor-pointer z-10 outline-none"
          title="Download on the App Store"
        />

        {/* Desktop CTA Google Play Button Overlay */}
        <Link
          href="https://play.google.com/store/apps/details?id=id.travelbuddies.app&hl=id"
          target="_blank"
          className="absolute left-[26.9%] bottom-[7.5%] w-[8.2%] h-[7.2%] rounded-[6px] hover:bg-white/10 transition-all duration-200 active:scale-95 cursor-pointer z-10 outline-none"
          title="Get it on Google Play"
        />
      </div>
    </section>
  );
};

export default AppPromotion;
