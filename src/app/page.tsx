"use client";
import HeroCarousel from "../components/sections/HeroCarousel";
import HeroSearchBanner from "../components/sections/HeroSearchBanner";
import AppPromotion from "../components/sections/AppPromotion";
import PrivateTripPromotion from "../components/sections/PrivateTripPromotion";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { Play, X, Instagram } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, Fragment } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useTrips, useTop10Trips } from "@/features/trips/hooks/useTrips";
import TripCard from "@/features/trips/components/TripCard";
import Skeleton from "react-loading-skeleton";
import PrivateTripSection from "@/components/sections/PrivateTripSection";
import PendingFeedbackBanner from "@/components/ui/PendingFeedbackBanner";
import { useHomepageSections } from "@/features/homepage-builder/hooks/useHomepageSections";

export default function HomePage() {
  const router = useRouter();
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  // Fetch Homepage Builder active sections
  const { data: activeSections, isLoading: isSectionsLoading } = useHomepageSections();

  // Fetch default data for fallback
  const { data: trips, isLoading: tripsLoading } = useTrips({
    pageSize: 4,
    section: ["popular", "recommended"],
  });
  const { data: top10Trips, isLoading: top10TripsLoading } = useTop10Trips({
    maxQuota: 5,
  });

  const closeVideoModal = () => setSelectedVideoUrl(null);

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Render Skeleton for all dynamic sections during load
  if (isSectionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto space-y-12">
          {/* Hero skeleton */}
          <Skeleton height={340} />

          <PendingFeedbackBanner />

          <div className="px-5 mx-auto max-w-[1024px] 2xl:max-w-[1440px] space-y-8">
            <Skeleton height={28} width="30%" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg ring-1 ring-slate-100 shadow-md overflow-hidden">
                  <Skeleton height={160} />
                  <div className="space-y-3 p-4">
                    <Skeleton height={18} width="80%" />
                    <Skeleton height={14} width="60%" />
                    <Skeleton height={20} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Determine if builder layout is configured and active
  const hasActiveSections = activeSections && activeSections.length > 0;
  const hasCtaBanners = activeSections?.some((s) => s.type === "CTA_BANNER");

  const renderDefaultTrips = () => {
    return (
      <>
        {/* PERJALANAN RECOMMEND */}
        <section className="px-5 xl:px-0 mx-auto max-w-[1024px] 2xl:max-w-[1440px]">
          <SectionHeader title="Trip Pilihan Minggu ini" link="/open-trip?section=recommended" />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-5">
            {top10TripsLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="rounded-lg ring-1 ring-slate-100 shadow-md overflow-hidden">
                  <Skeleton height={160} />
                  <div className="space-y-3 p-4">
                    <Skeleton height={18} width="80%" />
                    <Skeleton height={14} width="60%" />
                    <Skeleton height={20} width="40%" />
                    <Skeleton height={36} borderRadius={8} />
                  </div>
                </div>
              ))
            ) : top10Trips?.items?.length === 0 ? (
              <p className="text-center font-semibold text-slate-500 tracking-wider col-span-full">
                Trip tidak ditemukan
              </p>
            ) : (
              top10Trips?.items.map((trip) => <TripCard key={trip.id} trip={trip} />)
            )}
          </div>
        </section>

        {/* PERJALANAN POPULER */}
        <section className="px-5 xl:px-0 mx-auto max-w-[1024px] 2xl:max-w-[1440px]">
          <SectionHeader title="Trip Rekomendasi Terbaru" link="/open-trip?section=popular" loading={tripsLoading} />

          <div className="">
            <Swiper
              observer
              observeParents
              spaceBetween={16}
              slidesPerView={1.2}
              breakpoints={{
                768: {
                  slidesPerView: 4,
                  allowTouchMove: false,
                },
              }}
              className="md:overflow-visible!"
            >
              {tripsLoading ? (
                <>
                  {/* MOBILE: Skeleton Slider */}
                  <div className="block md:hidden">
                    <div className="rounded-lg ring-1 ring-slate-100 shadow-md overflow-hidden">
                      <Skeleton height={160} />
                      <div className="space-y-3 p-4">
                        <Skeleton height={18} width="80%" />
                        <Skeleton height={14} width="60%" />
                        <Skeleton height={20} width="40%" />
                        <Skeleton height={36} borderRadius={8} />
                      </div>
                    </div>
                  </div>

                  {/* DESKTOP: Skeleton Grid */}
                  <div className="hidden md:grid grid-cols-2 xl:grid-cols-4 gap-5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="rounded-lg ring-1 ring-slate-100 shadow-md overflow-hidden">
                        <Skeleton height={160} />
                        <div className="space-y-3 p-4">
                          <Skeleton height={18} width="80%" />
                          <Skeleton height={14} width="60%" />
                          <Skeleton height={20} width="40%" />
                          <Skeleton height={36} borderRadius={8} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                trips?.items.map((trip) => (
                  <SwiperSlide key={trip.id} className="mb-5 h-auto">
                    <TripCard trip={trip} />
                  </SwiperSlide>
                ))
              )}
            </Swiper>
          </div>
        </section>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto space-y-12">
        {/* 1. HERO SEARCH BANNER (Full-width with search overlay) */}
        <HeroSearchBanner />

        <PendingFeedbackBanner />

        {/* 2. TRIP BANNER CAROUSEL (Compact cards - "Terbaik Buatmu") */}
        <div className="px-5 xl:px-0 mx-auto max-w-[1024px] 2xl:max-w-[1440px]">
          <HeroCarousel />
        </div>

        {/* 3. DYNAMIC SECTIONS from Homepage Builder */}
        {hasActiveSections ? (
          <>
            {activeSections.map((section) => {
              switch (section.type) {
                case "BANNER_ROW":
                  return (
                    <section key={section.id} className="px-5 xl:px-0 mx-auto max-w-[1024px] 2xl:max-w-[1440px]">
                      {section.title && (
                        <div className="mb-6">
                          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{section.title}</h2>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {section.fields.banners?.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-video rounded-xl overflow-hidden shadow-md group hover:shadow-lg transition-shadow duration-300"
                          >
                            <img
                              src={url}
                              alt={`Banner ${idx}`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        ))}
                      </div>
                    </section>
                  );

                case "TRIP":
                  return (
                    <section key={section.id} className="px-5 xl:px-0 mx-auto max-w-[1024px] 2xl:max-w-[1440px]">
                      <div className="space-y-1 mb-6">
                        <SectionHeader
                          title={section.title || "Trip Pilihan"}
                          link={section.fields.isHasSeeMore ? section.fields.url || "/open-trip" : undefined}
                        />
                        {section.fields.subtitle && (
                          <p className="text-slate-500 text-sm md:text-base -mt-4">{section.fields.subtitle}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-5">
                        {section.populatedTrips?.length === 0 ? (
                          <p className="text-center font-semibold text-slate-500 tracking-wider col-span-full py-6">
                            Trip tidak ditemukan
                          </p>
                        ) : (
                          section.populatedTrips?.map((trip) => <TripCard key={trip.id} trip={trip} />)
                        )}
                      </div>
                    </section>
                  );

                case "FULLWIDTH_BANNER":
                  return (
                    <div key={section.id} className="px-5 mx-auto max-w-[1024px] 2xl:max-w-[1440px]">
                      <div className="relative w-full rounded-2xl overflow-hidden shadow-md group hover:shadow-lg transition-shadow duration-300">
                        {section.fields.url ? (
                          <a href={section.fields.url} className="block cursor-pointer">
                            <img
                              src={section.fields.imageUrl}
                              alt={section.title || "Fullwidth Banner"}
                              className="w-full h-auto object-cover max-h-[300px]"
                            />
                          </a>
                        ) : (
                          <img
                            src={section.fields.imageUrl}
                            alt={section.title || "Fullwidth Banner"}
                            className="w-full h-auto object-cover max-h-[300px]"
                          />
                        )}
                      </div>
                    </div>
                  );

                case "VIDEO": {
                  if (!section.fields.videos || section.fields.videos.length === 0) return null;
                  const hasTripSectionInBuilder = activeSections.some((s) => s.type === "TRIP");
                  return (
                    <Fragment key={section.id}>
                      {!hasTripSectionInBuilder && renderDefaultTrips()}
                      <section className="w-full bg-gradient-to-br from-[#e0f2fe] via-[#f0f9ff] to-[#e0f2fe] py-12 md:py-16">
                        <div className="mx-auto max-w-[1024px] 2xl:max-w-[1440px] px-5 xl:px-0">
                          {/* Header */}
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                            <div className="space-y-1 text-left">
                              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                                {section.title || "Keseruan trip bersama travel buddies"}
                              </h2>
                              {section.fields.subtitle && (
                                <p className="text-slate-600 text-sm md:text-base font-medium">
                                  {section.fields.subtitle}
                                </p>
                              )}
                            </div>
                            <a
                              href="https://www.instagram.com/travelbuddies_id"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-3 bg-[#fa00b3] hover:bg-[#e1009b] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-300 w-full md:w-auto cursor-pointer"
                            >
                              <Instagram className="w-4.5 h-4.5 text-white" />
                              <span>Follow instagram travel buddies</span>
                            </a>
                          </div>

                          {/* Swiper Reels List */}
                          <Swiper
                            observer
                            observeParents
                            spaceBetween={16}
                            slidesPerView={1.3}
                            breakpoints={{
                              480: {
                                slidesPerView: 1.8,
                              },
                              640: {
                                slidesPerView: 2.4,
                              },
                              768: {
                                slidesPerView: 3.2,
                              },
                              1024: {
                                slidesPerView: 4,
                                allowTouchMove: false,
                              },
                            }}
                            className="w-full"
                          >
                            {section.fields.videos.map((video, idx) => (
                              <SwiperSlide key={idx} className="h-auto">
                                <ReelVideoCard video={video} onClick={() => setSelectedVideoUrl(video.url)} />
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        </div>
                      </section>
                    </Fragment>
                  );
                }

                case "CTA_BANNER": {
                  const handleBannerClick = () => {
                    if (typeof window === "undefined") return;
                    if (section.fields.actionType === "app_download") {
                      const ua = navigator.userAgent || "";
                      const isIos = /iPad|iPhone|iPod/.test(ua);
                      if (isIos && section.fields.appStoreUrl) {
                        window.open(section.fields.appStoreUrl, "_blank");
                      } else if (!isIos && section.fields.playStoreUrl) {
                        window.open(section.fields.playStoreUrl, "_blank");
                      } else if (section.fields.playStoreUrl) {
                        window.open(section.fields.playStoreUrl, "_blank");
                      }
                    } else {
                      if (section.fields.url) {
                        if (section.fields.url.startsWith("http")) {
                          window.open(section.fields.url, "_blank");
                        } else {
                          router.push(section.fields.url);
                        }
                      }
                    }
                  };

                  return (
                    <section key={section.id} className="px-5 max-w-[1024px] 2xl:max-w-[1440px] md:mx-auto xl:px-0">
                      <div className="relative w-full aspect-[1440/576] rounded-[14px] overflow-hidden shadow-2xl border border-slate-200/50 group">
                        <img
                          src={section.fields.imageUrl}
                          alt={section.title || "Banner"}
                          className="w-full h-full object-cover object-left md:object-center transition-transform duration-500 group-hover:scale-105"
                        />

                        <button
                          onClick={handleBannerClick}
                          className="absolute inset-0 w-full h-full cursor-pointer z-10 outline-none bg-transparent border-0 p-0 m-0"
                          aria-label={section.title || "Banner Action"}
                        />
                      </div>
                    </section>
                  );
                }

                default:
                  return null;
              }
            })}
            {/* Fallback to default trips if no TRIP section and no VIDEO section was configured in the dynamic builder */}
            {!activeSections.some((s) => s.type === "TRIP") &&
              !activeSections.some((s) => s.type === "VIDEO") &&
              renderDefaultTrips()}
          </>
        ) : (
          // ORIGINAL FALLBACK LAYOUT (WHEN BUILDER IS NOT CONFIGURED)
          renderDefaultTrips()
        )}

        {/* HARDCODED BANNERS (Fallback if no CTA_BANNER configured) */}
        {!hasCtaBanners && (
          <>
            <AppPromotion />
            <PrivateTripPromotion />
          </>
        )}

        {/* PRIVATE TRIP SECTION (Always present) */}
        <PrivateTripSection />
      </main>

      {/* Video Modal Player */}
      {selectedVideoUrl && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
            <button
              onClick={closeVideoModal}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors z-50 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            {getYouTubeId(selectedVideoUrl) ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideoUrl)}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            ) : (
              <video
                src={selectedVideoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface ReelVideoCardProps {
  video: {
    title: string;
    url: string;
    thumbnail?: string;
  };
  onClick: () => void;
}

const ReelVideoCard: React.FC<ReelVideoCardProps> = ({ video, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    if (isHovered) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Autoplay prevented:", error);
        });
      }
    } else {
      videoRef.current.pause();
      if (!video.thumbnail) {
        videoRef.current.currentTime = 0.5;
      } else {
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered, video.thumbnail]);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative aspect-[9/16] w-full rounded-[24px] overflow-hidden shadow-lg border border-slate-200/20 cursor-pointer group active:scale-98 transition-all duration-300 bg-slate-900"
    >
      {/* Thumbnail Image */}
      {video.thumbnail && (
        <img
          src={video.thumbnail}
          alt={video.title}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-550 z-2 ${
            isHovered ? "opacity-0 scale-105" : "opacity-100 scale-100"
          }`}
        />
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        src={video.url}
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedMetadata={() => {
          if (!video.thumbnail && videoRef.current) {
            videoRef.current.currentTime = 0.5;
          }
        }}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-1 ${
          video.thumbnail ? (isHovered ? "opacity-100" : "opacity-0 pointer-events-none") : "opacity-100"
        }`}
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30 z-5 pointer-events-none" />

      {/* Play Button Overlay (Center) */}
      <div
        className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-350 pointer-events-none ${
          isHovered ? "opacity-0 scale-75" : "opacity-100 scale-100"
        }`}
      >
        <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Play className="w-6 h-6 text-red-500 fill-red-500 ml-0.5" />
        </div>
      </div>

      {/* Title Overlay (Lower Middle) */}
      <div className="absolute bottom-5 font-semibold left-5 right-5 text-white z-10 text-left pointer-events-none">
        <p className="text-sm font-semibold leading-snug drop-shadow-sm line-clamp-3">{video.title}</p>
      </div>
    </div>
  );
};
