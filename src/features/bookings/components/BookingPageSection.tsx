/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState, use, useMemo } from "react";
import {
  User,
  Contact,
  Package,
  Wallet,
  Plus,
  Trash2,
  Users,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Minus,
  Coins,
  Info,
  RefreshCw,
  CreditCard,
  CheckCircle,
  CircleAlert,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { useTrip } from "@/features/trips/hooks/useTrips";
import { AvailableDates, Trip } from "@/features/trips/api/trip-api";
import dayjs from "dayjs";
import { formatRupiah } from "@/lib/format-rupiah";
import { useRouter, useSearchParams } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useProfileQuery, useUpdateProfile } from "@/features/profile/hooks/useProfile";
import { FinalBookingModal } from "./FinalBookingModal";
import { PaymentMethodModal } from "./PaymentMethodModal";
import { useBookingSummary, useCreateBooking } from "@/features/bookings/hooks/useBooking";
import { SpinnerLoading } from "@/components/sections/SpinnerLoading";
import { ApplicablePromosResponse } from "@/features/promos/api/promo-api";
import { Gender } from "@/features/profile/api/profile-api";
import { UserVoucher } from "@/features/vouchers/api/voucher-api";
import HeaderPlain from "@/components/layout/HeaderPlain";
import { parseBookingError } from "@/lib/api/error-handler";
import { ApplicablePromo } from "@/components/sections/PromoSection";
import PendingBookingLimitModal, { PendingBookingItem } from "@/components/ui/PendingBookingLimitModal";

export interface NormalizedAdditionals {
  additionalId: number;
  name: string;
  unit: string;
  basePrice: number;
  price: number;
  promoPrice: number | null;
  isRequired: boolean;
}

export interface AdditionalQuantity {
  name: string;
  additionalId: number;
  quantity: number;
  price: number;
}

interface PaymentMethod {
  id: string;
  label: string;
  image: string;
}

interface BookingPageSectionProps {
  tripType: "private" | "open";
  params: Promise<{ slug: string }>;
}

