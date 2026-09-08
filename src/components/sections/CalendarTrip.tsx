/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Users,
  ChevronRight,
  Clock,
  CalendarDays,
  Copy,
  Flame,
  CircleAlert,
  BadgePercent,
  X,
  CheckCircle,
  Wallet,
  ChevronDown,
} from "lucide-react";
import { AvailableDates, Trip } from "@/features/trips/api/trip-api";
import { formatRupiah } from "@/lib/format-rupiah";
import { useRouter } from "next/navigation";
import LoginModal from "./LoginModal";
import { useAuth } from "@/context/AuthContext";
import Fire from "../../../public/icons/fire.svg";
import Image from "next/image";
import clsx from "clsx";
import Link from "next/link";
import dayjs from "dayjs";

interface PreviewDate extends TripPromos {
  id: number;
  date: string;
  price: number | null;
  minimum: number;
  quota: number;
  remaining: number;
  status: string;
  isGuarantee: boolean;
}

interface TripPromos {
  id?: number;
  name?: string;
  usagePeriodFrom?: string;
  usagePeriodTo?: string;
  exceptionDates?: string[];
}

interface Props {
  trip?: Trip;
  onSelectedTripDate: (data: any) => void;
  onCopy: () => void;
  baseUrl?: string;
  mode?: "desktop" | "mobile";
  initialSelectedDate?: string | null;
  paxCount: number;
  setPaxCount: React.Dispatch<React.SetStateAction<number>>;
  childCount?: number;
  setChildCount?: React.Dispatch<React.SetStateAction<number>>;
  paymentScheme: "FULL" | "DP";
  setPaymentScheme: React.Dispatch<React.SetStateAction<"FULL" | "DP">>;
  customDpAmount: string;
  setCustomDpAmount: React.Dispatch<React.SetStateAction<string>>;
  isDpEligible: boolean;
  isSummaryLoading: boolean;
  summaryData?: any;
}

