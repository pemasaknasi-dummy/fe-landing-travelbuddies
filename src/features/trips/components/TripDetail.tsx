/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Copy,
  Heart,
  Flame,
  BookOpen,
  Video,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  Play,
  PlusCircle,
  X,
  Eye,
  Star,
  Share2,
  Clock,
  Users,
  Info,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Itinerary from "@/features/trips/components/Itinerary";
import { useTrip } from "../hooks/useTrips";
import { formatRupiah } from "@/lib/format-rupiah";
import { AvailableDates, PromoTrip } from "../api/trip-api";
import { TripDetailSkeleton } from "./skeleton/TripDetailSkeleton";
import { ImageGalleryModal } from "./ImageGalleryModal";
import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { formatViews } from "@/lib/format-views";
import ShareButton from "./ShareButton";
import toast from "react-hot-toast";
import { PromoTripCard } from "./PromoTripCard";
import CalendarTrip from "@/components/sections/CalendarTrip";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "@/components/sections/LoginModal";
import { useBookingSummary } from "@/features/bookings/hooks/useBooking";
import clsx from "clsx";

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

// Format the dates from the backend into a grouped structure by month
const formatAvailableDates = (dates: AvailableDates[]) => {
  if (!dates) return [];

  // Group dates by month
  const groupedByMonth = dates.reduce(
    (acc, dateObj) => {
      const date = new Date(dateObj.date);
      const month = MONTHS[date.getMonth()];
      const day = date.getDate();

      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(day);
      return acc;
    },
    {} as Record<string, number[]>,
  );

  // Convert to array format
  return Object.entries(groupedByMonth).map(([month, dates]) => ({
    month,
    dates: dates.sort((a, b) => a - b), // Sort dates in ascending order
  }));
};

