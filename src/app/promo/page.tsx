"use client";

import { EmptyState } from "@/components/sections/promo/EmptyStatePromo";
import { PromoCard } from "@/components/sections/promo/PromoCard";
import { usePromoWebsite } from "@/features/promos/hooks/usePromo";

export default function PromoListing() {
  const { data } = usePromoWebsite();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-slate-50 via-blue-50 to-white py-10">
        {/* Content */}
        <div className="mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className=" mx-auto">
            {/* Main Content */}
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:flex sm:gap-x-3 sm:justify-center md:text-6xl font-black mb-6 leading-none">
                Promo &<span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">Penawaran Spesial</span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
                Temukan promo terbaik untuk perjalananmu.
                <br className="hidden sm:block" />
                <span className="font-semibold text-gray-800">Hemat lebih banyak, jelajahi lebih jauh!</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 mb-20 max-w-[1024px] 2xl:max-w-[1440px] mx-auto">
        <div className="container mx-auto">
          {data?.items?.length === 0 ? (
            <EmptyState type="promo" title="Belum ada promo tersedia" description="Saat ini tidak ada promo aktif. Pantau terus untuk penawaran menarik!" />
          ) : (
            <div className="grid grid-cols-1 px-5 md:grid-cols-2 md:px-0 lg:grid-cols-3 gap-6 w-full mx-auto">
              {data?.items?.map((promo, index) => (
                <div key={promo.slug} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <PromoCard promo={promo} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
