/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import React, { useState } from "react";
import { ArrowLeft, Calendar, FileText, Sparkles, Copy, Check, Info, Globe, MapPin, MessageCircleWarning } from "lucide-react";
import { useParams } from "next/navigation";
import { BadgeType, PromoBadge } from "@/components/sections/promo/PromoBadge";
import Image from "next/image";
import { useDetailPromoWebsite } from "@/features/promos/hooks/usePromo";
import Link from "next/link";
import { SpinnerLoading } from "@/components/sections/SpinnerLoading";

// @ts-ignore
const PromoDetailSection = ({ title, icon, children }) => (
  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600">{icon}</div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
    </div>
    {children}
  </div>
);

// @ts-ignore

// @ts-ignore
const DiscountCardSticky = ({ type, promo }) => (
  <div className="hiddens lg:block">
    <div className="sticky top-24">
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-lg hover:shadow-xl transition-shadow ${type === "openTrip" ? "bg-linear-to-br from-[#FE5E00]/10 to-orange-50 border-[#FE5E00]/20" : type === "privateTrip" ? "bg-linear-to-br from-[#25A6DD]/10 to-sky-50 border-[#25A6DD]/20" : "bg-linear-to-br from-blue-50 to-indigo-50 border-blue-100"}`}>
        {/* HEADER */}
        <div className="mb-8">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 ${type === "openTrip" ? "bg-[#FE5E00]/15 text-[#FE5E00]" : type === "privateTrip" ? "bg-[#25A6DD]/15 text-[#25A6DD]" : "bg-blue-500/10 text-blue-600"}`}>
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold uppercase tracking-wide">{type === "openTrip" ? "Open Trip" : type === "privateTrip" ? "Private Trip" : "Diskon Spesial"}</span>
          </div>

          <p className={`text-2xl sm:text-3xl font-black text-transparent bg-clip-text ${type === "openTrip" ? "bg-linear-to-r from-[#FE5E00]/90 to-orange-400/70" : type === "privateTrip" ? "bg-linear-to-r from-[#25A6DD]/90 to-sky-400/70" : "bg-linear-to-r from-blue-600 to-indigo-600"}`}>{promo.discount}</p>
        </div>

        {/* VALID UNTIL */}
        <div className="mb-6">
          <div className={`flex items-center gap-3 px-4 py-3 bg-white/60 backdrop-blur-sm rounded-2xl border ${type === "openTrip" ? "border-[#FE5E00]/20" : type === "privateTrip" ? "border-[#25A6DD]/20" : "border-blue-100"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${type === "openTrip" ? "bg-[#FE5E00]/15" : type === "privateTrip" ? "bg-[#25A6DD]/15" : "bg-blue-500/10"}`}>
              <Calendar className={`h-5 w-5 ${type === "openTrip" ? "text-[#FE5E00]" : type === "privateTrip" ? "text-[#25A6DD]" : "text-blue-600"}`} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium mb-0.5">Berlaku hingga</p>
              <p className="text-sm font-bold text-gray-900">{promo.validUntil}</p>
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className="mt-6 flex items-start gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
          <Info className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 leading-relaxed">Dengan menggunakan promo ini, kamu menyetujui syarat & ketentuan yang berlaku.</p>
        </div>
      </div>
    </div>
  </div>
);

export default function PromoDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: promo, isLoading } = useDetailPromoWebsite(slug);
  const [copied, setCopied] = useState(false);
  const sanitizedContentDescription = promo?.description?.replace(/&nbsp;/g, " ") ?? "";
  const sanitizedContentTerms = promo?.terms?.replace(/&nbsp;/g, " ") ?? "";

  if (!promo) return;

  const handleCopyCode = () => {
    if (promo.code) {
      navigator.clipboard.writeText(promo.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isLoading) {
    <SpinnerLoading />
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Banner */}
      <section className="relative w-full pt-5 px-5 xl:px-0">
        <div className="w-full max-w-[1024px] 2xl:max-w-[1440px] mx-auto">
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
            <Image src={promo.image || "/images/empty-state.png"} alt={promo.title} fill className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      <div className="w-full max-w-[1024px] 2xl:max-w-[1440px] px-5 pt-5 mx-auto">
        <Link href="/promo" className="inline-flex items-center gap-2 text-black hover:underline mb-4 transition-colors text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Promo</span>
        </Link>

        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-black font-black mb-2 sm:mb-3 max-w-4xl leading-tight">{promo.title}</h1>

        <div className="flex items-center gap-x-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 backdrop-blur-sm border border-white/20">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/90s text-black" />
            <span className="text-xs sm:text-sm text-white/90s text-black font-medium">Periode {promo.validUntil}</span>
          </div>
          <PromoBadge type={promo.type as BadgeType} />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-[1024px] px-5 md:px-0 2xl:max-w-[1440px] mx-auto py-8 md:py-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Promo Code Card */}
              {promo.code && (
                <div className="relative overflow-hidden bg-linear-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-200 shadow-lg">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/10 rounded-full blur-2xl" />

                  <div className="relative">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Kode Promo</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="flex-1 bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-4 border border-blue-200/50 shadow-sm">
                        <p className="text-2xl sm:text-3xl font-black text-transparent bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text tracking-widest text-center sm:text-left">{promo.code}</p>
                      </div>

                      <button onClick={handleCopyCode} className={`px-6 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap flex items-center justify-center gap-2 ${copied ? "bg-linear-to-r from-green-500 to-emerald-500 text-white shadow-green-500/30" : "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700"}`}>
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span>Salin Kode</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 mt-4 text-center sm:text-left">Klik tombol untuk menyalin kode promo ke clipboard</p>
                  </div>
                </div>
              )}

              {/* Description */}
              <PromoDetailSection title="Deskripsi Promo" icon={<FileText className="h-5 w-5" />}>
                <div className="html-content prose prose-lg max-w-full" dangerouslySetInnerHTML={{ __html: sanitizedContentDescription }} />
              </PromoDetailSection>

              <PromoDetailSection title="Syarat & Ketentuan" icon={<MessageCircleWarning className="h-5 w-5" />}>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                  <div className="html-content prose prose-lg max-w-full" dangerouslySetInnerHTML={{ __html: sanitizedContentTerms }} />
                </div>
              </PromoDetailSection>

              {/* Trip Destinations */}
              {/* {promo.trip && promo.trip.length > 0 && (
                <PromoDetailSection title="Destinasi Trip" icon={<MapPin className="h-5 w-5" />}>
                  <div className="flex flex-wrap gap-2">
                    {promo.trip.map((destination, index) => (
                      <div key={index} className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors capitalize">{destination}</span>
                      </div>
                    ))}
                  </div>
                </PromoDetailSection>
              )} */}
            </div>

            {/* Right Column - Sticky CTA */}
            <DiscountCardSticky type={promo.type} promo={promo} />
          </div>
        </div>
      </main>
    </div>
  );
}