export default function BookingPageSection({ tripType, params }: BookingPageSectionProps) {
  const { data: authUser } = useProfileQuery();
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const availableDateId = searchParams.get("availableDateId");
  const dateFromQuery = searchParams.get("date");
  const { data: trip, isLoading } = useTrip(slug);
  const createBookingMutation = useCreateBooking(trip?.id);
  const imageSrc = trip?.images?.[0]?.images?.[0];
  const meetingPoints = trip?.destinations?.[0]?.destinationMeetingPoints?.filter((mp) => mp?.isActive);
  const [selectedAvailableDate, setSelectedAvailableDate] = useState<AvailableDates | null>(null);
  const [isBookerAsParticipant, setIsBookerAsParticipant] = useState(false);
  const [hasAdditionals, setHasAdditionals] = useState<NormalizedAdditionals[]>([]);
  const [additionalQuantities, setAdditionalQuantities] = useState<AdditionalQuantity[]>([]);
  const [paymentMethodModal, setPaymentMethodModal] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedPaymentScheme, setSelectedPaymentScheme] = useState<"FULL" | "DP">("FULL");
  const [customDpInput, setCustomDpInput] = useState<string>("");

  const [finalSelectedPromo, setFinalSelectedPromo] = useState<ApplicablePromosResponse | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<UserVoucher | null>(null);
  const [finalBookingModal, setFinalBookingModal] = useState<boolean>(false);
  const isRestoredRef = useRef<boolean>(false);
  const isSubmittingRef = useRef<boolean>(false);
  const STORAGE_KEY = `booking-form-${slug}-${availableDateId || dateFromQuery || "no-date"}`;
  const updateProfileMutation = useUpdateProfile();
  const [shouldUpdateProfile, setShouldUpdateProfile] = useState(false);
  const [trySubmit, setTrySubmit] = useState<boolean>(false);
  const [pendingLimitModal, setPendingLimitModal] = useState(false);
  const [pendingBookings, setPendingBookings] = useState<PendingBookingItem[]>([]);

  const defaultPrices = [
    {
      id: "default-adult",
      customerType: "ADULT",
      price: trip?.promoPrice ?? trip?.price ?? 0,
    },
    {
      id: "default-child",
      customerType: "CHILD",
      price: null,
    },
    {
      id: "default-foreign",
      customerType: "FOREIGN",
      price: null,
    },
    {
      id: "default-foreign-child",
      customerType: "FOREIGNCHILD",
      price: null,
    },
  ];

  const getSeasonalData = (dateStr: string) => {
    if (!trip?.isTripGuarantee || !dateStr) return null;
    return trip.seasonalPrices?.find((sp) => {
      const date = dayjs(dateStr);
      const start = dayjs(sp.startDate);
      const end = dayjs(sp.endDate);
      return (
        (date.isSame(start, "day") || date.isAfter(start, "day")) &&
        (date.isSame(end, "day") || date.isBefore(end, "day"))
      );
    });
  };

  const getEffectivePrice = (dateStr: string, slotCount: number) => {
    if (!trip) return 0;

    // 1. Check for seasonal override first (for guarantee)
    if (trip.isTripGuarantee) {
      const seasonal = getSeasonalData(dateStr);
      if (seasonal) {
        if ((seasonal.tiers ?? [])?.length > 0) {
          const sortedSeasonalTiers = [...(seasonal.tiers ?? [])].sort((a, b) => b.pax - a.pax);
          const matchedSeasonalTier = sortedSeasonalTiers.find((t) => slotCount >= t.pax);
          if (matchedSeasonalTier) return matchedSeasonalTier.price;
          // Fallback to lowest pax tier
          return sortedSeasonalTiers[sortedSeasonalTiers.length - 1].price;
        }
      }

      // 2. Fallback to tiered pricing
      if (trip.guaranteeTiers?.length > 0) {
        const sortedTiers = [...trip.guaranteeTiers].sort((a, b) => b.pax - a.pax);
        const matchedTier = sortedTiers.find((t) => slotCount >= t.pax);
        if (matchedTier) return matchedTier.price;
      }
    }

    // 3. Fallback to default pricing
    return trip.promoPrice ?? trip.price;
  };

  const tripPrices = defaultPrices.map((defaultItem) => {
    const backendItem = trip?.tripPrices?.find((item) => item.customerType === defaultItem.customerType);

    return backendItem
      ? {
        ...defaultItem,
        ...backendItem,
        price:
          backendItem.price ?? (defaultItem.customerType === "ADULT" ? (trip?.promoPrice ?? trip?.price ?? 0) : null),
      }
      : defaultItem;
  });

  const emptyParticipant = () => ({
    name: "",
    noKtp: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    email: "",
    customerType: "ADULT",
    label: "participant",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    getValues,
    setValue,
    reset,
    trigger,
    clearErrors,
  } = useForm({
    shouldUnregister: false,
    mode: "onChange",
    defaultValues: {
      booker: {
        name: "",
        email: "",
        phone: "",
        noKtp: "",
        dateOfBirth: "",
        gender: "",
        meetingPoint: "",
        label: "pic",
      },
      participants: tripType === "private" ? [emptyParticipant(), emptyParticipant()] : [emptyParticipant()],
    },
  });

  const participantsValue = useWatch({
    control,
    name: "participants",
  });

  const bookerValue = useWatch({
    control,
    name: "booker",
  });

  const hasInitializedRef = useRef(false);
  const lastSlotsRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trip || !selectedAvailableDate) return;
    const formattedDate = dayjs(selectedAvailableDate.date).format("YYYY-MM-DD");
    const prefKey = `booking-pref-${slug}-${formattedDate}`;
    const savedPrefStr = localStorage.getItem(prefKey);
    let expectedPax = 1;
    let expectedChildCount = 0;
    let savedPaymentScheme: "FULL" | "DP" = "FULL";
    let savedCustomDpAmount = "";

    if (savedPrefStr) {
      try {
        const savedPref = JSON.parse(savedPrefStr);
        expectedPax = Number(savedPref.paxCount) || 1;
        expectedChildCount = Number(savedPref.childCount) || 0;
        savedPaymentScheme = savedPref.paymentScheme || "FULL";
        savedCustomDpAmount = savedPref.customDpAmount || "";
      } catch (e) {
        console.error(e);
      }
    }

    const totalExpectedSlots = expectedPax + expectedChildCount;
    const currentSlots = participantsValue?.length || 1;

    // 1. Initial Load: Wait until expected pax is loaded
    if (!hasInitializedRef.current) {
      if (currentSlots !== totalExpectedSlots) {
        return;
      }
      setSelectedPaymentScheme(savedPaymentScheme);
      if (savedPaymentScheme === "DP" && savedCustomDpAmount) {
        setCustomDpInput(savedCustomDpAmount);
      } else if (trip?.dpMinimumAmount) {
        setCustomDpInput(String(Number(trip.dpMinimumAmount) * currentSlots));
      } else {
        setCustomDpInput("");
      }
      lastSlotsRef.current = currentSlots;
      hasInitializedRef.current = true;
      return;
    }

    // 2. Subsequent runs: Only recalculate if slots count has actually changed!
    if (lastSlotsRef.current !== null && lastSlotsRef.current !== currentSlots) {
      if (trip?.dpMinimumAmount) {
        setCustomDpInput(String(Number(trip.dpMinimumAmount) * currentSlots));
      } else {
        setCustomDpInput("");
      }
      lastSlotsRef.current = currentSlots;
    }
  }, [trip, selectedAvailableDate, participantsValue?.length]);

  // AUTO-SAVE CHANGES TO LOCALSTORAGE
  useEffect(() => {
    if (!hasInitializedRef.current || !selectedAvailableDate || !trip) return;

    const formattedDate = dayjs(selectedAvailableDate.date).format("YYYY-MM-DD");
    const prefKey = `booking-pref-${slug}-${formattedDate}`;

    const prefData = {
      paxCount: participantsValue?.length || 1,
      paymentScheme: selectedPaymentScheme,
      customDpAmount: selectedPaymentScheme === "DP" ? customDpInput : "",
    };

    localStorage.setItem(prefKey, JSON.stringify(prefData));
  }, [participantsValue?.length, selectedPaymentScheme, customDpInput, selectedAvailableDate, trip]);

  const {
    fields: participants,
    replace,
    update,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "participants",
  });

  useEffect(() => {
    if (!trip || !selectedAvailableDate) return;
    const formattedDate = dayjs(selectedAvailableDate.date).format("YYYY-MM-DD");
    const prefKey = `booking-pref-${slug}-${formattedDate}`;
    const savedPrefStr = localStorage.getItem(prefKey);
    let expectedPax = 1;
    let expectedChildCount = 0;
    if (savedPrefStr) {
      try {
        const savedPref = JSON.parse(savedPrefStr);
        if (savedPref.paxCount) {
          expectedPax = Number(savedPref.paxCount);
        }
        if (savedPref.childCount) {
          expectedChildCount = Number(savedPref.childCount);
        }
      } catch (e) {
        console.error(e);
      }
    }

    const totalExpected = expectedPax + expectedChildCount;
    const currentParticipants = getValues("participants") || [];
    if (currentParticipants.length !== totalExpected) {
      const newParticipants = [
        ...Array.from({ length: expectedPax }, (_, i) => {
          return (
            currentParticipants.find((p: any, idx: number) => p.customerType === "ADULT" && idx === i) || {
              ...emptyParticipant(),
              customerType: "ADULT",
            }
          );
        }),
        ...Array.from({ length: expectedChildCount }, () => {
          return { ...emptyParticipant(), customerType: "CHILD" };
        }),
      ];
      replace(newParticipants);
    }
  }, [trip, selectedAvailableDate, isRestoredRef.current]);

  // Protect Params availableDate
  useEffect(() => {
    if (!trip) return;

    const basePath = tripType === "private" ? "private-trip" : "trip";

    if (!availableDateId && !dateFromQuery) {
      router.replace(`/${basePath}/${trip.slug}`);
      return;
    }

    let foundDate: any = null;

    if (availableDateId) {
      const parsedId = Number(availableDateId);
      if (!Number.isNaN(parsedId)) {
        foundDate = trip?.availableDates?.find((d) => d?.id === parsedId);
      }
    }

    // If no specific date found but it's a Trip Guarantee or Private Trip and we have a date query
    if (!foundDate && (trip?.isTripGuarantee || tripType === "private") && dateFromQuery) {
      foundDate = {
        id: null,
        date: dateFromQuery,
        quota: null,
        remaining: null,
        minimum: 1,
        price: trip.price,
        status: "pending",
        isGuarantee: tripType === "private",
      };
    }

    if (!foundDate) {
      router.replace(`/${basePath}/${trip.slug}`);
      return;
    }

    // 🔥 VALIDASI TANGGAL
    const today = new Date();
    const tripDate = new Date(foundDate.date);

    // reset jam biar fair compare
    today.setHours(0, 0, 0, 0);
    tripDate.setHours(0, 0, 0, 0);

    if (tripDate < today) {
      // ❌ tanggal sudah lewat → redirect
      router.replace(`/${basePath}/${trip.slug}`);
      return;
    }

    if (selectedAvailableDate?.id === foundDate?.id && selectedAvailableDate?.date === foundDate?.date) return;

    setSelectedAvailableDate({
      ...foundDate,
      price: foundDate?.price ?? trip?.promoPrice ?? trip?.price,
    });
  }, [availableDateId, trip, searchParams, tripType]);

  const formValues = watch();

  useEffect(() => {
    if (!isRestoredRef.current) return;
    if (isSubmittingRef.current) return;
    if (!trip || !selectedAvailableDate) return;

    const payload = {
      formValues,
      selectedAvailableDate,
      isBookerAsParticipant,
      additionalQuantities,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [formValues, selectedAvailableDate, isBookerAsParticipant, additionalQuantities]);

  useEffect(() => {
    if (!trip || (!availableDateId && !dateFromQuery) || isRestoredRef.current) return;

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (parsed.formValues) {
          reset(parsed.formValues);
        }

        setSelectedAvailableDate(parsed.selectedAvailableDate ?? null);
        setIsBookerAsParticipant(parsed.isBookerAsParticipant ?? false);
        setAdditionalQuantities(parsed.additionalQuantities ?? []);
      } catch (err) {
        console.error("Failed to restore booking data", err);
      }
    }

    isRestoredRef.current = true;
  }, [trip, availableDateId, dateFromQuery]);

  useEffect(() => {
    if (!authUser) return;

    setValue("booker.name", authUser?.name ?? "");
    setValue("booker.email", authUser?.email ?? "");
    setValue("booker.phone", authUser?.phone ?? "");
    setValue("booker.noKtp", authUser?.noKtp ?? "");
    setValue("booker.dateOfBirth", authUser?.dateOfBirth ? dayjs(authUser?.dateOfBirth).format("YYYY-MM-DD") : "");
    setValue("booker.gender", authUser?.gender ?? "");
  }, [authUser]);

  const toggleBookerAsParticipant = async () => {
    if (!isBookerAsParticipant) {
      const isValid = await trigger("booker");
      if (!isValid) {
        toast.error("Data pemesan belum lengkap");
        return;
      }

      const currentParticipants = participantsValue ?? [];
      const firstParticipantFilled = currentParticipants[0]?.name?.trim() !== "";

      if (firstParticipantFilled) {
        const bookerAsParticipant = {
          ...bookerValue,
          customerType: "ADULT",
          label: "pic",
          isOpen: true,
        };
        setValue("participants", [bookerAsParticipant, ...currentParticipants]);
        clearErrors();
      } else {
        setValue("participants.0", {
          ...bookerValue,
          customerType: "ADULT",
          label: "pic",
        });
        clearErrors();
      }

      setIsBookerAsParticipant(true);
      return;
    }

    setValue("participants.0", emptyParticipant());
    clearErrors();
    setIsBookerAsParticipant(false);
  };

  useEffect(() => {
    if (!isBookerAsParticipant) return;

    setValue("participants.0.name", bookerValue.name);
    setValue("participants.0.noKtp", bookerValue.noKtp);
    setValue("participants.0.dateOfBirth", bookerValue.dateOfBirth);
    setValue("participants.0.gender", bookerValue.gender);
    setValue("participants.0.phone", bookerValue.phone);
    setValue("participants.0.email", bookerValue.email);
  }, [bookerValue, isBookerAsParticipant]);

  const addParticipant = () => {
    if (tripType === "private" && participants?.length >= 15) {
      toast.error("Maksimal 15 peserta untuk Private Trip");
      return;
    }
    append({
      name: "",
      noKtp: "",
      dateOfBirth: "",
      gender: "",
      phone: "",
      email: "",
      customerType: "ADULT",
      label: "participant",
    });
    toast.success("Tambah peserta success");
  };

  const removeParticipant = (index: number) => {
    if (participants?.length <= 1) return;
    remove(index);
    toast.success("Hapus peserta success");
  };

  const removeLastParticipant = () => {
    if (participants?.length <= 1) return;
    remove(participants?.length - 1);
    toast.success("Hapus peserta success");
  };

  const normalizeAdditionals = (trip: Trip) => {
    const tripAdditionals = trip?.additionals || [];
    if (tripAdditionals.length === 0) return [];
    const destination = trip?.destinations?.[0];
    if (!destination) return [];

    const infoMap = new Map(destination?.additionals?.map((a) => [a?.id, { name: a?.name, unit: a?.unit }]));
    const priceMap = new Map(
      destination?.additional_prices?.map((p) => [
        p?.additionalId,
        {
          basePrice: p?.basePrice,
          price: p?.price,
          promoPrice: p?.promoPrice,
        },
      ]),
    );

    return tripAdditionals.map((item) => {
      const info = infoMap.get(item?.additionalId);
      const prices = priceMap.get(item?.additionalId);
      return {
        additionalId: item?.additionalId,
        name: info?.name || "Unknown",
        unit: info?.unit || "-",
        basePrice: prices?.basePrice ?? 0,
        price: prices?.price ?? 0,
        promoPrice: prices?.promoPrice ?? null,
        isRequired: item?.isRequired ?? false,
      };
    });
  };

  useEffect(() => {
    if (trip) {
      const normalized = normalizeAdditionals(trip);
      setHasAdditionals(normalized);
    }
  }, [trip]);

  useEffect(() => {
    if (!hasAdditionals?.length) return;

    setAdditionalQuantities((prev) => {
      return hasAdditionals.map((item) => {
        const existing = prev.find((p) => p?.additionalId === item?.additionalId);
        const isRequired = item?.isRequired;
        const maxParticipant = participantsValue?.length;

        return {
          name: item?.name,
          additionalId: item?.additionalId,
          quantity: isRequired ? maxParticipant : Math.min(existing?.quantity ?? 0, maxParticipant),
          price: item?.promoPrice ?? item.price,
        };
      });
    });
  }, [hasAdditionals, participantsValue.length]);

  const handleIncreaseAdditional = (id: number) => {
    setAdditionalQuantities((prev) =>
      prev.map((item) => (item?.additionalId === id ? { ...item, quantity: item?.quantity + 1 } : item)),
    );
  };

  const handleDecreaseAdditional = (id: number, isRequired: boolean) => {
    setAdditionalQuantities((prev) =>
      prev.map((item) => {
        if (item?.additionalId !== id) return item;
        if (isRequired && item?.quantity <= 1) return item;
        if (!isRequired && item?.quantity <= 0) return item;
        return { ...item, quantity: item?.quantity - 1 };
      }),
    );
  };

  useEffect(() => {
    setAdditionalQuantities((prev) =>
      prev.map((item) => {
        const max = participantsValue?.length;
        if (item?.quantity > max) {
          return { ...item, quantity: max };
        }
        return item;
      }),
    );
  }, [participantsValue.length]);

  const isParticipantComplete = (p: any) => {
    return true; // Participants are now completed later
  };

  const handleSelectPromo = (promo: ApplicablePromosResponse | null) => {
    setFinalSelectedPromo(promo);
    if (promo) setSelectedVoucher(null);
  };

  const handleSelectVoucher = (voucher: UserVoucher | null) => {
    setSelectedVoucher(voucher);
    if (voucher) setFinalSelectedPromo(null);
  };

  const confirmBooking = (data: any) => {
    const hasIncomplete = data.participants.some((p: any) => !isParticipantComplete(p));
    setTrySubmit(true);

    if (hasIncomplete) {
      toast.error("Lengkapi semua data peserta");
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error("Silahkan pilih metode pembayaran");
      return;
    }

    setFinalBookingModal(true);
  };

  const onSubmit = async (data: any, paymentWindow?: Window | null) => {
    const formData = Object.keys(data || {}).length > 0 ? data : getValues();

    // Ensure the first participant has the latest booker data if they are participating
    const finalParticipants = [...(formData?.participants || [])];
    if (isBookerAsParticipant && finalParticipants.length > 0) {
      finalParticipants[0] = {
        ...finalParticipants[0],
        ...formData.booker,
        customerType: "ADULT",
        label: "pic",
      };
    }

    const hasIncomplete = finalParticipants?.some((p: any) => !isParticipantComplete(p));

    if (hasIncomplete) {
      if (paymentWindow) paymentWindow.close();
      toast.error("Lengkapi semua data peserta");
      return;
    }

    isSubmittingRef.current = true;
    try {
      const isPrivateOnly = tripType === "private" || selectedAvailableDate?.isGuarantee;
      const finalPaymentScheme = (isPrivateOnly || (summaryData && !summaryData.dpEligible)) ? "FULL" : selectedPaymentScheme;

      const payload = {
        userId: authUser?.id,
        tripDateId: selectedAvailableDate?.id,
        date: selectedAvailableDate?.id ? undefined : selectedAvailableDate?.date,
        sourceId: 7,
        promoId: finalSelectedPromo?.id ?? undefined,
        voucherId: selectedVoucher?.id ?? undefined,
        paymentMethod: selectedPaymentMethod?.id.toUpperCase(),
        slots: finalParticipants?.length,
        participants: finalParticipants,
        personInCharge: formData.booker,
        meetingPoint: finalParticipants
          .map((p: any) => (p?.meetingPoint ? Number(p?.meetingPoint) : null))
          .filter(Boolean) as number[],
        additional_order: additionalQuantities.filter((item) => item?.quantity > 0),
        paymentScheme: finalPaymentScheme,
        customDpAmount: finalPaymentScheme === "DP" ? Number(customDpInput) || undefined : undefined,
      };

      const res: any = await createBookingMutation.mutateAsync(payload);

      if (shouldUpdateProfile && authUser) {
        const updatePayload = {
          name: formData.booker.name || null,
          phone: formData.booker.phone || null,
          noKtp: formData.booker.noKtp || null,
          dateOfBirth: formData.booker.dateOfBirth || null,
          gender: (formData.booker.gender || null) as Gender | null,
          photo: authUser?.photo || null,
        };
        try {
          await updateProfileMutation.mutateAsync(updatePayload);
        } catch (profileError) {
          console.error("Failed to update profile after booking success", profileError);
        }
      }

      if (selectedAvailableDate) {
        const formattedDate = dayjs(selectedAvailableDate.date).format("YYYY-MM-DD");
        const prefKey = `booking-pref-${slug}-${formattedDate}`;
        localStorage.removeItem(prefKey);
      }
      localStorage.removeItem(STORAGE_KEY);

      const invoiceUrl = res?.payment?.invoice_url || res?.invoiceUrl || res?.paymentUrl;
      const createdBookingId = res?.id || res?.bookingId || res?.booking?.id;

      toast.success("Booking success, silahkan melakukan pembayaran");

      if (invoiceUrl && paymentWindow) {
        paymentWindow.location.href = invoiceUrl;
      } else if (paymentWindow) {
        paymentWindow.close();
      }

      if (createdBookingId) {
        router.push(`/booking/${createdBookingId}`);
      } else {
        router.push("/profile");
      }
    } catch (error: any) {
      if (paymentWindow) paymentWindow.close();
      const parsedError = parseBookingError(error);
      console.error(`[Booking Submit Error] Code: ${parsedError.code}`, error);

      // Show dedicated modal for booking limit reached
      if (parsedError.code === "BOOKING_LIMIT_REACHED" && error.response?.data?.pendingBookings) {
        setPendingBookings(error.response.data.pendingBookings);
        setPendingLimitModal(true);
      } else {
        toast.error(parsedError.message);
      }
    }
  };

  useEffect(() => {
    if (finalBookingModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [finalBookingModal]);

  const bookingData = {
    selectedAvailableDate,
    participants: participantsValue.map((participant) => {
      const selectedMeetingPoint = meetingPoints?.find(
        (mp) => Number(mp.id) === Number((participant as any).meetingPoint),
      );

      return {
        ...participant,
        meetingPoint: selectedMeetingPoint
          ? {
            time: selectedMeetingPoint.time,
            location: selectedMeetingPoint.meetingPoint?.location,
          }
          : null,
      };
    }),
    paymentMethod: selectedPaymentMethod?.id.toUpperCase(),
    paymentScheme: selectedPaymentScheme,
    customDpAmount: selectedPaymentScheme === "DP" ? Number(customDpInput) : undefined,
  };

  const summaryPayload = useMemo(() => {
    if (
      !trip?.id ||
      (!selectedAvailableDate?.id && !selectedAvailableDate?.date) ||
      !participantsValue ||
      participantsValue?.length < 1
    )
      return null;
    return {
      userId: authUser?.id,
      sourceId: 7,
      tripId: trip?.id,
      tripDateId: selectedAvailableDate?.id,
      date: selectedAvailableDate?.id ? undefined : selectedAvailableDate?.date,
      slots: participantsValue?.length,
      participants: participantsValue.map((p) => ({
        customerType: p.customerType,
      })),
      promoId: finalSelectedPromo?.id,
      voucherId: selectedVoucher?.id,
      additional_order: additionalQuantities?.filter((item) => item?.quantity > 0),
      paymentScheme: selectedPaymentScheme,
      customDpAmount: selectedPaymentScheme === "DP" ? Number(customDpInput) || undefined : undefined,
    };
  }, [
    trip,
    selectedAvailableDate,
    participantsValue,
    finalSelectedPromo?.id,
    selectedVoucher?.id,
    additionalQuantities,
    authUser?.id,
    selectedPaymentScheme,
    customDpInput,
  ]);

  const {
    data: remoteSummaryData,
    isLoading: remoteSummaryLoading,
    isFetching: remoteSummaryFetching,
    isError: remoteIsError,
  } = useBookingSummary(summaryPayload);

  const summaryData = remoteSummaryData;
  const summaryLoading = remoteSummaryLoading || remoteSummaryFetching;

  useEffect(() => {
    const isPrivateOnly = tripType === "private" || selectedAvailableDate?.isGuarantee;
    if (isPrivateOnly || (summaryData && !summaryData.dpEligible)) {
      if (selectedPaymentScheme !== "FULL") {
        setSelectedPaymentScheme("FULL");
      }
    }
  }, [summaryData?.dpEligible, selectedPaymentScheme, selectedAvailableDate?.isGuarantee, tripType]);
  const isError = remoteIsError;
  const tripSummaries = summaryData?.item_details?.filter((i: any) => i.id.startsWith("trip-"));
  const promoSummary = summaryData?.item_details?.find(
    (i: any) => i.id.startsWith("promo-") || i.id.startsWith("voucher-"),
  );
  const cashbackSummary = summaryData?.item_details?.find((i: any) => i.id.startsWith("cashback-"));
  const additionalSummary = summaryData?.item_details?.filter((i: any) => i.id.startsWith("additional-"));
  const adminFeeSummary = summaryData?.item_details?.find((i: any) => i.id.startsWith("admin-fee-"));
  const totalPrice = summaryData?.totalAmount ?? 0;
  const discountValue = summaryData?.discountValue ?? 0;
  const adultCount = (participantsValue || []).filter((p: any) => p.customerType !== "CHILD").length || 1;
  const currentAdultCount = (participantsValue || []).filter((p: any) => p.customerType !== "CHILD").length;
  const currentChildCount = (participantsValue || []).filter((p: any) => p.customerType === "CHILD").length;
  const adultUnitPrice =
    summaryData?.item_details?.find((i: any) => i.id === `trip-${trip?.id}`)?.price ??
    getEffectivePrice(selectedAvailableDate?.date || "", adultCount);
  const childUnitPrice =
    summaryData?.item_details?.find((i: any) => i.id === `trip-${trip?.id}-child`)?.price ??
    Math.round(adultUnitPrice * 0.5);

  // CHILD participants do NOT consume quota slots.
  // For adults: check against remaining quota using adult-only count.
  // For private trips: overall 15-pax cap applies to all participants.
  const isMaxParticipantReached =
    tripType === "private"
      ? (participantsValue?.length || 0) >= 15
      : selectedAvailableDate?.remaining != null
        ? currentAdultCount >= selectedAvailableDate.remaining
        : false;

  const isMaxChildReached = currentChildCount >= 2;

  if (isLoading) return <SpinnerLoading />;

  return (
    <>
      <HeaderPlain bookingKey={STORAGE_KEY} />
      <section className="px-5">
        <div className="max-w-[1024px] 2xl:max-w-[1440px] mx-auto my-5">
          <Link
            href={`/${tripType === "private" ? "private-trip" : "trip"}/${trip?.slug}`}
            onClick={() => {
              if (selectedAvailableDate) {
                const formattedDate = dayjs(selectedAvailableDate.date).format("YYYY-MM-DD");
                const prefKey = `booking-pref-${slug}-${formattedDate}`;
                localStorage.removeItem(prefKey);
              }
              localStorage.removeItem(STORAGE_KEY);
            }}
            className="inline-flex mb-3 items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold">Kembali ke detail trip</span>
          </Link>

          {/* CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* LEFT SIDE - FORMS */}
            <div className="lg:col-span-7 2xl:col-span-8 space-y-5">
              <div className="bg-yellow-200/50 text-yellow-500 p-3 rounded-md flex items-center gap-x-1">
                <ShieldCheck size={30} className="shrink-0" />
                <p className="text-xs md:text-base font-medium">
                  Data pribadimu dienkripsi dan hanya digunakan untuk keperluan pemesanan tiket, manifest perjalanan,
                  dan asuransi
                </p>
              </div>
              {/* 1. DATA PEMESAN */}
              <div className="ring-2 ring-gray-200 shadow-lg rounded-lg p-4 md:p-6 bg-white">
                <div className="flex items-center gap-3 mb-5">
                  <div className="bg-slate-100 p-2 rounded-full">
                    <Contact className="w-5 h-5 text-slate-700" />
                  </div>
                  <h2 className="font-bold text-lg md:text-xl text-gray-900">1. Data Pemesan</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Masukkan nama lengkap"
                        className={`w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base ring-2 rounded-lg focus:ring-blue-500 focus:border-transparent outline-none transition ${errors?.booker?.name ? "ring-red-500" : "ring-gray-300"}`}
                        {...register("booker.name", {
                          required: "Nama pemesan wajib diisi",
                        })}
                      />
                      <p className="text-xs ml-1 mt-1 text-gray-500">Pastikan sesuai dengan KTP</p>
                      {errors?.booker?.name && (
                        <span className="text-red-500 mt-1 ml-2 text-xs">
                          {errors?.booker?.name?.message as string}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
                        Nomor KTP/KIA/Passport <span className="text-gray-400 font-normal">(Opsional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="16 digit nomor KTP"
                        maxLength={16}
                        className={`w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base ring-2 rounded-lg focus:ring-blue-500 focus:border-transparent outline-none transition ${errors?.booker?.noKtp ? "ring-red-500" : "ring-gray-300"}`}
                        {...register("booker.noKtp", {
                          onChange: (e) => {
                            e.target.value = e.target.value.replace(/\D/g, "");
                          },
                          minLength: {
                            value: 16,
                            message: "Nomor KTP harus 16 digit",
                          },
                          maxLength: {
                            value: 16,
                            message: "Nomor KTP harus 16 digit",
                          },
                        })}
                      />
                      <p className="text-xs ml-1 mt-1  text-gray-500">
                        Diperuntukkan bagi keperluan pihak asuransi perjalanan.
                      </p>
                      {errors?.booker?.noKtp && (
                        <span className="text-red-500 mt-1 ml-2 text-xs">
                          {errors?.booker?.noKtp?.message as string}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
                        Tanggal Lahir <span className="text-gray-400 font-normal">(Opsional)</span>
                      </label>
                      <input
                        type="date"
                        className={`w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base ring-2 rounded-lg focus:ring-blue-500 focus:border-transparent outline-none transition ${errors?.booker?.dateOfBirth ? "ring-red-500" : "ring-gray-300"}`}
                        {...register("booker.dateOfBirth")}
                      />
                      {errors?.booker?.dateOfBirth && (
                        <span className="text-red-500 mt-1 ml-2 text-xs">
                          {errors?.booker?.dateOfBirth?.message as string}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
                        Jenis Kelamin <span className="text-gray-400 font-normal">(Opsional)</span>
                      </label>
                      <select
                        {...register("booker.gender")}
                        className={`w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base ring-2 rounded-lg focus:ring-blue-500 focus:border-transparent outline-none transition ${errors?.booker?.gender ? "ring-red-500" : "ring-gray-300"}`}
                      >
                        <option value="">Pilih jenis kelamin</option>
                        <option value="Male">Laki-laki</option>
                        <option value="Female">Perempuan</option>
                      </select>
                      {errors?.booker?.gender && (
                        <span className="text-red-500 mt-1 ml-2 text-xs">
                          {errors?.booker?.gender?.message as string}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
                        No. Telepon <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        maxLength={13}
                        {...register("booker.phone", {
                          required: "Nomor Handphone pemesan wajib diisi",
                          onChange: (e) => {
                            e.target.value = e.target.value.replace(/\D/g, "").slice(0, 13);
                          },
                          minLength: {
                            value: 10,
                            message: "Nomor handphone minimal 10 digit",
                          },
                          maxLength: {
                            value: 13,
                            message: "Nomor handphone maksimal 13 digit",
                          },
                          pattern: {
                            value: /^08[0-9]{8,11}$/,
                            message: "Format nomor handphone tidak valid",
                          },
                        })}
                        className={`w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base ring-2 rounded-lg focus:ring-blue-500 focus:border-transparent outline-none transition ${errors?.booker?.phone ? "ring-red-500" : "ring-gray-300"}`}
                      />
                      {errors?.booker?.phone && (
                        <span className="text-red-500 mt-1 ml-2 text-xs">
                          {errors?.booker?.phone?.message as string}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-400 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        // readOnly
                        placeholder="email@example.com"
                        {...register("booker.email", {
                          required: "Email pemesan wajib diisi",
                        })}
                        className={`w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base read-only:text-gray-400 ring-2 rounded-lg focus:ring-blue-500 focus:border-transparent outline-none transition read-only:cursor-not-allowed ${errors?.booker?.email ? "ring-red-500" : "ring-gray-300"}`}
                      />
                      {errors?.booker?.email && (
                        <span className="text-red-500 mt-1 ml-2 text-xs">
                          {errors?.booker?.email?.message as string}
                        </span>
                      )}
                    </div>
                  </div>

                  {isBookerAsParticipant && meetingPoints && meetingPoints.length > 0 && (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
                          Meeting Point (Titik Kumpul) <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register("booker.meetingPoint", {
                            required: "Meeting Point wajib dipilih",
                          })}
                          className={`w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base ring-2 rounded-lg focus:ring-blue-500 focus:border-transparent outline-none transition ${errors?.booker?.meetingPoint ? "ring-red-500" : "ring-gray-300"}`}
                        >
                          <option value="">Pilih titik kumpul keberangkatan</option>
                          {meetingPoints.map((mp: any) => (
                            <option key={mp.id} value={mp.id}>
                              {mp.time ? `${mp.time} - ` : ""}
                              {mp.meetingPoint?.location || mp.location}
                            </option>
                          ))}
                        </select>
                        {errors?.booker?.meetingPoint && (
                          <span className="text-red-500 mt-1 ml-2 text-xs">
                            {errors?.booker?.meetingPoint?.message as string}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* NOTES: Update Profile is not relevant anymore */}
                  {/* <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <button
                      type="button"
                      onClick={() => setShouldUpdateProfile(!shouldUpdateProfile)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${shouldUpdateProfile ? "bg-blue-600" : "bg-gray-300"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${shouldUpdateProfile ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Update profil saya dengan data ini</p>
                      <p className="text-xs text-gray-600">Data pemesan akan otomatis menyimpan ke profil Anda</p>
                    </div>
                  </div> */}

                  <div className="mt-5 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={toggleBookerAsParticipant}
                      className={`flex items-center gap-3 w-full p-3 rounded-lg border-2 transition cursor-pointer ${isBookerAsParticipant ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white hover:border-blue-300"}`}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${isBookerAsParticipant ? "bg-blue-500 border-blue-500" : "border-gray-400"}`}
                      >
                        {isBookerAsParticipant && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm md:text-base font-semibold text-gray-700">
                        Pemesan ikut sebagai peserta
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. PESERTA & FASILITAS TAMBAHAN */}
              <div className="ring-2 ring-gray-200 shadow-lg rounded-lg p-4 md:p-6 bg-white mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-slate-100 p-2 rounded-full">
                    <Package className="w-5 h-5 text-slate-700" />
                  </div>
                  <h2 className="font-bold text-lg md:text-xl text-gray-900">2. Peserta & Fasilitas Tambahan</h2>
                </div>

                {/* INFO  */}
                <div className="bg-red-100/50 p-3 rounded-md flex justify-start gap-3 mb-6">
                  <i>
                    <CircleAlert className="text-red-500 size-4 md:size-5 mt-0.5" />
                  </i>
                  <p className=" text-red-500 text-xs md:text-base">
                    <span className="text-[12px] md:text-base font-semibold md:font-bold text-red-600">Penting:</span> Kelengkapan data peserta dapat
                    dilengkapi di menu riwayat pemesanan setelah proses pembayaran berhasil dilakukan
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-gray-900">Jumlah Peserta</p>
                      {tripType === "open" && selectedAvailableDate?.remaining !== undefined && (
                        <div>
                          {selectedAvailableDate?.remaining < 5 ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500">
                              <span className="size-1.5 rounded-full bg-red-400 animate-pulse" />
                              Hanya tersisa {selectedAvailableDate?.remaining} slot
                            </span>
                          ) : participants?.length === selectedAvailableDate?.remaining ? (
                            <span className="text-red-600 text-xs md:text-sm">
                              Trip ini hanya tersisa {selectedAvailableDate?.remaining} slot
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Dewasa */}
                    <div className="border border-gray-200 rounded-lg p-4 w-full flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm md:text-base">Dewasa (WNI)</p>
                        <p className="font-bold text-gray-900 text-sm mt-0.5">{formatRupiah(adultUnitPrice)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const currentAdults = (participantsValue || []).filter(
                              (p: any) => p.customerType === "ADULT",
                            );
                            const currentChildren = (participantsValue || []).filter(
                              (p: any) => p.customerType === "CHILD",
                            );
                            // Cannot remove adult if it would leave children without any adult
                            if (currentAdults.length <= 1 && currentChildren.length > 0) {
                              toast.error("Peserta anak-anak membutuhkan minimal 1 peserta dewasa.");
                              return;
                            }
                            if (currentAdults.length > (isBookerAsParticipant ? 1 : 0)) {
                              const picIndex = currentAdults.findIndex((p: any) => p.label === "pic");
                              if (picIndex !== -1 && currentAdults.length === 1) return;
                              for (let i = currentAdults.length - 1; i >= 0; i--) {
                                if (currentAdults[i].label !== "pic") {
                                  currentAdults.splice(i, 1);
                                  break;
                                }
                              }
                              setValue("participants", [...currentAdults, ...currentChildren]);
                            }
                          }}
                          disabled={(participantsValue?.length || 0) <= 1}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-blue-400 text-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:border-gray-200 disabled:text-gray-400 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-4 text-center font-semibold text-gray-900">
                          {(participantsValue || []).filter((p: any) => p.customerType === "ADULT").length}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newParticipant = {
                              name: "",
                              noKtp: "",
                              dateOfBirth: "",
                              gender: "",
                              phone: "",
                              email: "",
                              customerType: "ADULT",
                              label: "participant",
                            };
                            setValue("participants", [...(participantsValue || []), newParticipant]);
                          }}
                          disabled={isMaxParticipantReached}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-blue-400 text-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:border-gray-200 disabled:text-gray-400 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Anak-anak */}
                    <div className="border border-gray-200 rounded-lg p-4 w-full flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm md:text-base">Anak - Anak (≤ 2 Tahun)</p>
                          <p className="font-bold text-gray-900 text-sm mt-0.5">
                            {formatRupiah(childUnitPrice)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              const currentAdults = (participantsValue || []).filter(
                                (p: any) => p.customerType === "ADULT",
                              );
                              const currentChildren = (participantsValue || []).filter(
                                (p: any) => p.customerType === "CHILD",
                              );
                              if (currentChildren.length > 0) {
                                currentChildren.pop();
                                setValue("participants", [...currentAdults, ...currentChildren]);
                              }
                            }}
                            disabled={
                              (participantsValue || []).filter((p: any) => p.customerType === "CHILD").length === 0
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-blue-400 text-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:border-gray-200 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="w-4 text-center font-semibold text-gray-900">
                            {(participantsValue || []).filter((p: any) => p.customerType === "CHILD").length}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (isMaxChildReached) {
                                toast.error("Maksimal 2 peserta anak-anak dalam satu booking.");
                                return;
                              }
                              if (currentAdultCount === 0) {
                                toast.error("Tambahkan minimal 1 peserta dewasa sebelum menambahkan peserta anak-anak.");
                                return;
                              }
                              const newParticipant = {
                                name: "",
                                noKtp: "",
                                dateOfBirth: "",
                                gender: "",
                                phone: "",
                                email: "",
                                customerType: "CHILD",
                                label: "participant",
                              };
                              setValue("participants", [...(participantsValue || []), newParticipant]);
                            }}
                            disabled={isMaxChildReached || isMaxParticipantReached || currentAdultCount === 0}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-blue-400 text-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:border-gray-200 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      {/* CHILD rules info */}
                      {/* <div className="text-xs text-gray-400 space-y-0.5">
                        <p>• Maks. <span className="font-semibold text-gray-500">2 anak</span> per booking &mdash; tidak mengurangi kuota slot.</p>
                        <p>• Wajib disertai minimal <span className="font-semibold text-gray-500">1 peserta dewasa</span>.</p>
                      </div>
                      {isMaxChildReached && (
                        <p className="text-xs font-semibold text-amber-600">Batas maksimal anak-anak sudah tercapai (maks. 2).</p>
                      )} */}
                    </div>
                  </div>
                </div>

                {/* Additionals */}
                <div className="border-t border-gray-100 pt-6">
                  {/* Header */}
                  <div className="mb-4">
                    <p className="font-semibold text-gray-900 mb-0.5">Tambahan (Opsional)</p>
                  </div>

                  {/* List */}
                  {hasAdditionals.length === 0 ? (
                    <div className="flex items-center gap-2  text-gray-400">
                      <Info className="size-4 shrink-0" strokeWidth={2} />
                      <p className="text-sm">Destinasi tidak memiliki additionals</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {hasAdditionals.map((item) => {
                        const quantity =
                          additionalQuantities.find((q) => q?.additionalId === item?.additionalId)?.quantity ?? 0;
                        const isDisabledDecrease = item?.isRequired ? quantity <= 1 : quantity <= 0;
                        const isDisabledIncrease = quantity >= participantsValue?.length;

                        return (
                          <div
                            key={item?.additionalId}
                            className="group flex items-center justify-between gap-4 rounded-xl px-4 py-3 ring-1 ring-gray-300  transition-all duration-150"
                          >
                            {/* Left — name & price */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-sm font-semibold text-gray-900 truncate">{item?.name}</p>
                                {item?.isRequired && (
                                  <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded-md bg-red-50 text-red-500 border border-red-100">
                                    Wajib
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-bold text-gray-400">{formatRupiah(getAdditionalPrice(item))}</p>
                            </div>

                            {/* Right — quantity controls */}
                            <div className="flex items-center gap-3 shrink-0">
                              <button
                                onClick={() => handleDecreaseAdditional(item?.additionalId, item?.isRequired)}
                                disabled={isDisabledDecrease || item?.isRequired}
                                className={`
                                size-8 rounded-xl flex items-center justify-center border
                                transition-all duration-150 active:scale-95
                                ${isDisabledDecrease || item?.isRequired ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed" : "border-gray-300 text-gray-500 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"}
                              `}
                              >
                                <Minus className="size-3.5" strokeWidth={4} />
                              </button>

                              <span className="w-5 text-center text-sm font-bold tabular-nums text-gray-900">
                                {quantity}
                              </span>

                              <button
                                onClick={() => handleIncreaseAdditional(item?.additionalId)}
                                disabled={isDisabledIncrease || item?.isRequired}
                                className={`
                                size-8 rounded-xl flex items-center justify-center border
                                transition-all duration-150 active:scale-95
                                ${isDisabledIncrease || item?.isRequired ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed" : "border-gray-900 bg-gray-900 text-white hover:bg-gray-700 hover:border-gray-700 shadow-[0_4px_12px_rgba(0,0,0,0.15)] cursor-pointer"}
                              `}
                              >
                                <Plus className="size-3.5" strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. PENGATURAN PEMBAYARAN */}
              <div className="ring-2 ring-gray-200 shadow-lg rounded-lg p-4 md:p-6 bg-white mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-slate-100 p-2 rounded-full">
                    <Wallet className="w-5 h-5 text-slate-700" />
                  </div>
                  <h2 className="font-bold text-lg md:text-xl text-gray-900">3. Pengaturan Pembayaran</h2>
                </div>

                {summaryLoading ? (
                  <div className="text-left space-y-4 mb-6">
                    <p className="font-semibold text-gray-900 mb-4 animate-pulse">Pilih Skema Pembayaran</p>
                    <div className="h-16 w-full bg-gray-100/80 animate-pulse rounded-2xl" />
                    <div className="h-16 w-full bg-gray-100/80 animate-pulse rounded-2xl" />
                  </div>
                ) : (
                  summaryData && (
                    <div className="text-left mb-6">
                      <p className="font-semibold text-gray-900 mb-4">Pilih Skema Pembayaran</p>

                      <div className="space-y-4">
                        {/* Option 1: Bayar Penuh */}
                        <label
                          className={`block cursor-pointer p-4 rounded-2xl border-2 transition-all ${selectedPaymentScheme === "FULL"
                            ? "border-blue-500 bg-blue-50/20"
                            : "border-gray-100 bg-white hover:border-gray-200"
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="paymentScheme"
                                value="FULL"
                                checked={selectedPaymentScheme === "FULL"}
                                onChange={() => setSelectedPaymentScheme("FULL")}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                              />
                              <div>
                                <p className="font-bold text-gray-900 text-sm">Bayar Penuh (Lunas)</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">Selesaikan seluruh tagihan sekarang</p>
                              </div>
                            </div>
                            <p className="font-bold text-gray-900 text-sm">
                              {formatRupiah(summaryData?.totalAmount ?? totalPrice)}
                            </p>
                          </div>
                        </label>

                        {/* Option 2: Bayar Bertahap */}
                        <div
                          className={`p-4 rounded-2xl border-2 transition-all ${selectedPaymentScheme === "DP"
                            ? "border-blue-500 bg-blue-50/20"
                            : !summaryData?.dpEligible
                              ? "border-gray-100 bg-gray-50/50 opacity-50 cursor-not-allowed"
                              : "border-gray-100 bg-white hover:border-gray-200"
                            }`}
                        >
                          <label
                            className={`flex items-center gap-3 ${!summaryData?.dpEligible ? "cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            <input
                              type="radio"
                              name="paymentScheme"
                              value="DP"
                              checked={selectedPaymentScheme === "DP"}
                              onChange={() => {
                                if (summaryData?.dpEligible) setSelectedPaymentScheme("DP");
                              }}
                              disabled={!summaryData?.dpEligible}
                              className={`w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${!summaryData?.dpEligible ? "cursor-not-allowed" : "cursor-pointer"}`}
                            />
                            <div>
                              <p className="font-bold text-gray-900 text-sm">Bayar Bertahap (Cicilan)</p>
                            </div>
                          </label>

                          {selectedPaymentScheme === "DP" && summaryData?.dpEligible && (
                            <div className="mt-4 pl-7 space-y-4">
                              <div>
                                <p className="text-xs font-bold text-gray-700">Tentukan Nominal DP</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                  Sisa tagihan otomatis jadi pelunasan berikutnya.
                                </p>
                              </div>

                              {/* Custom DP Input */}
                              <div className="relative flex items-center w-full max-w-xs rounded-xl border border-gray-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                                <span className="px-3 py-2 bg-gray-100 text-gray-500 text-xs font-bold border-r border-gray-200">
                                  Rp
                                </span>
                                <input
                                  type="text"
                                  value={customDpInput ? Number(customDpInput).toLocaleString("id-ID") : ""}
                                  onChange={(e) => {
                                    const rawValue = e.target.value.replace(/\D/g, "");
                                    setCustomDpInput(rawValue);
                                  }}
                                  className="flex-1 px-3 py-2 text-xs text-blue-600 font-extrabold outline-none bg-white"
                                  placeholder="Masukkan nominal DP"
                                />
                              </div>

                              {/* Validasi Input DP */}
                              {trip?.dpMinimumAmount &&
                                Number(customDpInput) <
                                Number(trip.dpMinimumAmount) * (participantsValue?.length || 1) && (
                                  <p className="text-xs font-bold text-red-500">
                                    Minimum DP adalah{" "}
                                    {formatRupiah(Number(trip.dpMinimumAmount) * (participantsValue?.length || 1))}
                                  </p>
                                )}
                              {Number(customDpInput) >= totalPrice && (
                                <p className="text-xs font-bold text-red-500 block mt-1">
                                  DP harus kurang dari total harga booking ({formatRupiah(totalPrice)})
                                </p>
                              )}

                              {/* Info Sisa Pembayaran */}
                              {Number(customDpInput) < totalPrice && (
                                <div className="border-t border-dashed border-gray-200 pt-4 mt-2">
                                  <p className="text-xs font-bold text-gray-700 mb-2">Jadwal Sisa Pembayaran:</p>
                                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                                    <span className="flex items-center gap-1.5 font-medium">
                                      <span className="size-1.5 rounded-full bg-blue-500" />
                                      Tahap 2{" "}
                                      <span className="text-[10px] text-gray-400">
                                        (H-{trip?.dpRepaymentDaysBefore ?? 7} Keberangkatan)
                                      </span>
                                    </span>
                                    <span className="font-bold text-gray-900">
                                      {formatRupiah(summaryData.remainingAmount)}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Warning Box for Disabled DP */}
                        {!summaryData?.dpEligible && trip?.dpEnabled === true && (
                          <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                            <div className="flex gap-3 text-red-700">
                              <CircleAlert className="w-5 h-5 shrink-0" />
                              <div>
                                <p className="text-sm font-bold">Pilihan Cicilan Dikunci</p>
                                <p className="text-sm mt-1 text-red-600">
                                  Pembayaran DP hanya tersedia hingga H-{(trip?.dpRepaymentDaysBefore ?? 7) + 1} sebelum
                                  keberangkatan. Mulai H-{trip?.dpRepaymentDaysBefore ?? 7}, pembayaran wajib dilakukan
                                  secara penuh (lunas).
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}

                {/* Payment Method */}
                <div className="border-t border-gray-100 pt-6">
                  <p className="font-semibold text-gray-900 mb-4">Metode Pembayaran</p>
                  <div className={`rounded-2xl p-4 transition-all duration-200 ring-1 ${trySubmit && !selectedPaymentMethod
                    ? "ring-red-500 shadow-lg shadow-red-100 bg-red-50/10"
                    : "ring-gray-300 bg-gray-50/50"
                    }`}>
                    <div className="flex items-center justify-between gap-4">
                      {/* Left */}
                      <div className="flex flex-col gap-1 min-w-0">

                        {selectedPaymentMethod ? (
                          <div className="flex items-center gap-x-2">
                            <Image
                              src={selectedPaymentMethod?.image}
                              alt={selectedPaymentMethod?.label}
                              width={64}
                              height={64}
                              className="object-contain"
                            />
                            <p
                              className={`text-sm font-semibold ${trySubmit && !selectedPaymentMethod ? "text-red-500" : "text-gray-900"}`}
                            >
                              {selectedPaymentMethod?.label}
                            </p>
                          </div>
                        ) : (
                          <p
                            className={`text-sm font-semibold ${trySubmit && !selectedPaymentMethod ? "text-red-500" : "text-gray-900"}`}
                          >
                            Pilih cara pembayaran Anda
                          </p>
                        )}
                      </div>

                      {/* Right — CTA */}
                      <button
                        onClick={() => setPaymentMethodModal(true)}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-900 bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 hover:border-gray-700 active:scale-95 transition-all duration-150 shadow-[0_4px_12px_rgba(0,0,0,0.15)] cursor-pointer whitespace-nowrap"
                      >
                        {selectedPaymentMethod ? (
                          <>
                            <RefreshCw className="size-3.5" strokeWidth={2.5} />
                            <span>Ubah Metode</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="size-3.5" strokeWidth={2.5} />
                            <span>Pilih Metode</span>
                          </>
                        )}
                      </button>
                    </div>
                    {trySubmit && !selectedPaymentMethod && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-red-500 font-semibold">
                        <CircleAlert className="size-3.5" />
                        <span>Silakan pilih metode pembayaran terlebih dahulu</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>


              {/* TODO: Create component for user choose what promo they need to use. Applicable Or Code */}
              {/* Banner Promo */}
              <div className="bg-linear-to-r from-yellow-200 to-orange-300 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-1">
                      Promo Hanya Tersedia di Mobile App Travelbuddies
                    </h3>
                    <p className="text-xs md:text-sm text-slate-700 mb-3">
                      Gunakan promo dengan mudah melalui aplikasi mobile. Download sekarang untuk mendapatkan penawaran
                      terbaik!
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href="https://play.google.com/store/apps/details?id=id.travelbuddies.app&hl=id"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 bg-slate-900 text-white text-xs md:text-sm font-medium px-3 py-2 rounded-lg hover:bg-linear-to-r hover:from-teal-500 hover:via-green-500 hover:to-yellow-500 transition-colors duration-300 cursor-pointer"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                        </svg>
                        <span>Google Play</span>
                      </a>
                      <a
                        href="https://apps.apple.com/id/app/travel-buddies/id6757420967"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 bg-slate-900 text-white text-xs ms:text-sm font-medium px-3 py-2 rounded-lg hover:bg-linear-to-br hover:from-blue-500 hover:to-cyan-400 transition-colors duration-300 cursor-pointer"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                        </svg>
                        <span>App Store</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* <ApplicablePromo
                tripId={trip?.id}
                date={selectedAvailableDate?.date || undefined}
                participantCount={participantsValue?.length}
                selectedPromo={finalSelectedPromo}
                selectedVoucher={selectedVoucher}
                userId={authUser?.id}
                onSelectedPromo={handleSelectPromo}
                onSelectedVoucher={handleSelectVoucher}
              /> */}

            </div>

            {/* RIGHT SIDE - SUMMARY */}
            <div className="lg:col-span-5 2xl:col-span-4 lg:sticky lg:top-22 lg:self-start">
              {/* CARD SUMMARY */}
              <div className="bg-white ring-1 ring-gray-300 shadow-xl shadow-gray-200 rounded-2xl p-5">
                {/* Header */}
                <div className="mb-5">
                  <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-0.5">Ringkasan Pesanan</p>
                </div>

                {/* Trip Card */}
                <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="relative shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-200">
                    {imageSrc && <Image src={imageSrc} alt="trip-image" fill className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{trip?.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{trip?.subtitle}</p>
                  </div>
                </div>

                {/* Trip Info */}
                <div className="space-y-2 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">Tanggal Berangkat</span>
                    <span className="text-xs font-bold text-gray-900">
                      {dayjs(selectedAvailableDate?.date).format("DD MMM YYYY")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">Durasi</span>
                    <span className="text-xs font-bold text-gray-900">{trip?.days} Hari</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">Peserta</span>
                    <span className="text-xs font-bold text-gray-900">{participants?.length} Orang</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-gray-200 mb-4" />

                {/* Price Breakdown */}
                {summaryLoading ? (
                  <div className="space-y-2.5 animate-pulse mb-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-3.5 bg-gray-100 rounded-full w-24" />
                        <div className="h-3.5 bg-gray-100 rounded-full w-20" />
                      </div>
                    ))}
                  </div>
                ) : isError ? (
                  <p className="text-xs text-red-400 text-center py-3 mb-4">Gagal memuat ringkasan harga</p>
                ) : (
                  <div className="mb-4 space-y-2">
                    {/* Peserta */}
                    {tripSummaries?.map((ts: any) => {
                      const isChild = ts.id?.toString().endsWith("-child") || ts.name?.toLowerCase().includes("anak");
                      const typeLabel = isChild ? "(ANAK)" : "(DEWASA)";
                      return (
                        <div key={ts.id} className="space-y-2 pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Harga per Orang {typeLabel}</span>
                            <span className="text-xs font-semibold text-gray-700">{formatRupiah(ts.price ?? 0)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Subtotal Trip {typeLabel} ({ts.quantity} pax)</span>
                            <span className="text-xs font-semibold text-gray-900">
                              {formatRupiah((ts.price ?? 0) * (ts.quantity ?? 0))}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Additionals */}
                    {additionalSummary &&
                      additionalSummary?.map((item: any) => (
                        <div key={item?.id} className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {item?.name} ×{item?.quantity}
                          </span>
                          <span className="text-xs text-gray-700">{formatRupiah(item?.price * item?.quantity)}</span>
                        </div>
                      ))}

                    {/* Admin Fee */}
                    {adminFeeSummary && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{adminFeeSummary?.name}</span>
                        <span className="text-xs text-gray-700">
                          {formatRupiah((adminFeeSummary?.price ?? 0) * (adminFeeSummary?.quantity ?? 0))}
                        </span>
                      </div>
                    )}

                    {/* Promo */}
                    {promoSummary && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{promoSummary?.name}</span>
                        <span className="text-xs font-semibold text-emerald-500">− {formatRupiah(discountValue)}</span>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-gray-100 pt-3 mt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">
                          {selectedPaymentScheme === "DP" ? "Total Tagihan (DP)" : "Total"}
                        </span>
                        <span className="text-base font-black text-gray-900">
                          {formatRupiah(
                            selectedPaymentScheme === "DP" && summaryData?.dpAmount ? summaryData.dpAmount : totalPrice,
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Cashback */}
                    {cashbackSummary && (
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 mt-1">
                        <span className="text-xs text-amber-600 flex items-center gap-1.5">
                          <Coins className="size-3 text-amber-500" />
                          {cashbackSummary?.name}
                        </span>
                        <span className="text-xs font-bold text-amber-600">
                          + {formatRupiah(cashbackSummary?.price * cashbackSummary?.quantity)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* CTA */}
                {(() => {
                  const isDpInvalid =
                    selectedPaymentScheme === "DP" &&
                    ((trip?.dpMinimumAmount &&
                      Number(customDpInput) < Number(trip.dpMinimumAmount) * (participantsValue?.length || 1)) ||
                      Number(customDpInput) >= totalPrice);
                  return (
                    <button
                      type="submit"
                      disabled={summaryLoading || isDpInvalid}
                      onClick={handleSubmit(confirmBooking)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold tracking-wide hover:bg-blue-700 active:scale-[0.98] transition-all duration-150 shadow-[0_4px_12px_rgba(0,0,0,0.15)] cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      <CheckCircle className="size-4" strokeWidth={2.5} />
                      <span>Konfirmasi Pemesanan</span>
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODALS */}
      {paymentMethodModal && (
        <PaymentMethodModal
          onClose={() => setPaymentMethodModal(false)}
          onSelectPayment={(data) => setSelectedPaymentMethod(data)}
          amount={selectedPaymentScheme === "DP" && summaryData?.dpAmount ? summaryData.dpAmount : totalPrice}
        />
      )}

      {finalBookingModal && (
        <FinalBookingModal
          onClose={() => setFinalBookingModal(false)}
          bookingData={bookingData}
          prefetchedSummary={summaryData}
          onSubmit={onSubmit}
          isLoading={createBookingMutation.isPending}
          summaryLoading={summaryLoading}
        />
      )}

      <PendingBookingLimitModal
        isOpen={pendingLimitModal}
        onClose={() => setPendingLimitModal(false)}
        pendingBookings={pendingBookings}
      />
    </>
  );
}

function getAdditionalPrice(item: { promoPrice: number | null; price: number | null }) {
  return item?.promoPrice ?? item?.price;
}
