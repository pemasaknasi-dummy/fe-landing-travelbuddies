"use client";

import { useState, useMemo, useEffect } from "react";
import { useArticles } from "@/features/articles/hooks/useArticles";
import { Search, Clock, Calendar, ArrowRight, ArrowDown, Eye } from "lucide-react";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";

export default function BlogListingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // Fetch published articles
  const { data, isLoading } = useArticles({
    status: "published",
    q: searchQuery || undefined,
    category: selectedCategory === "Semua" ? undefined : selectedCategory,
    pageSize: 100, // retrieve all for simplicity, or can be paginated
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchInput]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white py-28 lg:py-36 px-4 overflow-hidden flex items-center justify-center min-h-[60vh]">
        {/* Background Image */}
        <div
          className="absolute inset-0 w-full h-full bg-fixed bg-center bg-cover opacity-50"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&q=80&w=2000')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-blue-950/30 to-slate-950/90" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md text-white text-xs md:text-sm font-semibold tracking-wider border border-white/20 uppercase animate-fade-in shadow-sm">
            Kisah & Panduan Perjalanan
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-md">
            Temukan Cerita <br className="hidden md:block" />
            <span className="text-blue-400">Petualanganmu</span> Selanjutnya
          </h1>

          <p className="text-base md:text-lg text-slate-200 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-sm">
            Jelajahi berbagai tips mendaki, eksplorasi budaya, dan cerita perjalanan terbaik di seluruh Nusantara
            bersama TravelBuddies.
          </p>

          <button
            onClick={() => document.getElementById("blog-content")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-600/30 flex items-center gap-2 mx-auto cursor-pointer"
          >
            Mulai Membaca <ArrowDown className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Main Content */}
      <div id="blog-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Cari artikel..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm"
            />
          </div>
        </div>

        {/* Article Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 p-4 space-y-4"
              >
                <Skeleton height={200} borderRadius={16} />
                <div className="space-y-2">
                  <Skeleton width="40%" height={16} />
                  <Skeleton width="90%" height={24} />
                  <Skeleton count={2} height={14} />
                </div>
              </div>
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-500 font-medium text-lg">Belum ada artikel yang dipublikasikan.</p>
            <p className="text-slate-400 text-sm mt-1">Coba gunakan kata kunci pencarian atau kategori lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.items.map((article) => (
              <Link href={`/blog/${article.slug}`} key={article.id} className="group">
                <article className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border border-slate-100">
                  {/* Cover Image */}
                  <div className="relative h-56 w-full overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-xl text-[11px] font-bold text-blue-700 shadow-sm uppercase tracking-wider">
                      {article.category}
                    </div>
                  </div>

                  {/* Metadata and Description */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 mb-3 text-xs text-slate-400">
                      {article.readTime && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{article.readTime}</span>
                        </div>
                      )}
                      {article.writtenDate && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{article.writtenDate}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span>{article.viewCount ?? 0} kali dilihat</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2 mb-3">
                      {article.title}
                    </h3>

                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-6 flex-grow">
                      {article.shortDesc}
                    </p>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-slate-500 group-hover:text-blue-600 transition-colors mt-auto">
                      <span>Baca Selengkapnya</span>
                      <div className="w-9 h-9 rounded-full bg-slate-50 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center text-blue-600 shadow-sm">
                        <ArrowRight className="w-4.5 h-4.5" />
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
