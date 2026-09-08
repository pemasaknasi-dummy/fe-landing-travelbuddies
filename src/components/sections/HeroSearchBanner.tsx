"use client";

import React, { useState, useRef } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import DatePickerPopover from "@/components/ui/DatePickerPopover";

const HeroSearchBanner: React.FC = () => {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchInput.trim()) {
      params.set("q", searchInput.trim());
    }
    if (selectedDate) {
      params.set("date", selectedDate);
    }
    const queryString = params.toString();
    router.push(`/open-trip${queryString ? `?${queryString}` : ""}`);
    searchRef.current?.blur();
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <section className="relative w-full z-20">
      {/* Background Container (with overflow-hidden to constrain bg/gradient) */}
      <div className="absolute inset-0 w-full h-[480px] overflow-hidden">
        <Image
          src="/images/banner/hero-banner.png"
          alt="Hero Banner"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/20" />
      </div>

      {/* Content Container */}
      <div className="relative w-full h-[480px]">
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-5 pt-12 md:pt-0 text-center">
          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white leading-tight mb-2 md:mb-3">
            <span className="block">Temukan Trip Favoritmu</span>
            <span className="block">
              &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-300 drop-shadow-md">
                Mulai Petualangan
              </span>
            </span>
          </h1>
          <p className="text-white/95 text-xs sm:text-sm md:text-lg font-medium max-w-lg mb-6 md:mb-8 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            Nikmati perjalanan seru ke berbagai destinasi dengan cara yang
            praktis dan menyenangkan
          </p>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center gap-3 bg-white rounded-full p-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-4xl border border-white/20">
            <div className="h-[54px] relative flex items-center flex-[9.5] bg-slate-50 border border-slate-200 rounded-full p-1.5 transition-all focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#008cf4] shrink-0">
                <Search className="text-white w-5 h-5" />
              </div>
              <input
                ref={searchRef}
                type="text"
                placeholder="Mau kemana?"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleEnter}
                className="w-full pl-3 pr-4 py-2 text-base text-slate-800 placeholder:text-slate-500 bg-transparent focus:outline-none"
              />
            </div>

            <div className="flex-[4]">
              <DatePickerPopover
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Kapan?"
                className="w-full placeholder:bg-gray-200 [&>button]:h-[54px] [&>button]:w-full [&>button]:bg-slate-50 [&>button]:border-slate-200 [&>button]:rounded-full [&>button]:px-5 hover:[&>button]:border-blue-400 hover:[&>button]:bg-white focus:[&>button]:ring-2 focus:[&>button]:ring-blue-100"
              />
            </div>

            <button
              onClick={handleSearch}
              className="h-[54px] px-10 bg-[#008cf4] hover:bg-blue-600 text-white text-base font-bold rounded-full shadow-lg active:scale-95 transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center justify-center"            >
              Cari Trip
            </button>
          </div>

          {/* Search Bar - Mobile */}
          <div className="md:hidden w-full max-w-md space-y-3">
            <div className="flex items-center bg-white rounded-full p-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20">
              <div className="relative flex items-center flex-1 bg-slate-50 border border-slate-200 rounded-full p-1 transition-all focus-within:border-blue-400 focus-within:bg-white">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#008cf4] shrink-0">
                  <Search className="text-white w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Mau kemana?"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleEnter}
                  className="w-full pl-3 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-500 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 p-4 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20">
              <DatePickerPopover
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Kapan?"
                className="w-full [&>button]:w-full [&>button]:bg-slate-50 [&>button]:border-slate-200 [&>button]:rounded-full [&>button]:py-3.5 [&>button]:px-5 [&>button]:justify-start"
              />
              <button
                onClick={handleSearch}
                className="w-full py-3.5 bg-[#008cf4] hover:bg-blue-600 text-white text-base font-bold rounded-full shadow-lg active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Cari Trip
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSearchBanner;
