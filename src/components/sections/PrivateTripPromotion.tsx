import Image from "next/image";
import Link from "next/link";
import React from "react";

const PrivateTripPromotion: React.FC = () => {
  return (
    <section className="px-5 max-w-[1024px] 2xl:max-w-[1440px] md:mx-auto xl:px-0">
      {/* Banner Container */}
      <div className="relative w-full aspect-[1440/576] rounded-[14px] overflow-hidden shadow-2xl border border-slate-200/50 group">
        <Image
          src="/images/banner/banner-private-trip.png"
          alt="Rencanakan Private Trip Travel Buddies"
          fill
          priority
          className="object-cover object-left md:object-center"
        />

        {/* Dynamic Redirect Overlay for the entire banner */}
        <Link
          href="/private-trip"
          className="absolute inset-0 w-full h-full cursor-pointer z-10 outline-none active:scale-95 transition-all duration-300"
          aria-label="Rencanakan Private Trip"
        />
      </div>
    </section>
  );
};

export default PrivateTripPromotion;