// Calendar Popover Component
export default function CalendarTrip({
  trip,
  onCopy,
  onSelectedTripDate,
  baseUrl = "/open-trip",
  mode = "desktop",
  initialSelectedDate,
  paxCount,
  setPaxCount,
  childCount = 0,
  setChildCount,
  paymentScheme,
  setPaymentScheme,
  customDpAmount,
  setCustomDpAmount,
  isDpEligible,
  isSummaryLoading,
  summaryData,
}: Props) {
  const totalPax = paxCount + childCount;
  const isGuaranteeMode = baseUrl === "/private-trip";
  const minPax = isGuaranteeMode ? 2 : 1;
  const { isAuth } = useAuth();
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
  const [previewDate, setPreviewDate] = useState<PreviewDate | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [isFullSlot, setIsFullSlot] = useState<boolean>(false);
  const [isSelectedLoading, setIsSelectedLoading] = useState<boolean>(false);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState<boolean>(false);

  const maxPax = useMemo(() => {
    if (!isGuaranteeMode && previewDate) {
      return previewDate.remaining !== null && previewDate.remaining !== undefined
        ? Math.max(1, previewDate.remaining)
        : 15;
    }
    return 15;
  }, [isGuaranteeMode, previewDate]);

  console.log("maxPax: ", maxPax)

  // Badge Promo
  const [tripPromos, setTripPromos] = useState<TripPromos[]>([]);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const PROMO_ICON_COLORS = ["#d946ef", "#eab308", "#06b6d4", "#f97316", "#22c55e"];
  const PROMO_DOT_COLORS = ["bg-fuchsia-500", "bg-yellow-500", "bg-cyan-500", "bg-orange-500", "bg-green-500"];

  function formatDateOnly(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function isPromoActive(date: Date, promo: any) {
    const currentDateStr = formatDateOnly(date);

    const from = promo.usagePeriodFrom.split("T")[0];
    const to = promo.usagePeriodTo.split("T")[0];

    const isInsidePeriod = currentDateStr >= from && currentDateStr <= to;

    if (!isInsidePeriod) return false;

    // Kalau tidak pakai exception rule
    if (promo.dateRuleType !== "apply-with-exception") {
      return true;
    }

    // Kalau pakai exception rule
    const exceptionDateStrings = promo.exceptionDates.map((d: string) => d.split("T")[0]);

    return !exceptionDateStrings.includes(currentDateStr);
  }

  const activePromos = useMemo(() => {
    if (!previewDate) return [];

    return tripPromos
      .map((promo, index) => ({
        promo,
        index,
      }))
      .filter(({ promo }) => isPromoActive(new Date(previewDate.date), promo));
  }, [previewDate?.date, tripPromos]);

  useEffect(() => {
    if (!trip?.promoTrips?.length) {
      setTripPromos([]);
      return;
    }

    const mappedPromos = trip.promoTrips.map((promoTrip) => ({
      id: promoTrip?.promo?.id,
      name: promoTrip?.promo?.name,
      dateRuleType: promoTrip?.promo?.dateRuleType,
      usagePeriodFrom: promoTrip?.promo?.usagePeriodFrom,
      usagePeriodTo: promoTrip?.promo?.usagePeriodTo,
      exceptionDates: promoTrip?.promo?.exceptionDates,
    }));

    setTripPromos(mappedPromos);
  }, [trip?.promoTrips]);

  useEffect(() => {
    if (activePromos.length <= 1) {
      setCurrentPromoIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % activePromos.length);
    }, 1800);

    return () => clearInterval(interval);
  }, [activePromos]);

  const discountPercent = React.useMemo(() => {
    if (!trip?.promoPrice) return 0;

    const discount = ((trip?.price - trip?.promoPrice) / trip?.price) * 100;
    return Math.max(0, Math.round(discount));
  }, [trip]);

  const availableDateStrings = useMemo(() => {
    return trip?.availableDates?.map((item) => {
      const date = new Date(item.date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    });
  }, [trip]);

  const formatTripDateRange = (startDate: string, tripDays?: number): string => {
    if (!tripDays) return "";

    const start = new Date(startDate);
    const end = new Date(startDate);
    end.setDate(start.getDate() + (tripDays - 1));

    const weekday = start.toLocaleDateString("id-ID", {
      weekday: "short",
    });

    const startDay = start.getDate();
    const endDay = end.getDate();

    const monthYear = end.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });

    return `${weekday}, ${startDay} - ${endDay} ${monthYear} • ${tripDays} Hari`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isPastDate = (year: number, month: number, day: number) => {
    const today = new Date();
    const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const target = new Date(year, month, day); // month 0-based
    return target < current;
  };

  const isTargetDateAvailable = (y: number, m: number, d: number) => {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowMidnight = new Date(todayMidnight);
    tomorrowMidnight.setDate(todayMidnight.getDate() + 1);

    const targetDate = new Date(y, m, d);

    // 1. Disable today and past dates
    if (targetDate <= todayMidnight) {
      return false;
    }

    // 2. Disable tomorrow's date if today is after 15:00
    if (targetDate.getTime() === tomorrowMidnight.getTime()) {
      if (now.getHours() >= 15) {
        return false;
      }
    }

    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    // 3. Trip Guarantee mode check
    if (isGuaranteeMode) {
      // H+2 Minimum Date for Guarantee Trips (Private Trip)
      if (isTooSoonFromToday(y, m, d, 2)) return false;

      const isBlackedOut = trip?.blackoutDates?.some((bd) => {
        return dayjs(bd.date).format("YYYY-MM-DD") === dateStr;
      });
      if (isBlackedOut) return false;

      return true; // Enable all other future dates
    }

    // 4. Must be in availableDates (Normal Mode)
    return availableDateStrings?.includes(dateStr);
  };

  const isDateAvailable = (day: number) => {
    return isTargetDateAvailable(currentMonth.getFullYear(), currentMonth.getMonth(), day);
  };

  const getSeasonalData = (dateObj: Date) => {
    if (!isGuaranteeMode) return null;
    return trip?.seasonalPrices?.find((sp) => {
      const date = dayjs(dateObj);
      const start = dayjs(sp.startDate);
      const end = dayjs(sp.endDate);
      return (
        (date.isSame(start, "day") || date.isAfter(start, "day")) &&
        (date.isSame(end, "day") || date.isBefore(end, "day"))
      );
    });
  };

  const getDateData = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return trip?.availableDates?.find((item) => {
      const itemDate = new Date(item.date);
      const itemDateStr = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, "0")}-${String(itemDate.getDate()).padStart(2, "0")}`;
      return itemDateStr === dateStr;
    });
  };

  const handleDateClick = (day: number) => {
    const dateData = getDateData(day);
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    if (isGuaranteeMode) {
      const finalPrice = dateData?.price ?? trip?.promoPrice ?? trip?.price ?? 0;

      const virtualDate: PreviewDate = {
        id: dateData?.id ?? 0,
        date: dateStr,
        price: finalPrice,
        minimum: dateData?.minimum ?? 1,
        quota: dateData?.quota ?? 100,
        remaining: dateData?.remaining ?? 100,
        status: dateData?.status ?? "OPEN",
        isGuarantee: true,
      };

      setPreviewDate(virtualDate);
      onSelectedTripDate(virtualDate);
      setIsFullSlot(dateData ? dateData.remaining === 0 || dateData.status?.toUpperCase() === "FULL" : false);
      setIsCalendarExpanded(false);
      return;
    }

    if (dateData) {
      setIsFullSlot(dateData?.remaining === 0 || dateData?.status?.toUpperCase() === "FULL");
      const finalPrice = dateData?.price ?? trip?.promoPrice ?? trip?.price ?? 0;

      // Normalize date to YYYY-MM-DD for UI comparison
      const normalizedDate = dayjs(dateData.date).format("YYYY-MM-DD");

      setPreviewDate({
        ...dateData,
        date: normalizedDate,
        price: finalPrice,
      });

      onSelectedTripDate(dateData);
      setIsCalendarExpanded(false);
    }
  };

  const monthNames = [
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
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  // Generate available years from available dates
  const availableYears = useMemo(() => {
    const years = trip?.availableDates?.map((item) => new Date(item.date).getFullYear()) || [];

    if (trip?.isTripGuarantee && isGuaranteeMode) {
      const currentYear = new Date().getFullYear();
      years.push(currentYear);
      years.push(currentYear + 1);
    }

    return [...new Set(years)].sort((a, b) => a - b);
  }, [trip, isGuaranteeMode]);

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex));
    setShowMonthPicker(false);
  };

  const handleYearSelect = (year: number) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth()));
    setShowYearPicker(false);
  };

  const isBeforeMinDate = (year: number, month: number, day: number, minOffset: number = 2) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minDate = new Date(today);
    minDate.setDate(today.getDate() + minOffset);

    const targetDate = new Date(year, month, day);
    targetDate.setHours(0, 0, 0, 0);

    return targetDate < minDate;
  };

  const isTooSoonFromToday = (year: number, month: number, day: number, minDays: number = 2) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(year, month, day);
    targetDate.setHours(0, 0, 0, 0);

    const diffInDays = (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    return diffInDays >= 0 && diffInDays < minDays;
  };

  const handleSelectTrip = (slug: string, previewDate: any) => {
    if (previewDate) {
      const formattedDate = dayjs(previewDate.date).format("YYYY-MM-DD");
      const prefKey = `booking-pref-${slug}-${formattedDate}`;
      const prefData = {
        paxCount,
        childCount,
        paymentScheme,
        customDpAmount: paymentScheme === "DP" ? customDpAmount : "",
      };
      localStorage.setItem(prefKey, JSON.stringify(prefData));
    }

    if (!isAuth) {
      setOpenLoginModal(true);
      return;
    }

    setIsSelectedLoading(true);

    const useDateOnly = isGuaranteeMode;
    const idParam = previewDate.id && !useDateOnly ? `availableDateId=${previewDate.id}` : "";
    const dateParam = !previewDate.id || useDateOnly ? `date=${previewDate.date}` : "";
    const query = [idParam, dateParam].filter(Boolean).join("&");

    router.push(`${baseUrl}/${slug}/booking?${query}`);
    return;
  };

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

  // Find the closest valid date for preview
  const getClosestDate = (): PreviewDate | null => {
    if (trip?.availableDates && trip.availableDates.length > 0) {
      const validDates = trip.availableDates
        .map((item) => {
          const itemDate = new Date(item.date);
          return {
            ...item,
            parsedDate: itemDate,
          };
        })
        .filter((item) => {
          const year = item.parsedDate.getFullYear();
          const month = item.parsedDate.getMonth();
          const day = item.parsedDate.getDate();
          return isTargetDateAvailable(year, month, day);
        });

      if (validDates.length > 0) {
        if (initialSelectedDate) {
          const match = validDates.find((d) => dayjs(d.date).format("YYYY-MM-DD") === initialSelectedDate);
          if (match) {
            return {
              id: match.id,
              date: dayjs(match.date).format("YYYY-MM-DD"),
              price: match.price ?? trip?.promoPrice ?? trip?.price ?? 0,
              minimum: match.minimum,
              quota: match.quota,
              remaining: match.remaining,
              status: match.status,
              isGuarantee: isGuaranteeMode || match.isGuarantee,
            };
          }
        }

        // Prioritize available (non-full) dates
        const availableDates = validDates.filter((d) => d.remaining > 0 && d.status?.toUpperCase() !== "FULL");
        const datesToUse = availableDates.length > 0 ? availableDates : validDates;
        datesToUse.sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

        const closest = datesToUse[0];
        const finalPrice = closest.price ?? trip?.promoPrice ?? trip?.price ?? 0;
        const normalizedDate = dayjs(closest.date).format("YYYY-MM-DD");

        return {
          id: closest.id,
          date: normalizedDate,
          price: finalPrice,
          minimum: closest.minimum,
          quota: closest.quota,
          remaining: closest.remaining,
          status: closest.status,
          isGuarantee: isGuaranteeMode || closest.isGuarantee,
        };
      }
    }

    if (trip?.isTripGuarantee && isGuaranteeMode) {
      const today = new Date();
      let candidate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);

      for (let i = 0; i < 365; i++) {
        const year = candidate.getFullYear();
        const month = candidate.getMonth();
        const day = candidate.getDate();
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const isBlackedOut = trip.blackoutDates?.some((bd) => {
          return dayjs(bd.date).format("YYYY-MM-DD") === dateStr;
        });

        if (!isBlackedOut) {
          const finalPrice = trip?.promoPrice ?? trip?.price ?? 0;
          return {
            id: 0,
            date: dateStr,
            price: finalPrice,
            minimum: 1,
            quota: 100,
            remaining: 100,
            status: "OPEN",
            isGuarantee: true,
          };
        }

        candidate.setDate(candidate.getDate() + 1);
      }
    }

    return null;
  };

  const [lastSelectedKey, setLastSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!trip) return;

    const currentKey = `${trip.id}-${isGuaranteeMode}`;
    if (currentKey !== lastSelectedKey) {
      setLastSelectedKey(currentKey);

      const closest = getClosestDate();
      if (closest) {
        setPreviewDate(closest);
        onSelectedTripDate(closest);
        setIsFullSlot(closest.remaining === 0 || closest.status?.toUpperCase() === "FULL");

        const [closestYear, closestMonth, closestDay] = closest.date.split("-").map(Number);
        setCurrentMonth(new Date(closestYear, closestMonth - 1, closestDay));
      }
    }
  }, [trip, isGuaranteeMode, lastSelectedKey]);

  // Mobile specific states and handlers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isClosingDrawer, setIsClosingDrawer] = useState(false);
  const [mobileSelectedDate, setMobileSelectedDate] = useState<PreviewDate | null>(null);

  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosingModal(false);
    }, 280);
  };

  const handleCloseDrawer = () => {
    setIsClosingDrawer(true);
    setTimeout(() => {
      setIsDrawerOpen(false);
      setIsClosingDrawer(false);
      setMobileSelectedDate(null);
    }, 280);
  };

  // Lock body scroll when mobile calendar modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const upcomingDates = useMemo(() => {
    if (!trip?.availableDates) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return trip.availableDates
      .filter((d) => {
        const dateObj = new Date(d.date);
        dateObj.setHours(0, 0, 0, 0);
        return dateObj >= today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [trip?.availableDates]);

  const nearestDates = useMemo(() => {
    return upcomingDates.slice(0, 3);
  }, [upcomingDates]);

  const monthsToRender = useMemo(() => {
    const start = new Date();

    // Find the latest trip date year
    let maxYear = start.getFullYear();

    if (upcomingDates.length > 0) {
      const lastTripDate = new Date(upcomingDates[upcomingDates.length - 1].date);
      if (lastTripDate.getFullYear() > maxYear) {
        maxYear = lastTripDate.getFullYear();
      }
    }

    // End target is December of maxYear
    const end = new Date(maxYear, 11, 1);

    const list = [];
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    const targetEnd = new Date(end.getFullYear(), end.getMonth(), 1);

    while (current <= targetEnd) {
      list.push({ year: current.getFullYear(), month: current.getMonth() });
      current.setMonth(current.getMonth() + 1);
    }

    return list;
  }, [upcomingDates]);

  const isMobileDateAvailable = (y: number, m: number, d: number) => {
    return isTargetDateAvailable(y, m, d);
  };

  const getDateDataForMobile = (y: number, m: number, d: number) => {
    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return trip?.availableDates?.find((item) => {
      const itemDate = new Date(item.date);
      const itemDateStr = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, "0")}-${String(itemDate.getDate()).padStart(2, "0")}`;
      return itemDateStr === dateStr;
    });
  };

  const getGuaranteePriceForDate = (dateStr: string) => {
    const seasonal = getSeasonalData(new Date(dateStr));
    if (seasonal) {
      if ((seasonal?.tiers ?? [])?.length > 0) {
        const sortedSeasonalTiers = [...(seasonal.tiers ?? [])].sort((a, b) => a.price - b.price);
        return sortedSeasonalTiers[0].price;
      }
      return seasonal.price ?? trip?.guaranteeTiers?.[0]?.price ?? trip?.price ?? 0;
    }

    if ((trip?.guaranteeTiers ?? []).length > 0) {
      const sortedByPax = [...trip!.guaranteeTiers].sort((a, b) => a.pax - b.pax);
      return sortedByPax[0].price;
    }

    return trip?.price ?? 0;
  };

  const getGuaranteeDateDataForMobile = (y: number, m: number, d: number) => {
    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dateData = getDateDataForMobile(y, m, d);
    const finalPrice = getGuaranteePriceForDate(dateStr);
    return {
      id: dateData?.id ?? 0,
      date: dateStr,
      price: finalPrice,
      minimum: dateData?.minimum ?? 1,
      quota: dateData?.quota ?? 100,
      remaining: dateData?.remaining ?? 100,
      status: dateData?.status ?? "OPEN",
      isGuarantee: true,
    } as PreviewDate;
  };

  const getBlackoutReason = (y: number, m: number, d: number) => {
    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const bo = trip?.blackoutDates?.find((bd) => dayjs(bd.date).format("YYYY-MM-DD") === dateStr);
    return bo?.reason || null;
  };

  const handleMobileDateClick = (dateData: any) => {
    const finalPrice = dateData.price ?? trip?.promoPrice ?? trip?.price ?? 0;
    const normalizedDate = dayjs(dateData.date).format("YYYY-MM-DD");

    const selectedObj = {
      ...dateData,
      date: normalizedDate,
      price: finalPrice,
    } as PreviewDate;

    setMobileSelectedDate(selectedObj);
    setIsDrawerOpen(true);
  };

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

  const formatIndonesianDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const monthNamesFull = [
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
    return `${d.getDate()} ${monthNamesFull[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatPriceShort = (price: number | null) => {
    if (price === null) return "";
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1).replace(".0", "")}jt`;
    }
    if (price >= 1000) {
      return `${Math.round(price / 1000)}rb`;
    }
    return price.toString();
  };

  const dayNamesMobile = ["M", "S", "S", "R", "K", "J", "S"];

  const displayPricePerPax = useMemo(() => {
    if (!previewDate) return trip?.promoPrice ?? trip?.price ?? 0;

    // Try to get from summaryData first
    const tripSummary = summaryData?.item_details?.find((i: any) => i.id?.toString().startsWith("trip-"));
    if (tripSummary) {
      return tripSummary.price;
    }

    // Local fallback calculation if summaryData is not yet loaded
    if (previewDate.isGuarantee) {
      const seasonal = getSeasonalData(new Date(previewDate.date));
      const seasonalTiers = seasonal?.tiers;
      if (seasonal && seasonalTiers && seasonalTiers.length > 0) {
        const sortedSeasonalTiers = [...seasonalTiers].sort((a, b) => b.pax - a.pax);
        const matchedSeasonalTier = sortedSeasonalTiers.find((t) => paxCount >= t.pax);
        if (matchedSeasonalTier) {
          return Number(matchedSeasonalTier.price);
        }
        return Number(sortedSeasonalTiers[sortedSeasonalTiers.length - 1].price);
      }

      if ((trip?.guaranteeTiers ?? []).length > 0) {
        const sortedTiers = [...trip!.guaranteeTiers].sort((a, b) => b.pax - a.pax);
        const matchedTier = sortedTiers.find((t) => paxCount >= t.pax);
        if (matchedTier) {
          return Number(matchedTier.price);
        }
        return Number(sortedTiers[sortedTiers.length - 1].price);
      }
    }

    return previewDate.price ?? trip?.promoPrice ?? trip?.price ?? 0;
  }, [previewDate, trip, summaryData, paxCount]);

  const adultUnitPrice = useMemo(() => {
    if (!previewDate) return trip?.promoPrice ?? trip?.price ?? 0;
    const adultItem = summaryData?.item_details?.find(
      (i: any) => i.id?.toString().startsWith("trip-") && !i.id?.toString().endsWith("-child"),
    );
    if (adultItem) return adultItem.price;

    return displayPricePerPax;
  }, [previewDate, trip, summaryData, displayPricePerPax]);

  const childUnitPrice = useMemo(() => {
    const childItem = summaryData?.item_details?.find((i: any) => i.id?.toString().endsWith("-child"));
    if (childItem) return childItem.price;

    return Math.round(adultUnitPrice * 0.5);
  }, [summaryData, adultUnitPrice]);

  const isDpValid =
    !trip?.dpMinimumAmount ||
    (Number(customDpAmount) >= Number(trip.dpMinimumAmount) * totalPax &&
      Number(customDpAmount) < (summaryData?.totalAmount ?? displayPricePerPax * totalPax));

  return (
    <>
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 overflow-hidden w-full max-w-lg mx-auto lg:max-w-none relative">
        {/* Card Header Area */}
        <div className="p-6 border-b border-slate-100 bg-[#fcfcfd]">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                {previewDate ? "Harga Per Pax" : "Mulai Dari"}
              </div>
              <div className="flex items-baseline gap-1 flex-wrap">
                {isSummaryLoading && previewDate ? (
                  <div className="h-8 w-28 bg-gray-200 animate-pulse rounded-lg mt-1" />
                ) : (
                  <span className="text-3xl font-extrabold text-gray-900">{formatRupiah(displayPricePerPax)}</span>
                )}
                <span className="text-xs font-semibold text-gray-500 ml-1">/ pax</span>

                {/* Selected Date info */}
                {previewDate && (
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-0.5 ml-1.5 inline-flex items-center gap-1 shrink-0">
                    <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
                    {dayjs(previewDate.date).format("DD MMM YYYY")}
                  </span>
                )}

                {/* Duration info */}
                {(trip?.duration || trip?.days) && (
                  <span className="text-xs font-bold text-gray-500 bg-gray-100/70 border border-gray-200/50 rounded-lg px-2.5 py-0.5 inline-flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3 text-gray-400" />
                    {trip?.duration ||
                      `${trip?.days} Hari ${trip?.days && trip.days > 1 ? `${trip.days - 1} Malam` : ""}`}
                  </span>
                )}
              </div>
            </div>

            {/* Promo coret price */}
            {!previewDate && trip?.promoPrice !== null && trip?.promoPrice !== 0 && (
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-400 line-through">
                  {formatRupiah(trip?.price ?? 0)}
                </span>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md mt-1">
                  Hemat {discountPercent}%
                </span>
              </div>
            )}

            {previewDate &&
              !trip?.isTripGuarantee &&
              trip?.promoPrice !== null &&
              trip?.promoPrice !== 0 &&
              previewDate.price === trip?.promoPrice && (
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-400 line-through">
                    {formatRupiah(trip?.price ?? 0)}
                  </span>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md mt-1">
                    Hemat {discountPercent}%
                  </span>
                </div>
              )}
          </div>

          {/* Status Badge & Copy Schedule */}
          <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
            {isGuaranteeMode ? (
              <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-orange-100">
                <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                Harga Dinamis per Group
              </span>
            ) : (
              <button
                type="button"
                onClick={onCopy}
                className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 transition-colors cursor-pointer outline-none"
              >
                <Copy className="w-3.5 h-3.5" />
                Salin Jadwal
              </button>
            )}
          </div>
        </div>{" "}
        {/* Form / Calendar & Options Area */}
        <div className="p-5 md:p-6 bg-slate-50/40 space-y-3 -mt-10">
          {/* Calendar Accordion Wrapper */}
          <div className="flex flex-col w-full">
            {/* Accordion Trigger */}
            <button
              type="button"
              onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors shadow-sm select-none w-full text-left outline-none"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Tanggal Keberangkatan
                  </span>
                  <span className="text-sm font-extrabold text-gray-800">
                    {previewDate ? dayjs(previewDate.date).format("dddd, DD MMM YYYY") : "Pilih Tanggal Keberangkatan"}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={clsx(
                  "w-5 h-5 text-gray-400 transition-transform duration-300",
                  isCalendarExpanded ? "rotate-180" : "rotate-0",
                )}
              />
            </button>

            {/* Calendar Box */}
            <div
              className={clsx(
                "bg-white rounded-2xl transition-all duration-300 overflow-hidden",
                isCalendarExpanded
                  ? "border border-gray-200 shadow-sm p-4 md:p-5 mt-2 max-h-[800px] opacity-100"
                  : "border-0 shadow-none p-0 mt-0 max-h-0 opacity-0 pointer-events-none",
              )}
            >
              {/* Calendar Header with Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={previousMonth}
                  className="p-1.5 hover:bg-gray-200 bg-gray-100 border border-gray-100 rounded-lg transition-colors cursor-pointer outline-none"
                >
                  <svg
                    className="w-5 h-5 rotate-180 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="flex items-center gap-1">
                  {/* Month Selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMonthPicker(!showMonthPicker);
                        setShowYearPicker(false);
                      }}
                      className="font-bold text-sm md:text-base text-gray-800 hover:bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200/60 transition-colors cursor-pointer outline-none"
                    >
                      {monthNames[month]}
                    </button>

                    {showMonthPicker && (
                      <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-gray-200 p-2.5 z-40 w-56">
                        <div className="grid grid-cols-3 gap-1.5">
                          {monthNames.map((monthName, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleMonthSelect(index)}
                              className={clsx(
                                "px-2 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border-none outline-none",
                                index === month
                                  ? "bg-orange-500 text-white shadow-md"
                                  : "hover:bg-orange-50 text-gray-700 bg-transparent",
                              )}
                            >
                              {monthName.substring(0, 3)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Year Selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowYearPicker(!showYearPicker);
                        setShowMonthPicker(false);
                      }}
                      className="font-bold text-sm md:text-base text-gray-800 hover:bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200/60 transition-colors cursor-pointer outline-none"
                    >
                      {year}
                    </button>

                    {showYearPicker && (
                      <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-40 w-36">
                        <div className="max-h-40 overflow-y-auto space-y-0.5">
                          {availableYears.map((yearOption) => (
                            <button
                              key={yearOption}
                              type="button"
                              onClick={() => handleYearSelect(yearOption)}
                              className={clsx(
                                "w-full px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border-none outline-none",
                                yearOption === year
                                  ? "bg-orange-500 text-white shadow-md"
                                  : "hover:bg-orange-50 text-gray-700 bg-transparent",
                              )}
                            >
                              {yearOption}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1.5 hover:bg-gray-100 bg-gray-50 border border-gray-100 rounded-lg transition-colors cursor-pointer outline-none"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day Names Row */}
                {dayNames.map((day, index) => (
                  <div
                    key={day}
                    className={`text-center text-[11px] font-bold py-1.5 ${index === 0 ? "text-red-500" : "text-gray-500"}`}
                  >
                    <span className="hidden sm:inline">{day}</span>
                    <span className="inline sm:hidden">{dayNamesMobile[index]}</span>
                  </div>
                ))}

                {/* Empty padding cells */}
                {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}

                {/* Calendar Days */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const dObj = new Date(year, month, day);
                  const isSun = dObj.getDay() === 0;
                  const selectable = isDateAvailable(day);
                  const dateData = selectable ? getDateData(day) : null;
                  const isFull = dateData
                    ? dateData.remaining === 0 || dateData.status?.toUpperCase() === "FULL"
                    : false;
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isSelected = previewDate && previewDate.date === dateStr;

                  const promoIndexes = tripPromos
                    .map((promo, pIdx) => (isPromoActive(dObj, promo) ? pIdx : -1))
                    .filter((pIdx) => pIdx !== -1);

                  return (
                    <div key={day} className="aspect-square">
                      <button
                        type="button"
                        onClick={() => selectable && !isFull && handleDateClick(day)}
                        disabled={!selectable || isFull}
                        className={clsx(
                          "w-full h-full rounded-xl transition-all duration-200 relative border flex items-center justify-center text-xs md:text-sm font-bold outline-none",
                          {
                            // Selected state
                            "bg-blue-600 border-blue-600 text-white shadow-md scale-105 z-10":
                              selectable && isSelected && !isFull,
                            // Normal available state
                            "bg-blue-50/40 border-blue-100/60 hover:border-blue-300 text-blue-700 cursor-pointer":
                              selectable && !isSelected && !isFull && !isSun,
                            "bg-red-50/30 border-red-100/40 hover:border-red-300 text-red-600 cursor-pointer":
                              selectable && !isSelected && !isFull && isSun,
                            // Full slots state
                            "bg-gray-150 border-gray-200 text-gray-400 cursor-not-allowed opacity-50":
                              selectable && isFull,
                            // Disabled state
                            "border-transparent text-gray-300 cursor-not-allowed opacity-40 bg-transparent":
                              !selectable,
                          },
                        )}
                      >
                        {day}

                        {/* Promo dots indicator */}
                        <div className="absolute bottom-1 flex items-center gap-x-0.5">
                          {promoIndexes.map((promoIdx) => (
                            <span
                              key={promoIdx}
                              className={`rounded-full size-1 ${PROMO_DOT_COLORS[promoIdx % PROMO_DOT_COLORS.length]}`}
                            />
                          ))}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Promo Legend */}
              {tripPromos.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-[10px] text-gray-500">
                  {tripPromos.map((promo, idx) => (
                    <div key={promo.id ?? idx} className="flex items-center gap-1.5">
                      <span className={`rounded-full size-1.5 ${PROMO_DOT_COLORS[idx % PROMO_DOT_COLORS.length]}`} />
                      <span className="truncate">{promo?.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pax Input and Booking Breakdown (Only shown when date is selected) */}
          {previewDate ? (
            <div className="space-y-4 animate-fade-in">
              {/* S&K Promo Link */}
              {!trip?.isTripGuarantee && tripPromos.length > 0 && (
                <Link
                  href="/promo"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 border border-blue-200 bg-blue-50/30 hover:bg-blue-50 text-blue-600 rounded-xl transition-all duration-200 text-xs font-bold no-underline"
                >
                  <CircleAlert size={14} />
                  <span>Cek Syarat & Ketentuan Promo</span>
                </Link>
              )}

              {/* REDESIGNED: Dewasa & Anak side-by-side */}
              <div className="grid grid-cols-2 border border-gray-200/80 rounded-2xl bg-white divide-x divide-gray-100 shadow-sm overflow-hidden">
                {/* Pax Input: Dewasa (Adults) */}
                <div className="px-4 py-3 flex flex-col justify-between min-h-[92px] text-left">
                  <div>
                    <label className="block text-[14px] font-bold uppercase leading-none mb-0.5">Dewasa</label>
                    <span className="block text-[11px] text-gray-400 leading-none">
                      {">"} 2 tahun
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <span className="font-extrabold text-gray-900 text-xs truncate">{paxCount} Orang</span>

                    {/* Adult Counter Buttons */}
                    <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5 border border-gray-100 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          // Cannot remove the last adult if children are present
                          if (paxCount <= 1 && childCount > 0) return;
                          setPaxCount((prev) => Math.max(minPax, prev - 1));
                        }}
                        disabled={paxCount <= minPax || (paxCount <= 1 && childCount > 0)}
                        className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-sm text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all outline-none cursor-pointer disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaxCount((prev) => Math.min(maxPax, prev + 1))}
                        disabled={paxCount >= maxPax}
                        className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-sm text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all outline-none cursor-pointer disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {paxCount >= maxPax && <p className="text-red-500 text-[10px] md:text-xs font-semibold">Kuota sudah maksimal</p>}
                </div>

                {/* Pax Input: Anak-anak (Children) */}
                <div className="px-4 py-3 flex flex-col justify-between min-h-[92px] text-left">
                  <div>
                    <label className="block text-[14px] font-bold uppercase leading-none mb-0.5">Anak</label>
                    <span className="block text-[11px] text-gray-400 leading-none">
                      ≤ 2 tahun • 50%
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <span className="font-extrabold text-gray-900 text-xs truncate">{childCount} Anak</span>

                    {/* Child Counter Buttons */}
                    <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5 border border-gray-100 shrink-0">
                      <button
                        type="button"
                        onClick={() => setChildCount?.((prev) => Math.max(0, prev - 1))}
                        disabled={childCount <= 0}
                        className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-sm text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all outline-none cursor-pointer disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        onClick={() => setChildCount?.((prev) => Math.min(2, prev + 1))}
                        disabled={childCount >= 2 || paxCount === 0}
                        className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-sm text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all outline-none cursor-pointer disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {/* CHILD rules info */}
                  {/* <div className="mt-1 space-y-0.5">
                    <p className="text-[9px] text-gray-400 leading-tight">Maks. <span className="font-semibold">2 anak</span> • tidak kurangi kuota</p>
                    <p className="text-[9px] text-gray-400 leading-tight">Wajib ada min. <span className="font-semibold">1 dewasa</span></p>
                  </div> */}
                  {/* {childCount >= 2 && (
                    <p className="text-[9px] text-amber-600 font-semibold mt-0.5">Batas maks. anak tercapai</p>
                  )} */}
                </div>
              </div>

              {/* Payment Scheme Selection */}
              {isSummaryLoading ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="h-3 w-28 bg-gray-200 animate-pulse rounded-md" />
                  <div className="h-9 w-full bg-gray-100 animate-pulse rounded-xl" />
                </div>
              ) : (
                isDpEligible && (
                  <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm space-y-3 text-left">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pilihan Pembayaran</p>
                    <div className="bg-gray-100 p-1 rounded-xl flex gap-1 text-xs font-bold shadow-inner">
                      <button
                        type="button"
                        onClick={() => setPaymentScheme("FULL")}
                        className={clsx(
                          "flex-1 py-2.5 rounded-lg transition-all cursor-pointer border-none outline-none select-none",
                          paymentScheme === "FULL"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700 bg-transparent",
                        )}
                      >
                        Bayar Penuh
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentScheme("DP")}
                        className={clsx(
                          "flex-1 py-2.5 rounded-lg transition-all cursor-pointer border-none outline-none select-none",
                          paymentScheme === "DP"
                            ? "bg-white text-orange-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700 bg-transparent",
                        )}
                      >
                        Bayar DP
                      </button>
                    </div>

                    {paymentScheme === "DP" && (
                      <div className="pt-2 space-y-3 border-t border-dashed border-gray-100">
                        <div>
                          <p className="text-xs font-bold text-gray-700">Nominal Uang Muka (DP)</p>
                          <p className="text-[10px] text-gray-455 mt-0.5 leading-relaxed">
                            Sisa tagihan otomatis jadi pelunasan berikutnya.
                          </p>
                        </div>

                        {/* Input Nominal DP */}
                        <div className="relative flex items-center w-full rounded-xl border border-gray-250 bg-gray-50/50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                          <span className="px-3 py-2 bg-gray-100/80 text-gray-500 text-xs font-bold border-r border-gray-200">
                            Rp
                          </span>
                          <input
                            type="text"
                            value={customDpAmount ? Number(customDpAmount).toLocaleString("id-ID") : ""}
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(/\D/g, "");
                              setCustomDpAmount(rawValue);
                            }}
                            className="flex-1 px-3 py-2 text-xs text-blue-600 font-extrabold outline-none bg-white"
                            placeholder="Masukkan nominal DP"
                          />
                        </div>

                        {/* Validasi DP */}
                        {trip?.dpMinimumAmount && Number(customDpAmount) < Number(trip.dpMinimumAmount) * totalPax && (
                          <p className="text-[10px] font-bold text-red-500">
                            Minimum DP adalah {formatRupiah(Number(trip.dpMinimumAmount) * totalPax)}
                          </p>
                        )}
                        {Number(customDpAmount) >= (summaryData?.totalAmount ?? displayPricePerPax * totalPax) && (
                          <p className="text-[10px] font-bold text-red-500">DP harus kurang dari total harga booking</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              )}

              {/* Pricing Breakdown Summary */}
              {isSummaryLoading ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3.5">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-32 bg-gray-200 animate-pulse rounded-md" />
                    <div className="h-4 w-24 bg-gray-200 animate-pulse rounded-md" />
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-t border-dashed border-gray-100">
                    <div className="h-5 w-28 bg-gray-200 animate-pulse rounded-md" />
                    <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-md" />
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm space-y-2.5">
                  {/* Detailed Pax Price Breakdown */}
                  <div className="space-y-1.5 pb-2 border-b border-dashed border-gray-100">
                    <div className="flex justify-between items-center text-xs text-gray-600 font-medium">
                      <span>Dewasa ({paxCount} pax × {formatRupiah(adultUnitPrice)})</span>
                      <span className="font-semibold text-gray-800">{formatRupiah(adultUnitPrice * paxCount)}</span>
                    </div>
                    {childCount > 0 && (
                      <div className="flex justify-between items-center text-xs text-gray-600 font-medium">
                        <span>Anak ({childCount} pax × {formatRupiah(childUnitPrice)})</span>
                        <span className="font-semibold text-gray-800">{formatRupiah(childUnitPrice * childCount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 font-semibold">
                    <span>Total Biaya ({totalPax} pax)</span>
                    <span>{formatRupiah(summaryData?.totalAmount ?? (adultUnitPrice * paxCount + childUnitPrice * childCount))}</span>
                  </div>

                  {paymentScheme === "DP" && (
                    <>
                      <div className="flex justify-between items-center text-xs text-gray-500 font-semibold">
                        <span>Uang Muka (DP)</span>
                        <span className="text-orange-600 font-bold">{formatRupiah(Number(customDpAmount) || 0)}</span>
                      </div>
                      {Number(customDpAmount) < (summaryData?.totalAmount ?? displayPricePerPax * totalPax) && (
                        <div className="flex justify-between items-center text-xs text-gray-500 font-semibold">
                          <span>Sisa Pelunasan (H-{trip?.dpRepaymentDaysBefore ?? 7})</span>
                          <span>
                            {formatRupiah(
                              Math.max(
                                0,
                                (summaryData?.totalAmount ?? displayPricePerPax * totalPax) -
                                (Number(customDpAmount) || 0),
                              ),
                            )}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex justify-between items-center py-2.5 border-t border-dashed border-gray-100">
                    <span className="text-sm font-bold text-gray-800">
                      {paymentScheme === "DP" ? "Bayar Sekarang (DP)" : "Total Pembayaran"}
                    </span>
                    <span
                      className={clsx(
                        "font-extrabold text-xl",
                        paymentScheme === "DP" ? "text-orange-600" : "text-blue-600",
                      )}
                    >
                      {formatRupiah(
                        paymentScheme === "DP"
                          ? Number(customDpAmount) || 0
                          : (summaryData?.totalAmount ?? displayPricePerPax * totalPax),
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200/80 border-dashed rounded-2xl p-6 text-center shadow-sm">
              <CalendarDays className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Langkah Pertama</p>
              <p className="text-sm text-gray-600 mt-1">Silakan klik tanggal keberangkatan pada kalender di atas</p>
            </div>
          )}

          {/* Booking CTA Button */}
          <button
            onClick={() => {
              if (!trip?.slug || !previewDate) return;
              handleSelectTrip(trip.slug, previewDate);
            }}
            disabled={
              !previewDate ||
              isFullSlot ||
              isSelectedLoading ||
              isSummaryLoading ||
              (paymentScheme === "DP" && !isDpValid)
            }
            className="w-full cursor-pointer bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center gap-2 disabled:cursor-not-allowed text-sm md:text-base"
          >
            {isSelectedLoading ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Memproses...</span>
              </div>
            ) : !previewDate ? (
              <span>Pilih Tanggal Dahulu</span>
            ) : isFullSlot ? (
              <span>Tanggal Sudah Penuh</span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Pesan Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Login Modal - rendered via portal */}
      {openLoginModal && (
        <LoginModal
          onClose={() => setOpenLoginModal(false)}
          redirectTo={`${baseUrl}/${trip?.slug}/booking?${previewDate?.id ? `availableDateId=${previewDate.id}` : `date=${previewDate?.date}`}`}
        />
      )}
    </>
  );
}