export const TripDetail = ({
  slug,
  isGuarantee: initialIsGuarantee = false,
}: {
  slug: string;
  isGuarantee?: boolean;
}) => {
  const [isGuarantee, setIsGuarantee] = useState<boolean>(initialIsGuarantee);

  useEffect(() => {
    setIsGuarantee(initialIsGuarantee);
    setSelectedTripDate(null);
  }, [initialIsGuarantee]);

  const { data: trip, isLoading, error } = useTrip(slug);
  const rawItin = trip?.itineraries || [];
  const itineraries = useMemo(() => {
    return Array.isArray(rawItin)
      ? rawItin.filter((item: any) => item && !item.hasOwnProperty("notes"))
      : ((rawItin as any)?.days ?? []);
  }, [rawItin]);
  const itineraryNotes = useMemo(() => {
    return Array.isArray(rawItin)
      ? (rawItin.find((item: any) => item && item.hasOwnProperty("notes"))?.notes ?? "")
      : ((rawItin as any)?.notes ?? "");
  }, [rawItin]);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialImageIndex, setInitialImageIndex] = useState(0);
  const FALLBACK_IMAGE = "/images/empty-state.png";
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const { isAuth } = useAuth();
  const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
  const [isSelectedLoading, setIsSelectedLoading] = useState<boolean>(false);

  const flatImages = useMemo(() => {
    if (!trip?.images) return [];
    return trip.images.flatMap((album) => album.images || []);
  }, [trip?.images]);

  const [img1, setImg1] = useState(FALLBACK_IMAGE);
  const [img2, setImg2] = useState(FALLBACK_IMAGE);
  const [img3, setImg3] = useState(FALLBACK_IMAGE);

  useEffect(() => {
    setImg1(flatImages[0] || FALLBACK_IMAGE);
    setImg2(flatImages[1] || FALLBACK_IMAGE);
    setImg3(flatImages[2] || FALLBACK_IMAGE);
  }, [flatImages]);

  // DESCRIPTION
  const [descriptionExpand, setDescriptionExpand] = useState<boolean>(false);
  const [isOverflowingDesc, setIsOverflowingDesc] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  // TripDate
  const [selectedTripDate, setSelectedTripDate] = useState<AvailableDates | null>(null);
  const [paxCount, setPaxCount] = useState<number>(isGuarantee ? 2 : 1);
  const [childCount, setChildCount] = useState<number>(0);

  useEffect(() => {
    setPaxCount(isGuarantee ? 2 : 1);
  }, [isGuarantee]);

  useEffect(() => {
    if (
      !isGuarantee &&
      selectedTripDate &&
      selectedTripDate.remaining !== null &&
      selectedTripDate.remaining !== undefined
    ) {
      const maxAllowed = selectedTripDate.remaining;
      if (paxCount + childCount > maxAllowed) {
        setPaxCount(Math.max(1, maxAllowed - childCount));
      }
    }
  }, [selectedTripDate, isGuarantee]);

  const [paymentScheme, setPaymentScheme] = useState<"FULL" | "DP">("FULL");
  const [customDpAmount, setCustomDpAmount] = useState<string>("");

  useEffect(() => {
    const totalSlots = paxCount + childCount;
    if (trip?.dpMinimumAmount) {
      setCustomDpAmount(String(Number(trip.dpMinimumAmount) * totalSlots));
    } else {
      setCustomDpAmount("");
    }
  }, [trip?.dpMinimumAmount, paxCount, childCount, selectedTripDate]);

  const summaryPayload = useMemo(() => {
    if (!trip?.id || !selectedTripDate) return null;
    const adultParticipants = Array.from({ length: paxCount }, () => ({
      customerType: "ADULT",
    }));
    const childParticipants = Array.from({ length: childCount }, () => ({
      customerType: "CHILD",
    }));

    return {
      sourceId: 7,
      tripId: trip.id,
      tripDateId: selectedTripDate.id ? Number(selectedTripDate.id) : undefined,
      date: selectedTripDate.id ? undefined : selectedTripDate.date,
      slots: paxCount + childCount,
      participants: [...adultParticipants, ...childParticipants],
      additional_order: [],
    };
  }, [trip?.id, selectedTripDate, paxCount, childCount]);

  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isFetching: isSummaryFetching,
  } = useBookingSummary(summaryPayload as any);

  const isDpEligible = useMemo(() => {
    if (!trip?.dpEnabled) return false;
    // if (!isAuth) return true;
    if (summaryData) return !!summaryData.dpEligible;
    return true;
  }, [trip?.dpEnabled, summaryData]);

  useEffect(() => {
    if (!isDpEligible && paymentScheme !== "FULL") {
      setPaymentScheme("FULL");
    }
  }, [isDpEligible, paymentScheme]);
  const [isPromoPDKT, setIsPromoPDKT] = useState<PromoTrip | null>(null);
  const [quotaPromo, setQuotaPromo] = useState<number | null>(null);
  const [isBlackoutDate, setIsBlackoutDate] = useState<boolean | undefined>(false);

  // Video lightbox
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState<string | null>(null);

  // Active main content tab
  const [activeMainTab, setActiveMainTab] = useState<string>("deskripsi");

  // Facility gallery lightbox
  const [isFacilityGalleryOpen, setIsFacilityGalleryOpen] = useState(false);
  const [initialFacilityImageIndex, setInitialFacilityImageIndex] = useState(0);

  const handleOpenFacilityGallery = (index: number) => {
    setInitialFacilityImageIndex(index);
    setIsFacilityGalleryOpen(true);
  };

  const facilityGalleryImages = useMemo(() => {
    if (!trip?.facilityImages) return [];
    return (trip.facilityImages as any[]).map((fac: any) => ({
      name: fac.name,
      images: [fac.image],
    }));
  }, [trip?.facilityImages]);

  const additionalItems = useMemo(() => {
    const tripAdditionals = trip?.additionals || [];
    if (tripAdditionals.length === 0) return [];

    return tripAdditionals
      .map((item: any) => {
        return {
          id: item.additional?.id ?? item.additionalId,
          name: item.additional?.name ?? "",
          unit: item.additional?.unit ?? "",
          price: item.price ?? null,
        };
      })
      .filter((item: any) => item.price !== null);
  }, [trip?.additionals]);

  useEffect(() => {
    if (!trip) return;

    const promoPDKT = trip?.promoTrips?.find((p: any) => p.promo.name === "Promo PDKT");
    setIsPromoPDKT(promoPDKT ?? null);
  }, [trip]);

  useEffect(() => {
    if (!selectedTripDate) return;

    if (!selectedTripDate || !isPromoPDKT?.promo?.exceptionDates) {
      setIsBlackoutDate(false);
    }

    const selected = selectedTripDate?.date;

    const isBlackout = isPromoPDKT?.promo?.exceptionDates?.some((dateStr: string) => dateStr === selected);

    setIsBlackoutDate(isBlackout);

    const dailyUsage = isPromoPDKT?.dailyUsages?.find((du: any) => du.tripDateId === selectedTripDate?.id);

    setQuotaPromo(dailyUsage?.remaining ?? isPromoPDKT?.quotaMaximum ?? null);
  }, [selectedTripDate, trip]);

  // Lock body scroll when login modal is open in TripDetail
  useEffect(() => {
    if (openLoginModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [openLoginModal]);

  const SHORT_MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];

  const formatMobileDateRange = (dateStr: string, days?: number) => {
    const start = new Date(dateStr);
    if (!days) {
      return `${start.getDate()} ${SHORT_MONTHS_ID[start.getMonth()]}`;
    }
    const end = new Date(dateStr);
    end.setDate(start.getDate() + (days - 1));

    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()}-${end.getDate()} ${SHORT_MONTHS_ID[start.getMonth()]}`;
    } else {
      return `${start.getDate()} ${SHORT_MONTHS_ID[start.getMonth()]} - ${end.getDate()} ${SHORT_MONTHS_ID[end.getMonth()]}`;
    }
  };

  const getSeasonalData = (dateObj: Date) => {
    if (!isGuarantee) return null;
    return trip?.seasonalPrices?.find((sp: any) => {
      const date = dayjs(dateObj);
      const start = dayjs(sp.startDate);
      const end = dayjs(sp.endDate);
      return (
        (date.isSame(start, "day") || date.isAfter(start, "day")) &&
        (date.isSame(end, "day") || date.isBefore(end, "day"))
      );
    });
  };

  const getDisplayPrice = () => {
    if (!selectedTripDate) return "";

    // Try to get from summaryData first
    const tripSummary = summaryData?.item_details?.find((i: any) => i.id?.toString().startsWith("trip-"));
    if (tripSummary) {
      return formatRupiah(tripSummary.price);
    }

    if (isGuarantee) {
      const seasonal = getSeasonalData(new Date(selectedTripDate.date));
      const seasonalTiers = seasonal?.tiers;
      if (seasonal && seasonalTiers && seasonalTiers.length > 0) {
        const sortedSeasonalTiers = [...seasonalTiers].sort((a, b) => b.pax - a.pax);
        const matchedSeasonalTier = sortedSeasonalTiers.find((t) => paxCount >= t.pax);
        if (matchedSeasonalTier) {
          return formatRupiah(matchedSeasonalTier.price);
        }
        return formatRupiah(sortedSeasonalTiers[sortedSeasonalTiers.length - 1].price);
      }
      if ((trip?.guaranteeTiers ?? []).length > 0) {
        const sortedTiers = [...trip!.guaranteeTiers].sort((a, b) => b.pax - a.pax);
        const matchedTier = sortedTiers.find((t) => paxCount >= t.pax);
        if (matchedTier) {
          return formatRupiah(matchedTier.price);
        }
        return formatRupiah(sortedTiers[sortedTiers.length - 1].price);
      }
    }
    return formatRupiah(selectedTripDate.price ?? trip?.promoPrice ?? trip?.price ?? 0);
  };

  const handleMobileSelectClick = () => {
    if (!selectedTripDate) return;
    if (!isAuth) {
      setOpenLoginModal(true);
      return;
    }

    setIsSelectedLoading(true);

    const baseUrlSegment = isGuarantee ? "/private-trip" : "/open-trip";
    const useDateOnly = isGuarantee;
    const idParam = selectedTripDate.id && !useDateOnly ? `availableDateId=${selectedTripDate.id}` : "";
    const dateParam = !selectedTripDate.id || useDateOnly ? `date=${selectedTripDate.date}` : "";
    const query = [idParam, dateParam].filter(Boolean).join("&");
    const dpParams =
      trip?.dpEnabled && paymentScheme === "DP"
        ? `&paymentScheme=DP&customDpAmount=${customDpAmount}`
        : `&paymentScheme=FULL`;

    router.push(`${baseUrlSegment}/${trip?.slug}/booking?${query}&pax=${paxCount + childCount}${dpParams}`);
  };

  const [selectedTripYear, setSelectedTripYear] = useState<string>("");
  const filteredAvailableDates = (trip?.availableDates ?? [])
    .filter((item) => {
      const date = new Date(item.date);
      return date.getFullYear().toString() === selectedTripYear && (isGuarantee ? item.isGuarantee : !item.isGuarantee);
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  useEffect(() => {
    if (!trip?.availableDates) return;

    const currentYear = new Date().getFullYear();

    const tripYears = [
      ...new Set(
        trip.availableDates
          .filter((d: any) => (isGuarantee ? d.isGuarantee : !d.isGuarantee))
          .map((item) => new Date(item.date).getFullYear())
          .filter((year) => year >= currentYear),
      ),
    ].sort((a, b) => a - b);

    if (tripYears.length > 0) {
      setSelectedTripYear(tripYears[0].toString());
    }
  }, [trip, isGuarantee]);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const maxHeightDesc = 5 * 24; // 5 baris * 24px line-height
  // Handle row/height Description
  useEffect(() => {
    if (textRef.current) {
      const fullHeight = textRef.current.scrollHeight;

      // Jika tinggi teks lebih dari tinggi 5 baris → tampilkan tombol
      setIsOverflowingDesc(fullHeight > maxHeightDesc);
    }
  }, [trip?.description]);

  const openGallery = (index: number = 0) => {
    setInitialImageIndex(index);
    setIsGalleryOpen(true);
  };

  const generateScheduleText = () => {
    const schedules = formatAvailableDates(filteredAvailableDates);
    if (!schedules || schedules.length === 0) return "";

    const body = schedules
      .map((ad) => {
        const dateRanges = ad.dates
          .map((day) => {
            const dateObj = trip?.availableDates?.find((item) => {
              const date = new Date(item.date);
              return date.getDate() === day && MONTHS[date.getMonth()] === ad.month;
            });

            if (!dateObj) return null;

            const start = dayjs(dateObj.date);
            const end = start.add((trip?.days ?? 0) - 1, "day");

            return `${start.format("DD")}-${end.format("DD")}`;
          })
          .filter(Boolean)
          .join(", ");

        return `${ad.month} : ${dateRanges}`;
      })
      .join("\n");

    return "Jadwal:\n" + body;
  };

  const handleCopySchedule = async () => {
    const text = generateScheduleText();
    if (!text) return;
    toast.success("Jadwal berhasil disalin", {
      position: "top-center",
      duration: 3000,
    });

    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Copy failed", err);
      toast.error("Jadwal gagal disalin", {
        position: "top-center",
        duration: 3000,
      });
    }
  };

  const copyItinerary = (itineraries: Itinerary[]) => {
    if (!itineraries.length) return;

    const formattedText = itineraries
      .map((day: Itinerary, index: number) => {
        const dayTitle = `Hari ${index + 1} :`;

        const activities = day.activities.map((act: any) => `${act.time} - ${act.activity}`).join("\n");

        return `${dayTitle}\n${activities}`;
      })
      .join("\n\n");

    const finalText = itineraryNotes ? `${formattedText}\n\nCatatan:\n${itineraryNotes}` : formattedText;

    navigator.clipboard.writeText(finalText);
    toast.success("Itinerary berhasil disalin", {
      position: "top-center",
      duration: 3000,
    });
  };

  const handleCopyAllTripInfo = async () => {
    if (!trip) return;

    const scheduleText = generateScheduleText();

    // itinerary
    const itineraryText = (itineraries as Itinerary[])
      ?.map((day: Itinerary, index: number) => {
        const dayTitle = `Hari ${index + 1} :`;

        const activities = day.activities.map((act: any) => `${act.time} - ${act.activity}`).join("\n");

        return `${dayTitle}\n${activities}`;
      })
      .join("\n\n");
    const finalItineraryText = itineraryNotes ? `${itineraryText}\n\nCatatan:\n${itineraryNotes}` : itineraryText;
    const finalItenerary = "Itenerary:\n" + finalItineraryText;

    // inclusions
    const inclusions = trip.inclusions?.length
      ? `Include :\n${trip.inclusions.map((item) => `- ${item}`).join("\n")}`
      : "";

    // exclusions
    const exclusions = trip.exclusions?.length
      ? `Exclude :\n${trip.exclusions.map((item) => `- ${item}`).join("\n")}`
      : "";

    // meeting points
    const meetingPoints = trip.destinations?.[0]?.meetingPoints?.length
      ? `Meeting Point :\n${trip.destinations[0].meetingPoints
        .map((mp) => (mp.time ? `- ${mp.location} (${mp.time})` : `- ${mp.location}`))
        .join("\n")}`
      : "";

    // =========================
    // PRICE LOGIC
    // =========================

    const highSeasonPrices = trip.availableDates?.map((d) => d.price).filter((p) => p !== null);

    const uniqueHighSeason = [...new Set(highSeasonPrices)];

    const normalPrice = trip.promoPrice ?? trip.price;

    let priceText = "Harga :\n";

    if (uniqueHighSeason.length) {
      priceText += `High Season : ${uniqueHighSeason.map((p) => formatRupiah(p)).join(", ")}\n`;
    }

    if (normalPrice) {
      priceText += `Normal : ${formatRupiah(normalPrice)}`;
    }

    // =========================
    // FINAL TEXT
    // =========================

    const fullText = [
      `Link Detail: ${baseUrl}${isGuarantee ? "/private-trip" : "/open-trip"}/${trip.slug}`,

      scheduleText,
      priceText,
      inclusions,
      exclusions,
      meetingPoints,
      finalItenerary,
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(fullText);

      toast.success("Semua data trip berhasil disalin", {
        position: "top-center",
        duration: 3000,
      });
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyalin data", {
        position: "top-center",
        duration: 3000,
      });
    }
  };

  if (isLoading) {
    return <TripDetailSkeleton />;
  }

  if (error) {
    return <div>Error loading trips: {error.message}</div>;
  }

  return (
    <section className="xl:-mx-5 pb-6 lg:pb-0">
      {/* GALLERY IMAGE */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 h-[250px] md:h-[480px]">
          {/* BIG IMAGE (Left) */}
          <div
            className="relative md:col-span-2 h-full cursor-pointer overflow-hidden rounded-3xl group"
            onClick={() => openGallery(0)}
          >
            <Image
              src={img1}
              onError={() => setImg1(FALLBACK_IMAGE)}
              fill
              unoptimized={process.env.NODE_ENV === "development"}
              alt="main-gallery-1"
              className="w-full h-full object-cover rounded-3xl transition-transform duration-500 group-hover:scale-[1.01]"
            />
          </div>

          {/* RIGHT STACK (Right) */}
          <div className="hidden md:flex flex-col gap-3 md:gap-4 h-full">
            {/* SMALL IMAGE 1 (Top Right) */}
            <div
              className="relative flex-1 cursor-pointer overflow-hidden rounded-3xl group"
              onClick={() => openGallery(1)}
            >
              <Image
                src={img2}
                onError={() => setImg2(FALLBACK_IMAGE)}
                fill
                unoptimized={process.env.NODE_ENV === "development"}
                alt="main-gallery-2"
                className="w-full h-full object-cover rounded-3xl transition-transform duration-500 group-hover:scale-[1.01]"
              />
            </div>

            {/* LIHAT SEMUA FOTO CARD (Bottom Right) */}
            <div
              className="relative flex-1 cursor-pointer overflow-hidden rounded-3xl group"
              onClick={() => openGallery(2)}
            >
              <Image
                src={img3}
                onError={() => setImg3(FALLBACK_IMAGE)}
                fill
                unoptimized={process.env.NODE_ENV === "development"}
                alt="main-gallery-3"
                className="w-full h-full object-cover rounded-3xl transition-transform duration-500 group-hover:scale-[1.01]"
              />
              {/* Dark overlay with centered text */}
              <div className="absolute inset-0 bg-black/40 hover:bg-black/30 transition-colors flex items-center justify-center rounded-3xl">
                <span className="text-white font-semibold text-base md:text-lg tracking-wide select-none">
                  Lihat Semua Foto
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add the ImageGalleryModal component */}
      <ImageGalleryModal
        images={trip?.images || []}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        initialIndex={initialImageIndex}
      />

      {/* Add the Facility Gallery modal */}
      <ImageGalleryModal
        images={facilityGalleryImages}
        isOpen={isFacilityGalleryOpen}
        onClose={() => setIsFacilityGalleryOpen(false)}
        initialIndex={initialFacilityImageIndex}
      />

      {/* Video Lightbox Modal */}
      {activeVideoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => {
            setActiveVideoUrl(null);
            setActiveVideoTitle(null);
          }}
        >
          <div
            className="relative w-full max-w-md bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 text-white">
              <h4 className="font-semibold text-sm line-clamp-1">{activeVideoTitle}</h4>
              <button
                onClick={() => {
                  setActiveVideoUrl(null);
                  setActiveVideoTitle(null);
                }}
                className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-[9/16] bg-black flex items-center justify-center">
              <video src={activeVideoUrl} controls autoPlay loop className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* JUDUL TRIP */}
      <section className="mt-6 p-6 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-2">
          <div className="flex items-start md:items-center justify-between">
            {/* Title */}
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wide">{trip?.title}</h1>
            </div>

            {/* Copy Data & Share Button */}
            <div className="flex items-center justify-center gap-x-3">
              <button
                onClick={handleCopyAllTripInfo}
                className="mt-2 cursor-pointer text-gray-400 hover:text-blue-500 hover:scale-110 transition-all duration-300"
                title="Salin semua info trip"
              >
                <Copy className="size-5 md:size-7" />
              </button>
              <ShareButton title="Travel Buddies" text="Your best travel mate!" url={`${baseUrl}${isGuarantee ? "/private-trip" : "/open-trip"}/${trip?.slug}`} tripId={trip?.id} />
            </div>
          </div>

          <h2 className="text-[20px] md:text-[26px] font-extrabold text-gray-900 leading-tight">{trip?.subtitle}</h2>

          <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
            <MapPin size={16} className="text-gray-400" />
            <span>{trip?.location}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
            <div className="flex items-center justify-center gap-2">
              <Star size={18} />
              <span className="font-semibold text-gray-950">
                {trip?.rating ? Number(trip.rating).toFixed(1) : "4.8"}
              </span>
            </div>

            <div className="flex items-center justify-center gap-1.5">
              <Eye size={19} />
              <span className="font-semibold text-gray-950">{formatViews(trip?.views)}</span>
              <span>kali dilihat</span>
            </div>

            <div className="flex items-center justify-center gap-1.5">
              {/* <span className="text-gray-400">🔗</span> */}
              <Share2 size={16} />
              <span className="font-semibold text-gray-950">{trip?.shareCount || 0}</span>
              <span>dibagikan</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN SECTION */}
      <section className="mt-8 flex flex-col lg:flex-row justify-between gap-12">
        {/* LEFT SIDE */}
        <div className="lg:w-[60%] xl:w-[60%] 2xl:w-[70%] space-y-8">
          {/* Segmented Control for Trip Type (Open vs Private) */}
          {trip?.isTripGuarantee && (
            <div className="bg-slate-100 p-1 md:p-1.5 rounded-xl md:rounded-2xl flex relative w-full shadow-inner">
              <Link
                href={`/open-trip/${trip.slug}`}
                scroll={false}
                className={clsx(
                  "flex-1 py-2.5 md:py-3.5 rounded-lg md:rounded-xl font-bold text-xs md:text-sm lg:text-base flex items-center justify-center gap-1.5 md:gap-2 transition-all z-10 cursor-pointer select-none",
                  !isGuarantee
                    ? "text-blue-600 shadow-sm bg-white"
                    : "text-gray-500 hover:text-gray-700 bg-transparent",
                )}
              >
                <Users className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                <span>
                  Open Trip <span className="hidden sm:inline">(Gabungan)</span>
                </span>
              </Link>
              <Link
                href={`/private-trip/${trip.slug}`}
                scroll={false}
                className={clsx(
                  "flex-1 py-2.5 md:py-3.5 rounded-lg md:rounded-xl font-bold text-xs md:text-sm lg:text-base flex items-center justify-center gap-1.5 md:gap-2 transition-all z-10 cursor-pointer select-none",
                  isGuarantee
                    ? "text-orange-600 shadow-sm bg-white"
                    : "text-gray-500 hover:text-gray-700 bg-transparent",
                )}
              >
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                <span>
                  Private Trip <span className="hidden sm:inline">(Eksklusif)</span>
                </span>
              </Link>
            </div>
          )}

          {/* Contextual Info Box */}
          {trip?.isTripGuarantee && (
            <div
              className={clsx(
                "p-5 rounded-2xl border transition-all duration-300 flex gap-4 items-start",
                !isGuarantee
                  ? "bg-blue-50/50 border-blue-100 text-blue-900"
                  : "bg-orange-50/50 border-orange-100 text-orange-950",
              )}
            >
              <div
                className={clsx(
                  "p-2 rounded-full mt-0.5 shrink-0",
                  !isGuarantee ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600",
                )}
              >
                <Info className="w-5 h-5" />
              </div>
              <div className="w-full text-left">
                <h4 className="font-bold mb-1">
                  {!isGuarantee ? "Keuntungan Open Trip" : "Keistimewaan Private Trip"}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {!isGuarantee
                    ? "Pilihan hemat untuk solo traveler atau grup kecil. Bergabung dengan teman baru, jadwal pasti berangkat setiap akhir pekan tanpa minimum kuota."
                    : "Lebih fleksibel menentukan jadwal, lebih private tanpa bergabung dengan rombongan lain, dan lebih eksklusif karena kamu yang menentukan setiap pilihan."}
                </p>
              </div>
            </div>
          )}

          {/* TRIP GUARANTEE PRICE LIST */}
          {isGuarantee &&
            (() => {
              const seasonal = selectedTripDate
                ? trip?.seasonalPrices?.find((sp: any) => {
                  const date = dayjs(selectedTripDate.date);
                  const start = dayjs(sp.startDate);
                  const end = dayjs(sp.endDate);
                  return (
                    (date.isSame(start, "day") || date.isAfter(start, "day")) &&
                    (date.isSame(end, "day") || date.isBefore(end, "day"))
                  );
                })
                : null;

              const tiersToDisplay =
                seasonal && (seasonal.tiers ?? [])?.length > 0 ? seasonal.tiers : trip?.guaranteeTiers;

              if (!tiersToDisplay || tiersToDisplay.length === 0) return null;

              return (
                <div
                  className={`p-6 rounded-2xl border shadow-sm transition-all duration-300 ${seasonal ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    {seasonal ? (
                      <div className="bg-blue-500 p-1.5 rounded-lg shadow-sm">
                        <Flame size={20} className="text-white fill-white" />
                      </div>
                    ) : (
                      <Flame size={24} className="text-orange-500 fill-orange-500" />
                    )}
                    <h3 className="font-bold text-[22px] text-gray-800">
                      {seasonal ? "Daftar Harga High Season" : "Daftar Harga Private Trip"}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">
                    {seasonal
                      ? `Harga khusus untuk keberangkatan tanggal ${dayjs(selectedTripDate?.date).format("DD MMMM YYYY")}.`
                      : "Makin rame makin murah! Harga akan otomatis menyesuaikan jumlah peserta saat Anda melakukan booking."}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {[...tiersToDisplay]
                      .sort((a, b) => a.pax - b.pax)
                      .map((tier: any) => {
                        const isActive = paxCount === tier.pax;
                        return (
                          <button
                            key={tier.id || tier.pax}
                            type="button"
                            onClick={() => {
                              setPaxCount(tier.pax);
                              const maxAllowed = isGuarantee
                                ? 15
                                : selectedTripDate?.remaining !== null && selectedTripDate?.remaining !== undefined
                                  ? selectedTripDate.remaining
                                  : 15;
                              setChildCount((prevChild) => Math.max(0, Math.min(prevChild, maxAllowed - tier.pax)));
                            }}
                            className={clsx(
                              "p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer shadow-sm select-none w-full outline-none",
                              isActive
                                ? seasonal
                                  ? "bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100"
                                  : "bg-orange-500 border-orange-500 text-white ring-4 ring-orange-100"
                                : "bg-white border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50",
                            )}
                          >
                            <span
                              className={clsx(
                                "text-xs font-bold uppercase tracking-wider mb-1",
                                isActive ? (seasonal ? "text-blue-100" : "text-orange-100") : "text-gray-400",
                              )}
                            >
                              {tier.pax} Pax
                            </span>
                            <span
                              className={clsx(
                                "text-base font-extrabold",
                                isActive ? "text-white" : seasonal ? "text-blue-600" : "text-orange-600",
                              )}
                            >
                              {formatRupiah(tier.price).replace(",00", "")}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                  {seasonal && (
                    <div className="mt-4 flex items-center gap-2 text-[11px] text-blue-600 font-medium bg-white/50 w-fit px-3 py-1 rounded-full border border-blue-100">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                      Berlaku khusus periode high season
                    </div>
                  )}
                </div>
              );
            })()}

          {/* OPSI PEMBAYARAN FLEKSIBEL SECTION */}
          {trip?.dpEnabled && trip?.dpMinimumAmount && !isGuarantee && (
            <div className="mb-8 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              {/* Title Header */}
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100">
                    <Wallet className="w-5 h-5 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">Opsi Pembayaran Fleksibel</h3>
                </div>
                {/* <span className="bg-rose-50 text-rose-500 text-xs font-bold px-3 py-1 rounded-full border border-rose-100">
                  Penawaran Merarik
                </span> */}
              </div>

              {/* Main Banner Gradient */}
              <div className="bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-2xl p-5 md:p-6 shadow-md flex items-center gap-4 md:gap-5">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center shrink-0">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base md:text-lg mb-1 flex items-center gap-1.5">
                    Amankan Slot Liburanmu! <span className="animate-bounce">🔥</span>
                  </h4>
                  <p className="text-xs md:text-sm text-white/90 leading-relaxed font-medium">
                    Hanya dengan DP
                    <span className="bg-yellow-300 text-slate-900 font-extrabold px-2 py-0.5 rounded-md mx-1.5 inline-block shadow-sm animate-pulse">
                      {formatRupiah(trip.dpMinimumAmount)}
                    </span>
                    /pax (minimal {Math.round((trip.dpMinimumAmount / (trip.promoPrice ?? trip.price ?? 1)) * 100)}%),
                    kamu sudah bisa amankan seat untuk trip ini. Sisa tagihan bisa dilunasi belakangan dengan mudah!
                  </p>
                </div>
              </div>

              {/* Catatan / Footer */}
              <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-start gap-3">
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  * Catatan: Pembelian menggunakan metode minimal DP ({formatRupiah(trip.dpMinimumAmount)} per pax)
                  berlaku di atas H-{trip?.dpRepaymentDaysBefore ?? 7} Keberangkatan trip.
                </p>
              </div>
            </div>
          )}

          {/* TAB NAVIGATION */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="flex overflow-x-auto scrollbar-none">
              {[
                { id: "deskripsi", label: "Deskripsi" },
                { id: "fasilitas", label: "Fasilitas" },
                { id: "itinerary", label: "Itinerary" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMainTab(tab.id)}
                  className={clsx(
                    "pb-4 pt-5 px-6 whitespace-nowrap font-bold text-sm transition-all border-b-2 cursor-pointer",
                    activeMainTab === tab.id
                      ? "text-blue-600 border-blue-600"
                      : "text-gray-400 border-transparent hover:text-gray-700",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ===== DESKRIPSI TAB ===== */}
          {activeMainTab === "deskripsi" && (
            <>
              {/* Tentang trip ini */}
              <div className="p-6 md:p-8 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500 text-white">
                    <BookOpen size={20} />
                  </div>
                  <h3 className="font-bold text-[20px] text-gray-900">Tentang trip ini</h3>
                </div>
                <div className="relative">
                  <p
                    ref={textRef}
                    className={`text-gray-600 leading-relaxed text-[15px] ${descriptionExpand ? "line-clamp-none" : "line-clamp-5"}`}
                  >
                    {trip?.description}
                  </p>
                  {isOverflowingDesc && (
                    <button
                      onClick={() => setDescriptionExpand(!descriptionExpand)}
                      className="mt-3 text-blue-500 font-semibold hover:text-blue-700 transition-colors duration-300 cursor-pointer text-sm"
                    >
                      {descriptionExpand ? "Lebih Sedikit" : "Selengkapnya"}
                    </button>
                  )}
                </div>
              </div>

              {/* Video Keseruan Trip */}
              {trip?.videos && (trip.videos as any[]).length > 0 && (
                <div className="p-6 md:p-8 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500 text-white">
                      <Video size={20} />
                    </div>
                    <h3 className="font-bold text-[20px] text-gray-900">Video Keseruan Trip</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {(trip.videos as any[]).map((vid, idx) => (
                      <HoverVideoCard
                        key={idx}
                        vid={vid}
                        fallbackImage={FALLBACK_IMAGE}
                        onClick={() => {
                          setActiveVideoUrl(vid.video_file);
                          setActiveVideoTitle(vid.video_title);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Opsi Titik Kumpul (Meeting Point) */}
              <div className="p-6 md:p-8 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500 text-white">
                    <MapPin size={20} />
                  </div>
                  <h3 className="font-bold text-[20px] text-gray-900">Opsi Titik Kumpul (Meeting Point)</h3>
                </div>
                <div className="space-y-4">
                  {trip?.destinations?.[0]?.meetingPoints && trip.destinations[0].meetingPoints.length > 0 ? (
                    trip.destinations[0].meetingPoints.map((mp, index) => (
                      <div
                        key={index}
                        className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-sm hover:border-blue-300 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-gray-900 text-lg">{mp.location}</p>
                          </div>
                          <p className="text-gray-500 text-sm">{(mp as any)?.description || ""}</p>
                        </div>
                        {mp.time && (
                          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 w-fit shrink-0">
                            <Clock size={16} />
                            {mp.time} WIB
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">Tidak ada meeting point</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ===== FASILITAS TAB ===== */}
          {activeMainTab === "fasilitas" && (
            <>
              {/* Additional Item */}

              <div className="p-6 md:p-8 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500 text-white">
                    <PlusCircle size={20} />
                  </div>
                  <h3 className="font-bold text-[20px] text-gray-900">Additional Item</h3>
                </div>

                {additionalItems.length > 0 ? (
                  <>
                    <p className="text-gray-500 text-[14px] mb-6">
                      Item yang tersedia di destinasi ini, bisa dibeli di halaman pembayaran
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {additionalItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-[#fbfbfe] rounded-xl border border-blue-50/50 flex flex-col justify-center"
                        >
                          <p className="font-bold text-gray-800 text-[15px] mb-1">{item.name}</p>
                          <p className="text-gray-500 text-xs font-medium">
                            Harga mulai dari {formatRupiah(item.price!)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="mt-5 text-gray-500 text-[14px]">Trip tidak memiliki additionals</p>
                )}
              </div>

              {/* Include (Sudah Termasuk) */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500 text-white">
                    <CheckCircle size={20} />
                  </div>
                  <h3 className="font-bold text-[20px] text-emerald-800">Yang Termasuk (Include)</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                  {trip?.inclusions?.length ? (
                    trip.inclusions.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <CheckCircle size={12} className="text-emerald-600" />
                        </div>
                        <span className="text-gray-700 text-sm font-medium leading-relaxed">{item}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">Tidak ada fasilitas yang didapatkan</p>
                  )}
                </div>
              </div>

              {/* Exclude (Belum Termasuk) */}
              <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500 text-white">
                    <XCircle size={20} />
                  </div>
                  <h3 className="font-bold text-[20px] text-red-800">Belum Termasuk (Exclude)</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                  {trip?.exclusions && trip.exclusions.filter((i) => i.trim() !== "").length > 0 ? (
                    trip.exclusions
                      .filter((i) => i.trim() !== "")
                      .map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="mt-0.5 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <XCircle size={12} className="text-red-600" />
                          </div>
                          <span className="text-gray-700 text-sm font-medium leading-relaxed">{item}</span>
                        </div>
                      ))
                  ) : (
                    <p className="text-gray-400 text-sm">Tidak ada fasilitas diluar trip</p>
                  )}
                </div>
              </div>

              {/* Foto Fasilitas */}
              {trip?.facilityImages && (trip.facilityImages as any[]).length > 0 && (
                <div className="p-6 md:p-8 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500 text-white">
                      <ImageIcon size={20} />
                    </div>
                    <h3 className="font-bold text-[20px] text-gray-900">Foto Fasilitas</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(trip.facilityImages as any[]).map((fac, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-100 shadow-sm cursor-pointer"
                        onClick={() => handleOpenFacilityGallery(idx)}
                      >
                        <Image
                          src={fac.image || FALLBACK_IMAGE}
                          alt={fac.name || "Facility"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 group-hover:opacity-90 transition-opacity duration-300"></div>
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <p className="font-semibold text-sm line-clamp-1 truncate drop-shadow-md">{fac.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ===== ITINERARY TAB ===== */}
          {activeMainTab === "itinerary" && (
            <div className="p-6 md:p-8 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500 text-white">
                    <Calendar size={20} />
                  </div>
                  <h3 className="font-bold text-[20px] text-gray-900">Itinerary</h3>
                </div>
                <button
                  onClick={() => copyItinerary(itineraries)}
                  className="cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Salin itinerary"
                >
                  <Copy
                    size={20}
                    className="text-gray-400 hover:text-blue-500 hover:scale-110 transition-all duration-300"
                  />
                </button>
              </div>
              <Itinerary data={itineraries} />
              {itineraryNotes && (
                <div className="mt-6 p-4 bg-amber-50/60 border border-amber-100 rounded-2xl flex gap-3 text-amber-900 shadow-sm">
                  <svg
                    className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <div className="flex flex-col gap-1 w-full">
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-700">Catatan Penting</span>
                    <p className="text-sm leading-relaxed text-amber-800 whitespace-pre-line">{itineraryNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ketersediaan Jadwal (Mobile Only) */}
          <div className="block lg:hidden space-y-4">
            {isPromoPDKT && !isBlackoutDate && (
              <PromoTripCard
                name="Promo PDKT"
                slug="PROMO_PDKT"
                title={quotaPromo !== null && quotaPromo < 1 ? "Kuota promo sudah habis" : "Jadilah peserta pertama"}
                icon={
                  <Heart
                    color={quotaPromo !== null && quotaPromo < 1 ? "gray" : "red"}
                    fill={quotaPromo !== null && quotaPromo < 1 ? "gray" : "red"}
                  />
                }
                quota={quotaPromo}
                discountMode={isPromoPDKT.discountMode}
                discountValue={isPromoPDKT.discountValue}
              />
            )}
            <CalendarTrip
              mode="desktop"
              initialSelectedDate={dateParam}
              trip={
                {
                  ...trip,
                  availableDates: trip?.availableDates?.filter((d) => (isGuarantee ? d.isGuarantee : !d.isGuarantee)),
                } as any
              }
              onCopy={handleCopySchedule}
              onSelectedTripDate={(data) => setSelectedTripDate(data)}
              baseUrl={isGuarantee ? "/private-trip" : undefined}
              paxCount={paxCount}
              setPaxCount={setPaxCount}
              childCount={childCount}
              setChildCount={setChildCount}
              paymentScheme={paymentScheme}
              setPaymentScheme={setPaymentScheme}
              customDpAmount={customDpAmount}
              setCustomDpAmount={setCustomDpAmount}
              isDpEligible={isDpEligible}
              isSummaryLoading={isSummaryLoading || isSummaryFetching}
              summaryData={summaryData}
            />
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="hidden lg:block lg:w-[40%] xl:w-[40%] 2xl:w-[30%]">
          <div className="sticky top-28 space-y-6">
            {isPromoPDKT && !isBlackoutDate && (
              <PromoTripCard
                name="Promo PDKT"
                slug="PROMO_PDKT"
                title={quotaPromo !== null && quotaPromo < 1 ? "Kuota promo sudah habis" : "Jadilah peserta pertama"}
                icon={
                  <Heart
                    color={quotaPromo !== null && quotaPromo < 1 ? "gray" : "red"}
                    fill={quotaPromo !== null && quotaPromo < 1 ? "gray" : "red"}
                  />
                }
                quota={quotaPromo}
                discountMode={isPromoPDKT.discountMode}
                discountValue={isPromoPDKT.discountValue}
              />
            )}

            <div className="flex justify-center w-full">
              <div className="relative w-full">
                <CalendarTrip
                  mode="desktop"
                  initialSelectedDate={dateParam}
                  trip={
                    {
                      ...trip,
                      availableDates: trip?.availableDates?.filter((d) =>
                        isGuarantee ? d.isGuarantee : !d.isGuarantee,
                      ),
                    } as any
                  }
                  onCopy={handleCopySchedule}
                  onSelectedTripDate={(data) => setSelectedTripDate(data)}
                  baseUrl={isGuarantee ? "/private-trip" : undefined}
                  paxCount={paxCount}
                  setPaxCount={setPaxCount}
                  childCount={childCount}
                  setChildCount={setChildCount}
                  paymentScheme={paymentScheme}
                  setPaymentScheme={setPaymentScheme}
                  customDpAmount={customDpAmount}
                  setCustomDpAmount={setCustomDpAmount}
                  isDpEligible={isDpEligible}
                  isSummaryLoading={isSummaryLoading || isSummaryFetching}
                  summaryData={summaryData}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Sticky Bottom Bar (floats natively and docks at the bottom of main section before footer) */}
      {/* {selectedTripDate && (
        <div
          className="sticky bottom-4 z-40 lg:hidden bg-white/95 rounded-2xl border border-gray-100 p-4 flex justify-between items-center backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full mt-5"
          style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
        > */}
      {/* Left: Info Tanggal & Harga */}
      {/* <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tanggal Keberangkatan</span>
            <span className="font-extrabold text-sm text-gray-800 leading-tight">
              {formatMobileDateRange(selectedTripDate.date, trip?.days)}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-extrabold text-orange-600 text-lg leading-tight">{getDisplayPrice()}</span>
              <span className="text-[10px] text-gray-400 font-semibold">/ pax</span>
            </div>
          </div> */}

      {/* Right: Button Pilih Tanggal Ini */}
      {/* <button
            onClick={handleMobileSelectClick}
            disabled={isSelectedLoading || selectedTripDate.remaining === 0 || selectedTripDate.status?.toUpperCase() === "FULL"}
            className="px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-xl transition-all duration-200 shadow-md text-xs cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0"
          >
            {selectedTripDate.remaining === 0 || selectedTripDate.status?.toUpperCase() === "FULL" ? (
              "Tanggal sudah penuh"
            ) : isSelectedLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Memproses...</span>
              </>
            ) : (
              "Pilih Tanggal Ini"
            )}
          </button> */}
      {/* </div>
      )} */}

      {/* Login Modal for Mobile Floating Bar - rendered via portal */}
      {openLoginModal && selectedTripDate && (
        <LoginModal
          onClose={() => setOpenLoginModal(false)}
          redirectTo={`${isGuarantee ? "/private-trip" : "/open-trip"}/${trip?.slug}/booking?${selectedTripDate.id && !isGuarantee
            ? `availableDateId=${selectedTripDate.id}`
            : `date=${selectedTripDate.date}`
            }`}
        />
      )}
    </section>
  );
};

const HoverVideoCard = ({ vid, onClick, fallbackImage }: { vid: any; onClick: () => void; fallbackImage: string }) => {
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
      // Seek to 0.5s if no thumbnail is available, otherwise reset to 0
      if (!vid.thumbnail) {
        videoRef.current.currentTime = 0.5;
      } else {
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered, vid.thumbnail]);

  return (
    <div
      className="group relative aspect-[9/16] rounded-xl overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-all duration-300 bg-black"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      {vid.thumbnail && (
        <Image
          src={vid.thumbnail}
          alt={vid.video_title || "Trip Video"}
          fill
          unoptimized={process.env.NODE_ENV === "development"}
          className={`object-cover transition-all duration-500 ${isHovered ? "opacity-0 scale-105" : "opacity-100 scale-100"
            }`}
        />
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        src={vid.video_file}
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedMetadata={() => {
          if (!vid.thumbnail && videoRef.current) {
            videoRef.current.currentTime = 0.5;
          }
        }}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${vid.thumbnail ? (isHovered ? "opacity-100" : "opacity-0 pointer-events-none") : "opacity-100"
          }`}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none"></div>

      {/* Play Button Overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${isHovered ? "opacity-0" : "opacity-100"
          }`}
      >
        <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md transform group-hover:scale-110 transition-transform duration-300">
          <Play size={20} fill="white" className="ml-1" />
        </div>
      </div>

      {/* Title Overlay */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
        <p className="text-white font-semibold text-sm line-clamp-2 drop-shadow-md">{vid.video_title}</p>
      </div>
    </div>
  );
};
