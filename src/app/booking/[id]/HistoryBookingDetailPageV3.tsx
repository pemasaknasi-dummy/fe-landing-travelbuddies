"use client";

import { formatRupiah } from "@/lib/format-rupiah";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  User,
  Receipt,
  ChevronRight,
  XCircle,
  ChevronDown,
  ShieldCheck,
  Share2,
  Angry,
  Frown,
  Annoyed,
  Smile,
  Laugh,
  ArrowRight,
  Plus,
  Minus,
  Info,
  Check,
  FileText,
  CheckCircle,
  X,
  Package,
  MapPinCheck,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  useBookingDetail,
  useAddParticipants,
  useAddParticipantsSummary,
} from "@/features/bookings/hooks/useBooking";
import { bookingApi } from "@/features/bookings/api/booking-api";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { SpinnerLoading } from "@/components/sections/SpinnerLoading";
import { useCountdown } from "@/lib/useCountdown";
import { getPaymentStatusConfig } from "@/lib/getPaymentStatusConfig";
import { getStatusTripConfig } from "@/lib/getStatusTripConfig";
import dayjs from "dayjs";
import "dayjs/locale/id";
import NotFoundCard from "@/components/sections/NotFoundCard";
import toast from "react-hot-toast";
import { AddParticipantModal } from "@/components/sections/booking/AddParticipantModal";
import { CompleteParticipantModal } from "@/components/sections/booking/CompleteParticipantModal";
import { ParticipantCard } from "@/components/sections/booking/ParticipantCard";
import { RepaymentModal } from "@/components/sections/booking/RepaymentModal";

import { OrderAdditionalModal } from "@/components/sections/booking/OrderAdditionalModal";

dayjs.locale("id");

// Global Manual Additions Helper
const getManualAdditions = (booking: any) => {
  const manualAdditions: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[] = [];
  if (!booking) return { items: [], totalDiff: 0 };

  let orderDetail = [];
  if (booking.orderDetail) {
    try {
      orderDetail = Array.isArray(booking.orderDetail)
        ? booking.orderDetail
        : JSON.parse(booking.orderDetail || "[]");
    } catch (e) {
      console.error("Failed to parse orderDetail:", e);
    }
  }

  const onlinePayment = booking.payment?.details?.find(
    (p: any) => p.method !== "manual",
  );
  let paidItems = [];
  if (onlinePayment?.rawResponse) {
    const raw =
      typeof onlinePayment.rawResponse === "string"
        ? JSON.parse(onlinePayment.rawResponse)
        : onlinePayment.rawResponse;
    paidItems = raw.items || [];
  }

  let totalDiff = 0;

  orderDetail.forEach((item: any) => {
    if (
      item.id === "unique-number" ||
      item.id === "unique-number-dp" ||
      item.id?.startsWith("promo-") ||
      item.id?.startsWith("voucher-") ||
      item.name === "Unique number"
    ) {
      return;
    }

    const currentQty = Number(item.quantity || 0);
    const paidItem = paidItems.find(
      (pi: any) =>
        pi.name === item.name ||
        pi.name?.startsWith(`${item.name} `) ||
        pi.name?.startsWith(item.name),
    );
    const paidQty = paidItem ? Number(paidItem.quantity || 0) : 0;
    const diffQty = currentQty - paidQty;

    if (diffQty > 0) {
      const price = Number(item.price || 0);
      const total = price * diffQty;

      manualAdditions.push({
        name: item.name,
        quantity: diffQty,
        price,
        total,
      });
      totalDiff += total;
    }
  });

  return { items: manualAdditions, totalDiff };
};

// Main Component
export default function HistoryBookingDetailPageV3() {
  const params = useParams();
  const id = Number(params?.id);
  const { data, isLoading } = useBookingDetail(id);
  const queryClient = useQueryClient();

  const [isOpenPricing, setIsOpenPricing] = useState<boolean>(true);
  const [isOpenParticipant, setIsOpenParticipant] = useState<boolean>(true);
  const [isOpenInfo, setIsOpenInfo] = useState<boolean>(true);
  const [isOpenFeedback, setIsOpenFeedback] = useState<boolean>(true);

  useEffect(() => {
    const handleFocusOrPageshow = () => {
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["history-detail", id] });
      }
    };

    window.addEventListener("focus", handleFocusOrPageshow);
    window.addEventListener("pageshow", handleFocusOrPageshow);

    return () => {
      window.removeEventListener("focus", handleFocusOrPageshow);
      window.removeEventListener("pageshow", handleFocusOrPageshow);
    };
  }, [id, queryClient]);

  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] =
    useState<boolean>(false);
  const [isCompleteParticipantModalOpen, setIsCompleteParticipantModalOpen] =
    useState<boolean>(false);
  const [participantToEdit, setParticipantToEdit] = useState<any>(null);
  const [isRepaymentModalOpen, setIsRepaymentModalOpen] =
    useState<boolean>(false);
  const [selectedRepaymentPayment, setSelectedRepaymentPayment] =
    useState<any>(null);

  const [isOrderAdditionalModalOpen, setIsOrderAdditionalModalOpen] =
    useState<boolean>(false);
  const [additionalQuantities, setAdditionalQuantities] = useState<any[]>([]);

  const normalizeAdditionals = (trip: any) => {
    const tripAdditionals = trip?.additionals || [];
    if (tripAdditionals.length === 0) return [];
    const destination = trip?.destinations?.[0];
    if (!destination) return [];

    const infoMap = new Map<number, { name: string; unit: string }>(
      destination?.additionals?.map((a: any) => [
        a?.id,
        { name: a?.name, unit: a?.unit },
      ]),
    );
    const priceMap = new Map<
      number,
      { basePrice: number; price: number; promoPrice: number | null }
    >(
      destination?.additional_prices?.map((p: any) => [
        p?.additionalId,
        {
          basePrice: p?.basePrice,
          price: p?.price,
          promoPrice: p?.promoPrice,
        },
      ]),
    );

    return tripAdditionals
      .filter((item: any) => !item.isRequired)
      .map((item: any) => {
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

  const pendingAdditionalPayment = useMemo(() => {
    return data?.payment?.details?.find(
      (p: any) => p.status === "PENDING" && p.orderId?.startsWith("TB-ADDL-"),
    );
  }, [data?.payment?.details]);

  const availableAdditionals = useMemo(
    () => normalizeAdditionals(data?.trip),
    [data?.trip],
  );

  useEffect(() => {
    if (!availableAdditionals?.length) return;
    setAdditionalQuantities(
      availableAdditionals.map((item: any) => ({
        name: item.name,
        additionalId: item.additionalId,
        quantity: 0,
        price: item.promoPrice ?? item.price,
      })),
    );
  }, [
    availableAdditionals,
    pendingAdditionalPayment,
    data?.items?.length,
    data?.payment?.details?.length,
  ]);

  const maxQuantity = data?.bookingParticipants?.length || 1;

  const handleIncreaseAdditional = (
    id: number,
    maxAllowed: number = maxQuantity,
  ) => {
    setAdditionalQuantities((prev) =>
      prev.map((item) =>
        item.additionalId === id && item.quantity < maxAllowed
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  };

  const handleDecreaseAdditional = (id: number) => {
    setAdditionalQuantities((prev) =>
      prev.map((item) =>
        item.additionalId === id && item.quantity > 0
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );
  };

  const additionalTotalPrice = useMemo(() => {
    return additionalQuantities.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  }, [additionalQuantities]);

  const hasSelectedAdditionalItems = additionalQuantities.some(
    (q) => q.quantity > 0,
  );

  const allInvoices = useMemo(() => {
    if (!data?.payment?.details) return [];
    const validStatuses = [
      "PENDING",
      "WAITING",
      "PAID",
      "SUCCESS",
      "SETTLED",
      "COMPLETED",
    ];
    return data.payment.details
      .filter((p: any) => {
        const st = String(p.status || "").toUpperCase();
        return validStatuses.includes(st);
      })
      .map((p: any) => {
        const invs = p.paymentInvoices || [];
        if (invs.length > 0) {
          const sortedInvs = [...invs].sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          // Attach the parent payment to each invoice so we can filter by orderId later
          return [{ ...sortedInvs[0], payment: p }];
        }
        return [
          {
            id: p.id,
            invoiceNumber: p.orderId,
            createdAt: p.createdAt,
            payment: p,
          },
        ];
      })
      .flat()
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [data]);


  const handlePrintInvoice = () => {
    const isDpPaid = data?.payment?.details?.some(
      (p: any) =>
        !p.orderId?.startsWith("TB-ADD-") &&
        !p.orderId?.startsWith("TB-ADDL-") &&
        !p.orderId?.endsWith("-FINAL") &&
        ["PAID", "SUCCESS", "SETTLED", "COMPLETED"].includes(
          String(p.status || "").toUpperCase(),
        ),
    );

    let targetInvoice = allInvoices[0];

    if (data?.paymentScheme === "DP" && !isDpPaid) {
      // Find the DP invoice: payment orderId ends with -DP or is neither -FINAL nor -ADDL
      const dpInvoice = allInvoices.find((inv: any) => {
        const pOrderId = inv.payment?.orderId || "";
        return (
          pOrderId &&
          !pOrderId.endsWith("-FINAL") &&
          !pOrderId.startsWith("TB-ADD-") &&
          !pOrderId.startsWith("TB-ADDL-")
        );
      });
      if (dpInvoice) {
        targetInvoice = dpInvoice;
      }
    }

    const latestInvoiceNumber = targetInvoice?.invoiceNumber;
    const invoiceUrl = `${window.location.origin}/booking/${id}/invoice${latestInvoiceNumber ? `?inv=${latestInvoiceNumber}` : ""}`;
    window.open(invoiceUrl, "_blank");
  };

  const mappedParticipants = useMemo(() => {
    const allMps =
      data?.trip?.destinations?.[0]?.destinationMeetingPoints || [];
    return (data?.bookingParticipants || []).map((bp: any, index: number) => {
      if (bp.meetingPointId) return bp;

      const hasMp = (bp.label || "").includes("|MP:");
      const [, mpPart] = (bp.label || "").split("|MP:");
      let resolvedMp = null;

      if (hasMp) {
        if (mpPart) {
          resolvedMp = allMps.find((m: any) => String(m.id) === String(mpPart));
        } else {
          resolvedMp = null; // Explicitly no meeting point
        }
      } else {
        const sortedBmp = [...(data?.meetingPointParticipants || [])].sort(
          (a: any, b: any) => a.id - b.id,
        );
        const bmp = sortedBmp[index] || sortedBmp[0] || null;
        if (bmp) {
          resolvedMp = allMps.find(
            (m: any) =>
              String(m.id) ===
              String(
                bmp.destinationMeetingPointId ||
                  bmp.destinationMeetingPoint?.id,
              ),
          );
        }
      }

      return {
        ...bp,
        meetingPointId: resolvedMp?.id || "",
        meetingPoints: resolvedMp
          ? {
              location: resolvedMp.meetingPoint?.location || "",
              time: resolvedMp.time || "",
            }
          : null,
      };
    });
  }, [data?.bookingParticipants, data?.meetingPointParticipants, data?.trip]);

  const allowOverdueRepayment = Boolean(data?.allowOverdueRepayment);

  const isRepaymentEligible = useMemo(() => {
    // If admin has enabled overdue repayment for this booking, always treat as eligible
    if (allowOverdueRepayment) return true;
    if (!data?.tripDate?.date) return false;
    const dpDaysBefore = data?.trip?.dpRepaymentDaysBefore ?? 7;
    const dpDeadline = dayjs(data.tripDate.date).subtract(dpDaysBefore, "day").endOf("day");
    return dpDeadline.diff(dayjs(), "second") > 0;
  }, [data?.tripDate?.date, data?.trip?.dpRepaymentDaysBefore, allowOverdueRepayment]);

  const isDpPaidDetail = useMemo(() => {
    return (data?.payment?.details || []).some(
      (p: any) =>
        !p.orderId?.startsWith("TB-ADD-") &&
        !p.orderId?.startsWith("TB-ADDL-") &&
        !p.orderId?.endsWith("-FINAL") &&
        ["PAID", "SUCCESS", "SETTLED", "COMPLETED"].includes(String(p.status || "").toUpperCase())
    );
  }, [data?.payment?.details]);

  const activeParticipants = useMemo(() => {
    return mappedParticipants.filter((bp: any) => {
      if (data?.paymentScheme === "DP" && isDpPaidDetail && isRepaymentEligible) {
        return true;
      }
      return bp.status !== "EXPIRED";
    });
  }, [mappedParticipants, data?.paymentScheme, isDpPaidDetail, isRepaymentEligible]);

  const expiredParticipants = useMemo(() => {
    return mappedParticipants.filter((bp: any) => {
      if (data?.paymentScheme === "DP" && isDpPaidDetail && isRepaymentEligible) {
        return false;
      }
      return bp.status === "EXPIRED";
    });
  }, [mappedParticipants, data?.paymentScheme, isDpPaidDetail, isRepaymentEligible]);

  const incompleteParticipants = useMemo(() => {
    return activeParticipants.filter((bp: any) => {
      const name = bp.participant?.name?.trim() || "";
      const phone = bp.participant?.phone?.trim() || "";
      const ktp = bp.participant?.noKtp?.trim() || "";
      return (
        !name ||
        name.toLowerCase().startsWith("peserta") ||
        !phone ||
        phone.toLowerCase().startsWith("empty-") ||
        !ktp ||
        ktp === "0000000000000000" ||
        ktp.toLowerCase().startsWith("ktp-agent") ||
        ktp.toLowerCase().startsWith("empty-")
      );
    });
  }, [activeParticipants]);

  const isPicParticipating = useMemo(() => {
    const pic = data?.personInCharge || data?.user;
    if (!pic || !data?.bookingParticipants) return false;

    const normalizePhone = (ph?: string) => {
      if (!ph) return "";
      const digits = String(ph).replace(/\D/g, "");
      return digits.slice(-9);
    };

    const uEmail = (pic as any).email?.toLowerCase()?.trim();
    const uPhoneNorm = normalizePhone(
      (pic as any).phoneNumber || (pic as any).phone,
    );
    const uName =
      (pic as any).fullName?.toLowerCase()?.trim() ||
      (pic as any).name?.toLowerCase()?.trim();

    return data.bookingParticipants.some((p: any) => {
      const pEmail = p.participant?.email?.toLowerCase()?.trim();
      const pPhoneNorm = normalizePhone(p.participant?.phone);
      const pName = p.participant?.name?.toLowerCase()?.trim();

      const emailMatch = Boolean(pEmail && uEmail && pEmail === uEmail);
      const phoneMatch = Boolean(
        pPhoneNorm && uPhoneNorm && pPhoneNorm === uPhoneNorm,
      );
      const nameMatch = Boolean(
        pName &&
        uName &&
        pName === uName &&
        pName !== "" &&
        !pName.startsWith("peserta "),
      );

      return emailMatch || phoneMatch || nameMatch;
    });
  }, [data?.personInCharge, data?.user, data?.bookingParticipants]);

  const isPastH1 = useMemo(() => {
    if (!data?.tripDate?.date) return false;
    const h3Deadline = dayjs(data.tripDate.date)
      .subtract(1, "day")
      .endOf("day");
    return dayjs().isAfter(h3Deadline);
  }, [data?.tripDate?.date]);

  const sortedPaymentDetails = useMemo(() => {
    if (!data?.payment?.details) return [];
    return [...data.payment.details].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [data?.payment?.details]);

  const latestPaidPayment = useMemo(() => {
    return [...sortedPaymentDetails]
      .reverse()
      .find((p: any) => p.status === "PAID" || p.status === "SUCCESS");
  }, [sortedPaymentDetails]);

  const sortedItems = useMemo(() => {
    if (!data?.items) return [];
    const paymentsMap = new Map<
      number,
      { createdAt: string; orderId: string }
    >();
    data.payment?.details?.forEach((p: any) => {
      paymentsMap.set(p.id, { createdAt: p.createdAt, orderId: p.orderId });
    });

    return [...data.items]
      .filter((item: any) => {
        const payment = item.paymentId ? paymentsMap.get(item.paymentId) : null;
        const isAddition =
          payment?.orderId?.startsWith("TB-ADD-") ||
          payment?.orderId?.startsWith("TB-ADDL-");
        if (
          isAddition &&
          (item.status === "EXPIRED" || item.status === "FAILED")
        ) {
          return false;
        }
        return true;
      })
      .sort((a: any, b: any) => {
        const paymentA = (a as any).paymentId
          ? paymentsMap.get((a as any).paymentId)
          : null;
        const paymentB = (b as any).paymentId
          ? paymentsMap.get((b as any).paymentId)
          : null;
        const dateA = paymentA ? new Date(paymentA.createdAt).getTime() : 0;
        const dateB = paymentB ? new Date(paymentB.createdAt).getTime() : 0;
        return dateA - dateB;
      });
  }, [data?.items, data?.payment?.details]);

  const consolidatedAdditionals = useMemo(() => {
    if (!sortedItems) return [];
    const map = new Map<
      string,
      { name: string; quantity: number; price: number; status: string }
    >();

    sortedItems.forEach((item: any) => {
      const isTrip =
        item.name === data?.trip?.title ||
        item.name.startsWith(data?.trip?.title + " (");
      const isUnique = item.name === "Unique number";
      const isCashback = item.name.startsWith("Cashback");
      const isPromo =
        item.name.startsWith("Promo:") || item.name.startsWith("Voucher");
      const isAddPart =
        item.name.startsWith("Add Participant") ||
        item.name.startsWith("Penambahan peserta");
      const isDp = item.name.startsWith("Down Payment");
      const isRepayment = item.name.startsWith("Pelunasan");

      if (
        isTrip ||
        isUnique ||
        isCashback ||
        isPromo ||
        isAddPart ||
        isDp ||
        isRepayment
      )
        return;

      const cleanName = item.name.replace(/\s*\(\+\d+\)/, "").trim();
      const existing = map.get(cleanName);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        map.set(cleanName, {
          name: cleanName,
          quantity: item.quantity,
          price: item.price,
          status: item.status,
        });
      }
    });

    return Array.from(map.values());
  }, [sortedItems, data?.trip?.title]);
  const totalPaxCount = useMemo(() => {
    return (
      sortedItems
        ?.filter(
          (item: any) =>
            item.name === data?.trip?.title ||
            item.name.startsWith(data?.trip?.title + " (") ||
            item.name.startsWith("Add Participant") ||
            item.name.startsWith("Penambahan peserta") ||
            item.name.startsWith("Down Payment") ||
            item.name.startsWith("Pelunasan"),
        )
        ?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
    );
  }, [sortedItems, data?.trip?.title]);

  const totalPax = data?.bookingParticipants?.length;

  const activePayments = useMemo(() => {
    if (!data?.payment?.details) return [];
    return data.payment.details.filter((p: any) => {
      const isAddition =
        p.orderId?.startsWith("TB-ADD-") || p.orderId?.startsWith("TB-ADDL-");
      if (isAddition && (p.status === "EXPIRED" || p.status === "FAILED")) {
        return false;
      }
      return true;
    });
  }, [data?.payment?.details]);

  const activeTotalAmount = useMemo(() => {
    return activePayments.reduce((sum: number, p: any) => {
      return (
        sum +
        (p.finalPrice
          ? Number(p.finalPrice)
          : p.grossAmount
            ? Number(p.grossAmount)
            : p.amount || 0)
      );
    }, 0);
  }, [activePayments]);

  const mainPayment = data?.payment?.details?.find(
    (p: any) =>
      p.orderId &&
      !p.orderId.startsWith("TB-ADD-") &&
      !p.orderId.startsWith("TB-ADDL-"),
  );
  const uniqueNumber = useMemo(() => {
    const total =
      sortedItems
        ?.filter((item: any) => item.name === "Unique number")
        .reduce(
          (sum: number, item: any) => sum + item.price * item.quantity,
          0,
        ) || 0;
    return total > 0 ? { price: total } : null;
  }, [sortedItems]);

  const consolidatedStatus = data?.payment?.status || "PENDING";
  const firstPayment = data?.payment?.details?.[0];
  const paymentMethod = firstPayment?.method;

  const startDate = new Date(data?.tripDate?.date ?? "");
  const days = data?.trip?.days ?? 1;

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (days - 1));
  endDate.setHours(23, 59, 59, 999);

  const feedbackAvailableTime = new Date(endDate);
  feedbackAvailableTime.setHours(feedbackAvailableTime.getHours() - 6);

  const tripDateStatus = data?.tripDate?.status?.toLowerCase() || "";
  const isTripDone = tripDateStatus === "done";
  const isTripDepart = tripDateStatus === "depart";
  const isWithinFeedbackTime = new Date() >= feedbackAvailableTime;

  const docLinks: string[] = useMemo(() => {
    if (!data?.documentationLink) return [];
    if (Array.isArray(data.documentationLink)) return data.documentationLink;
    try {
      return typeof data.documentationLink === "string"
        ? JSON.parse(data.documentationLink)
        : [];
    } catch {
      return [];
    }
  }, [data?.documentationLink]);

  const hasDocumentation = Boolean(
    data?.hasDocumentation || docLinks.length > 0,
  );

  const meetingPoints = useMemo(() => {
    return data?.trip?.destinations?.[0]?.destinationMeetingPoints || [];
  }, [data]);

  const renderTripStatusLabel = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Menunggu Keberangkatan";
      case "full":
        return "Kuota Penuh";
      case "closed":
        return "Pendaftaran Ditutup";
      case "depart":
        return "Berangkat";
      case "done":
        return "Selesai";
      case "cancel":
        return "Batal";
      case "refund":
        return "Refund / Batal";
      default:
        return status || "Menunggu";
    }
  };

  const renderTripStatusDescription = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "done":
        return (
          <>
            Trip ini telah selesai dilaksanakan. Terima kasih sudah berpetualang
            bersama Travel Buddies! Sampai jumpa di perjalanan berikutnya.
          </>
        );
      case "depart":
        return (
          <>
            Trip sedang berlangsung. Selamat menikmati perjalanan dan liburan
            serumu bersama Mindies! 🎉
          </>
        );
      case "cancel":
        return (
          <>
            Trip ini tidak dapat dilaksanakan. Silakan jadwalkan ulang atau
            pilih destinasi lain.
          </>
        );
      case "refund":
        return (
          <>
            Trip ini berstatus refund. Pengembalian dana sedang atau telah
            diproses sesuai prosedur.
          </>
        );
      case "full":
        return (
          <>
            Kuota peserta untuk trip ini telah terpenuhi (penuh). Keputusan dan
            detail teknis keberangkatan akan diinfokan paling lambat{" "}
            <strong>H-2 keberangkatan</strong>.
          </>
        );
      case "closed":
        return (
          <>
            Pendaftaran untuk trip pada tanggal ini telah ditutup. Keputusan
            keberangkatan akan diinfokan paling lambat{" "}
            <strong>H-2 keberangkatan</strong>.
          </>
        );
      case "pending":
      default:
        return (
          <>
            Keputusan keberangkatan trip (kuota terpenuhi/tidak) akan diinfokan
            paling lambat <strong>H-2 keberangkatan</strong>.
          </>
        );
    }
  };

  const getTripDepartureStatusTheme = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "depart":
        return {
          key: "depart",
          cardBg:
            "bg-gradient-to-br from-emerald-500/10 via-emerald-50/40 to-white",
          borderColor: "border-emerald-200/90",
          topBarGradient:
            "bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500",
          icon: MapPinCheck,
          iconBg: "bg-emerald-100 text-emerald-700",
          titleColor: "text-emerald-950",
          descColor: "text-emerald-900/80",
          glowEffect: "shadow-md shadow-emerald-500/5",
        };
      case "full":
        return {
          key: "full",
          cardBg: "bg-gradient-to-br from-teal-500/10 via-teal-50/40 to-white",
          borderColor: "border-teal-200/90",
          topBarGradient:
            "bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500",
          icon: Users,
          iconBg: "bg-teal-100 text-teal-700",
          titleColor: "text-teal-950",
          descColor: "text-teal-900/80",
          glowEffect: "shadow-md shadow-teal-500/5",
        };
      case "closed":
        return {
          key: "closed",
          cardBg: "bg-gradient-to-br from-sky-500/10 via-sky-50/40 to-white",
          borderColor: "border-sky-200/90",
          topBarGradient:
            "bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500",
          icon: Calendar,
          iconBg: "bg-sky-100 text-sky-700",
          titleColor: "text-sky-950",
          descColor: "text-sky-900/80",
          glowEffect: "shadow-md shadow-sky-500/5",
        };
      case "done":
        return {
          key: "done",
          cardBg: "bg-gradient-to-br from-slate-100/70 via-slate-50 to-white",
          borderColor: "border-slate-200",
          topBarGradient:
            "bg-gradient-to-r from-slate-600 via-slate-700 to-slate-900",
          icon: CheckCircle,
          iconBg: "bg-slate-100 text-slate-700",
          titleColor: "text-slate-900",
          descColor: "text-slate-600",
          glowEffect: "shadow-xs",
        };
      case "cancel":
      case "refund":
        return {
          key: "cancel",
          cardBg: "bg-gradient-to-br from-rose-500/10 via-rose-50/50 to-white",
          borderColor: "border-rose-200/90",
          topBarGradient:
            "bg-gradient-to-r from-rose-500 via-red-500 to-orange-500",
          icon: XCircle,
          iconBg: "bg-rose-100 text-rose-700",
          titleColor: "text-rose-950",
          descColor: "text-rose-900/80",
          glowEffect: "shadow-md shadow-rose-500/5",
        };
      case "pending":
      default:
        return {
          key: "pending",
          cardBg:
            "bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-white",
          borderColor: "border-amber-200/90",
          topBarGradient:
            "bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400",
          icon: Clock,
          iconBg: "bg-amber-100 text-amber-700",
          titleColor: "text-amber-950",
          descColor: "text-amber-900/80",
          glowEffect: "shadow-md shadow-amber-500/5",
        };
    }
  };

  // const adminPhone = "+6282258401785";
  const adminPhone = "+6281382471642";
  const defaultMessage = [
    `Halo mindies aku mau tanya tentang :`,
    ``,
    `Order ID : ${data?.orderId}`,
    `==========================`,
    `Nama Pemesan : ${data?.user?.name}`,
    `Jumlah Peserta : ${totalPaxCount}`,
    `Nama Trip : ${data?.trip?.title}`,
    `Tanggal Trip : ${dayjs(data?.tripDate?.date).format("DD")} - ${dayjs(
      data?.tripDate?.date,
    )
      .add((data?.trip?.days ?? 0) - 1, "day")
      .format("DD MMMM YYYY")}`,
    `Status Pembayaran : ${data?.status}`,
    `Metode Pembayaran : ${firstPayment?.method || "Online"}`,
    `Total Harga : ${formatRupiah(activeTotalAmount)}`,
    `Diskon/Promo : ${data?.items?.find((i) => i?.name?.startsWith("Promo:"))?.name?.split("Promo:")[1] ?? "-"}`,
    `Status Keberangkatan : ${renderTripStatusLabel(data?.tripDate?.status)}`,
  ].join("\n");

  const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(defaultMessage)}`;

  const paymentChannelMap = {
    QRIS: "QR Code",
    SHOPEEPAY: "E-Wallet",
    ASTRAPAY: "E-Wallet",
    OVO: "E-Wallet",
    LINKAJA: "E-Wallet",
    BCA: "Virtual Account",
    BRI: "Virtual Account",
    MANDIRI: "Virtual Account",
    BNI: "Virtual Account",
    PERMATA: "Virtual Account",
    BSI: "Virtual Account",
    CIMB: "Virtual Account",
    BJB: "Virtual Account",
    SAHABAT_SAMPOERNA: "Virtual Account",
    INDOMARET: "Mitra/Agen",
    AKULAKU: "PayLater",
    CREDIT_CARD: "Kartu Kredit/Debit",
  };

  const emojiRatings = [
    {
      value: 1,
      icon: Angry,
      color: "#ef4444",
      bg: "#fef2f2",
      label: "Terrible",
    },
    { value: 2, icon: Frown, color: "#f97316", bg: "#fff7ed", label: "Bad" },
    { value: 3, icon: Annoyed, color: "#eab308", bg: "#fefce8", label: "Okay" },
    { value: 4, icon: Smile, color: "#22c55e", bg: "#f0fdf4", label: "Good" },
    {
      value: 5,
      icon: Laugh,
      color: "#3b82f6",
      bg: "#eff6ff",
      label: "Excellent",
    },
  ];

  const activeEmoji = Math.round(data?.averageRating || 0);

  const handleShare = async () => {
    const slug = data?.trip?.slug;
    if (!slug) return;
    const pathPrefix =
      data?.trip?.type === "private" ? "/private-trip" : "/open-trip";
    const url = `${window.location.origin}${pathPrefix}/${slug}`;

    if (!navigator.share) {
      await navigator.clipboard.writeText(url);
      toast.success("Link trip disalin ke clipboard!");
      return;
    }

    try {
      await navigator.share({
        title: "Travel Buddies",
        text: `Ikut trip seru bareng aku ke ${data?.trip?.title}!`,
        url,
      });
    } catch (error) {
      console.log("Share cancelled");
    }
  };

  const pendingPayment = sortedPaymentDetails.find(
    (p: any) => p.status === "PENDING",
  );
  const hasExpiredDP = data?.payment?.details?.find(
    (p: any) => p?.orderId?.endsWith("-DP") && p.status === "EXPIRED",
  );
  const expiredRepayment = data?.payment?.details?.find(
    (p: any) => p?.orderId?.endsWith("-FINAL") && p.status === "EXPIRED",
  );
  const repaymentPastDueDate = data?.repaymentPastDueDate;

  const hasExpiredRepayment = !!expiredRepayment;
  const hasExpiredFullPayment =
    data?.paymentScheme === "FULL" &&
    data?.payment?.details?.some(
      (p: any) =>
        !p.orderId?.startsWith("TB-ADD-") &&
        !p.orderId?.startsWith("TB-ADDL-") &&
        p.status === "EXPIRED",
    );

  const activePendingPayment = pendingAdditionalPayment || pendingPayment;

  const { formattedTime, isExpired } = useCountdown(
    activePendingPayment?.createdAt || data?.payment?.createdAt || "",
    activePendingPayment ? "PENDING" : data?.payment?.status,
    activePendingPayment?.expiryDate ||
      (activePendingPayment as any)?.rawResponse?.expiry_date ||
      (activePendingPayment as any)?.rawResponse?.invoiceDuration,
  );

  const isLunas = useMemo(() => {
    const hasPending = data?.payment?.details?.some(
      (p: any) => p.status?.toUpperCase() === "PENDING",
    );
    if (hasPending) return false;

    if (
      data?.status === "PAID" ||
      data?.status === "SUCCESS" ||
      consolidatedStatus === "PAID"
    ) {
      return true;
    }
    if (activePayments.length > 0) {
      return activePayments.every((p) =>
        ["PAID", "SETTLED", "SUCCESS", "COMPLETED"].includes(
          p.status?.toUpperCase(),
        ),
      );
    }
    return false;
  }, [
    data?.status,
    consolidatedStatus,
    activePayments,
    data?.payment?.details,
  ]);

  const canShowFeedback = useMemo(() => {
    return (
      isLunas &&
      !data?.hasFeedback &&
      !data?.averageRating &&
      (isTripDone || (isTripDepart && isWithinFeedbackTime && hasDocumentation))
    );
  }, [
    isLunas,
    data?.hasFeedback,
    data?.averageRating,
    isTripDone,
    isTripDepart,
    isWithinFeedbackTime,
    hasDocumentation,
  ]);

  const isPaymentExpired =
    data?.paymentScheme === "FULL"
      ? hasExpiredFullPayment ||
        data?.status === "EXPIRED" ||
        data?.status === "FAILED" ||
        consolidatedStatus === "EXPIRED" ||
        consolidatedStatus === "FAILED"
      : !!hasExpiredDP ||
      (!!repaymentPastDueDate && !allowOverdueRepayment) ||
      (hasExpiredRepayment && !isRepaymentEligible) ||
      (data?.paymentScheme === "DP" && !isLunas && !isRepaymentEligible) ||
      (data?.status === "EXPIRED" && !isRepaymentEligible) ||
      (data?.status === "FAILED" && !isRepaymentEligible) ||
      (consolidatedStatus === "EXPIRED" && !isRepaymentEligible) ||
      (consolidatedStatus === "FAILED" && !isRepaymentEligible);

  const hasPaidPayment = data?.payment?.details?.some((p: any) =>
    ["PAID", "SETTLED", "SUCCESS", "COMPLETED"].includes(
      p.status?.toUpperCase(),
    ),
  );

  const canOrderAdditional =
    !isPaymentExpired &&
    hasPaidPayment &&
    (data?.tripDate?.status?.toLowerCase() === "pending" ||
      data?.tripDate?.status?.toLowerCase() === "full") &&
    !pendingAdditionalPayment &&
    data?.trip?.additionals?.length > 0;

  // Total dibayar & sisa tagihan calculation for display
  const totalPaid = useMemo(() => {
    return sortedPaymentDetails
      .filter((p: any) => p.status === "PAID" || p.status === "SUCCESS")
      .reduce(
        (sum: number, p: any) =>
          sum + (p.finalPrice || p.grossAmount || p.amount || 0),
        0,
      );
  }, [sortedPaymentDetails]);

  const sisaPembayaran = useMemo(() => {
    return Math.max(0, activeTotalAmount - totalPaid);
  }, [activeTotalAmount, totalPaid]);

  const fallbackTripDateString = useMemo(() => {
    if (!data?.tripDate?.date) return "-";
    return dayjs(data.tripDate.date).locale("id").format("D MMMM YYYY");
  }, [data?.tripDate?.date]);

  if (isLoading) return <SpinnerLoading />;
  if (!data) {
    return (
      <NotFoundCard
        mainHeading="Booking Tidak Ditemukan"
        subHeading="Maaf, riwayat booking yang anda cari tidak dapat ditemukan"
        redirect="/profile"
        redirectButtonText="Lihat riwayat booking"
      />
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 antialiased pb-24 md:pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Back Link */}
        <Link
          href="/profile"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-sky-500 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Pesanan
        </Link>

        {/* Dynamic Top Banner */}
        {isLunas ? (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-5 md:p-8 mb-6 md:mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden text-left">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
            <div className="flex flex-col gap-3">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs md:text-sm w-max border border-emerald-100">
                <CheckCircle className="w-4 h-4 text-emerald-500 mr-1.5" />
                Pembayaran Lunas
              </div>
              <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-12">
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-1">
                    Total Dibayar
                  </p>
                  <p className="text-2xl md:text-3xl font-black text-slate-900 leading-none">
                    {formatRupiah(totalPaid)}
                  </p>
                </div>
                <div className="hidden md:block w-px h-10 bg-slate-200" />
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-1">
                    Tanggal Pembayaran
                  </p>
                  <p className="text-sm md:text-base font-semibold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    {latestPaidPayment
                      ? dayjs(latestPaidPayment.createdAt).format("D MMMM YYYY")
                      : fallbackTripDateString}
                  </p>
                </div>
              </div>
            </div>

            {/* TODO: enable when invoice has been finalized */}
            <div className="flex w-full md:w-auto mt-2 md:mt-0">
              <button
                onClick={handlePrintInvoice}
                className="cursor-pointer w-full md:w-auto bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-sky-500/10 flex items-center justify-center gap-2 text-sm border-0"
              >
                <FileText className="w-4 h-4" /> Lihat & Unduh Invoice
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-5 md:p-8 mb-6 md:mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden text-left">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500" />
            <div className="flex flex-col gap-3">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-700 font-semibold text-xs md:text-sm w-max border border-orange-100">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5 animate-pulse" />
                {pendingAdditionalPayment && !isExpired
                  ? `Menunggu Pembayaran Tambahan (${formattedTime})`
                  : repaymentPastDueDate ||
                      hasExpiredDP ||
                      (hasExpiredRepayment && !isRepaymentEligible) ||
                      hasExpiredFullPayment
                    ? allowOverdueRepayment
                      ? "Menunggu Pelunasan (Admin Mengizinkan Keterlambatan)"
                      : "Batas Waktu Pembayaran Terlewati"
                    : pendingPayment?.xenditInvoiceUrl && !isExpired
                      ? data?.paymentScheme === "DP"
                        ? isDpPaidDetail
                          ? `Menunggu Pembayaran Pelunasan (${formattedTime})`
                          : `Menunggu Pembayaran DP (${formattedTime})`
                        : `Menunggu Pembayaran (${formattedTime})`
                      : data?.paymentScheme === "DP"
                        ? isDpPaidDetail
                          ? "Menunggu Pembayaran Pelunasan"
                          : "Menunggu Pembayaran DP"
                        : "Menunggu Pembayaran"}
              </div>
              <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-12">
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-1">
                    Sisa Pembayaran
                  </p>
                  <p className="text-2xl md:text-3xl font-black text-slate-900 leading-none">
                    {formatRupiah(sisaPembayaran)}
                  </p>
                </div>
                <div className="hidden md:block w-px h-10 bg-slate-200" />
                {data?.paymentScheme === "DP" && (
                  <div>
                    <p className="text-xs text-slate-400 font-medium mb-1">
                      Jatuh Tempo Pembayaran
                    </p>
                    <p className="text-sm md:text-base font-semibold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {/* {fallbackTripDateString} */}
                      <span className="font-semibold text-gray-600">
                        {dayjs(data.tripDate.date).subtract(data?.trip?.dpRepaymentDaysBefore ?? 7, "day").format("D MMMM YYYY")}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-2 md:mt-0">
              <button
                onClick={handlePrintInvoice}
                className="cursor-pointer w-full md:w-auto bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-6 rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <FileText className="w-4 h-4 text-slate-400" /> Lihat Tagihan
              </button>

              {!repaymentPastDueDate &&
                !hasExpiredDP &&
                (pendingPayment ||
                  (hasExpiredRepayment && isRepaymentEligible) ||
                  (allowOverdueRepayment && expiredRepayment)) && (
                  <button
                    onClick={() => {
                      const targetPayment = pendingPayment || expiredRepayment;
                      if (
                        data?.paymentScheme === "DP" &&
                        targetPayment?.orderId?.endsWith("-FINAL") &&
                        !targetPayment?.xenditInvoiceUrl
                      ) {
                        setSelectedRepaymentPayment(targetPayment);
                        setIsRepaymentModalOpen(true);
                      } else if (targetPayment?.xenditInvoiceUrl) {
                        if (targetPayment.status === "EXPIRED") {
                          setSelectedRepaymentPayment(targetPayment);
                          setIsRepaymentModalOpen(true);
                        } else {
                          window.open(targetPayment.xenditInvoiceUrl, "_blank");
                        }
                      }
                    }}
                    className="cursor-pointer w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 text-sm border-0"
                  >
                    Bayar Tagihan <ArrowRight className="w-4 h-4" />
                  </button>
                )}
            </div>
          </div>
        )}

        {/* 2 Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Left Column */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            {/* Trip Information Card */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-5 md:p-6 text-left">
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="w-full sm:w-44 h-44 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 relative bg-slate-200">
                  {data?.trip?.image && (
                    <Image
                      src={data.trip.image}
                      alt={data.trip.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div
                    className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider shadow-md backdrop-blur-md z-10 ${
                      data?.tripDate?.isGuarantee
                        ? "bg-orange-600/90 text-white border border-orange-300/30"
                        : "bg-sky-600/90 text-white border border-sky-300/30"
                    }`}
                  >
                    {data?.tripDate?.isGuarantee ? "Private Trip" : "Open Trip"}
                  </div>
                </div>
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h2 className="text-lg md:text-xl font-extrabold text-slate-900 leading-snug mb-1.5">
                      {data?.trip?.title}
                    </h2>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />{" "}
                      {data?.trip?.location}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">
                        Tanggal Perjalanan
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {fallbackTripDateString}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-sky-50 text-sky-600 px-3.5 py-1.5 rounded-lg text-xs font-bold border border-sky-100/50">
                        {totalPaxCount || 1} Peserta
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Details */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden text-left">
              <div className="p-5 md:p-6 border-b border-slate-100">
                <h3 className="text-sm sm:text-base font-bold text-slate-950 flex items-center gap-2">
                  <Receipt className="w-4.5 h-4.5 text-slate-400" /> Rincian
                  Harga
                </h3>
              </div>

              <div className="p-5 md:p-6 bg-slate-50/40">
                <div className="space-y-4">
                  {/* Trip details lines */}
                  {sortedItems
                    ?.filter(
                      (item: any) =>
                        item.name === data?.trip?.title ||
                        item.name.startsWith(data?.trip?.title + " (") ||
                        (data?.trip?.title &&
                          item.name.includes(data.trip.title)) ||
                        item.name.startsWith("Add Participant") ||
                        item.name.startsWith("Penambahan peserta") ||
                        item.name.startsWith("Down Payment") ||
                        item.name.startsWith("Pelunasan") ||
                        item.name.startsWith("Biaya Layanan Transaksi"),
                    )
                    .map((tripItem: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-start text-xs sm:text-sm"
                      >
                        <div>
                          <p className="font-bold text-slate-800">
                            {tripItem.name}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {formatRupiah(tripItem.price)}{" "}
                            {tripItem?.name?.includes("Down Payment") ||
                            tripItem?.name?.includes("Pelunasan")
                              ? null
                              : `× ${tripItem.quantity} Pax`}
                          </p>
                        </div>
                        <p className="font-mono font-semibold text-slate-700">
                          {formatRupiah(tripItem.price * tripItem.quantity)}
                        </p>
                      </div>
                    ))}

                  {/* Layanans consolidated */}
                  {consolidatedAdditionals?.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-start text-xs sm:text-sm"
                    >
                      <div>
                        <p className="font-semibold text-slate-600">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {formatRupiah(item.price)} × {item.quantity} Qty
                        </p>
                      </div>
                      <p className="font-mono font-medium text-slate-600">
                        {formatRupiah(
                          Number(item.price) * Number(item.quantity),
                        )}
                      </p>
                    </div>
                  ))}

                  {/* Unique code line */}
                  {uniqueNumber && (
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <div>
                        <p className="font-medium text-slate-500">
                          Kode Unik Pembayaran
                        </p>
                      </div>
                      <p className="font-mono font-medium text-slate-600">
                        {formatRupiah(uniqueNumber.price)}
                      </p>
                    </div>
                  )}

                  {/* Promo Potongan */}
                  {sortedItems
                    ?.filter(
                      (item: any) =>
                        item.name.startsWith("Promo:") ||
                        item.name.startsWith("Voucher"),
                    )
                    .map((promo: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-xs sm:text-sm text-emerald-600 font-medium"
                      >
                        <p>{promo.name}</p>
                        <p className="font-mono">
                          -{" "}
                          {formatRupiah(Math.abs(promo.price * promo.quantity))}
                        </p>
                      </div>
                    ))}

                  <div className="border-t border-dashed border-slate-200 my-2" />

                  <div className="flex justify-between items-center text-sm sm:text-base font-black text-slate-900">
                    <p>Total Tagihan ({totalPaxCount} Pax)</p>
                    <p className="font-mono">
                      {formatRupiah(activeTotalAmount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tagihan Summary Bottom */}
              {isLunas ? (
                <div className="p-5 md:p-6 bg-emerald-50/50 border-t border-emerald-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider mb-0.5">
                        Status
                      </p>
                      <p className="text-xs font-bold text-emerald-800">
                        LUNAS SEPENUHNYA
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-emerald-600 font-medium mb-0.5">
                      Sisa Pembayaran
                    </p>
                    <p className="text-base font-bold text-emerald-700">Rp0</p>
                  </div>
                </div>
              ) : (
                <div className="p-5 md:p-6 bg-white border-t border-slate-100 space-y-4">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <p className="text-slate-500 font-medium">Sudah Dibayar</p>
                    <p className="text-emerald-600 font-bold">
                      - {formatRupiah(totalPaid)}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50/80 rounded-xl border border-orange-100 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-0.5">
                        Sisa Tagihan
                      </p>
                      {(() => {
                        const isDpPaid = data?.payment?.details?.some(
                          (p: any) =>
                            p.status === "PAID" &&
                            (p.orderId?.endsWith("-DP") ||
                              p.rawResponse?.metadata?.paymentType ===
                                "DOWN_PAYMENT"),
                        );
                        const isRepaymentPaid = data?.payment?.details?.some(
                          (p: any) =>
                            p.status === "PAID" &&
                            (p.orderId?.endsWith("-FINAL") ||
                              p.rawResponse?.metadata?.paymentType === "FINAL"),
                        );
                        if (
                          data?.paymentScheme === "DP" &&
                          isDpPaid &&
                          !isRepaymentPaid &&
                          data?.tripDate?.date
                        ) {
                          const deadlineDate = dayjs(data.tripDate.date).subtract(data?.trip?.dpRepaymentDaysBefore ?? 7, "day");
                          const isOverdue = dayjs().isAfter(deadlineDate.endOf("day"));
                          return (
                            <p
                              className={`text-[10px] font-bold ${isOverdue && !allowOverdueRepayment ? "text-red-600" : isOverdue && allowOverdueRepayment ? "text-amber-600" : "text-red-600"}`}
                            >
                              Batas Pelunasan:{" "}
                              {deadlineDate.format("DD MMM YYYY")}
                              {isOverdue &&
                                allowOverdueRepayment &&
                                " ⚠ (Terlewati – Diizinkan Admin)"}
                            </p>
                          );
                        }
                        return (
                          <p className="text-[9px] text-orange-500">
                            Bayar sebelum trip berangkat
                          </p>
                        );
                      })()}
                    </div>
                    <p className="text-lg font-black text-orange-700 font-mono">
                      {formatRupiah(sisaPembayaran)}
                    </p>
                  </div>
                </div>
              )}

              {canOrderAdditional && availableAdditionals.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-5 md:p-6 text-left mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-800">
                      Layanan Tambahan (Opsional)
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {availableAdditionals.map((item: any) => {
                      const quantity =
                        additionalQuantities.find(
                          (q) => q.additionalId === item.additionalId,
                        )?.quantity ?? 0;
                      const isDisabledDecrease = quantity <= 0;
                      const isDisabledIncrease = quantity >= maxQuantity;

                      return (
                        <div
                          key={item.additionalId}
                          className={`flex items-center justify-between gap-4 rounded-xl px-4 py-3.5 border transition-all duration-150 ${
                            quantity > 0
                              ? "border-[#1F548C] bg-white shadow-sm"
                              : "border-slate-100 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${quantity > 0 ? "bg-[#1F548C]" : "bg-blue-50/50"}`}
                            >
                              <Package
                                className={`w-6 h-6 ${quantity > 0 ? "text-white" : "text-[#1F548C]"}`}
                              />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-sm font-bold text-slate-800 truncate">
                                {item.name}
                              </p>
                              <p className="text-xs font-bold text-[#1F548C] mt-0.5">
                                {formatRupiah(item.promoPrice ?? item.price)}
                                <span className="text-slate-400 font-normal">
                                  {" "}
                                  / {item.unit.toLowerCase()}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 border border-slate-200 rounded-xl px-2 py-1.5 bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                handleDecreaseAdditional(item.additionalId)
                              }
                              disabled={isDisabledDecrease}
                              className={`
                                size-6 rounded-md flex items-center justify-center
                                transition-all duration-150 active:scale-95
                                ${
                                  isDisabledDecrease
                                    ? "text-slate-300 cursor-not-allowed"
                                    : "text-slate-800 hover:bg-slate-100 cursor-pointer"
                                }
                              `}
                            >
                              <Minus className="size-3" strokeWidth={2.5} />
                            </button>

                            <span
                              className={`w-3 text-center text-[15px] font-bold tabular-nums text-slate-800`}
                            >
                              {quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                handleIncreaseAdditional(item.additionalId)
                              }
                              disabled={isDisabledIncrease}
                              className={`
                                size-6 rounded-md flex items-center justify-center
                                transition-all duration-150 active:scale-95
                                ${
                                  isDisabledIncrease
                                    ? "text-slate-300 cursor-not-allowed"
                                    : "text-slate-800 hover:bg-slate-100 cursor-pointer"
                                }
                              `}
                            >
                              <Plus className="size-3" strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {hasSelectedAdditionalItems && (
                    <div className="mt-4 p-4 bg-[#FFFAF0] rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 border border-[#FFEDD5]">
                      <div>
                        <p className="text-xs text-orange-500 font-bold mb-1">
                          Total Layanan Tambahan
                        </p>
                        <p className="text-lg sm:text-xl font-black text-slate-800">
                          {formatRupiah(additionalTotalPrice)}
                        </p>
                      </div>
                      <button
                        onClick={() => setIsOrderAdditionalModalOpen(true)}
                        className="bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer border-0 w-full sm:w-auto"
                      >
                        Bayar Tambahan <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
              {pendingAdditionalPayment && (
                <div className="p-5 md:p-6 bg-amber-50 border-t border-amber-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-amber-800">
                      Menunggu Pembayaran Layanan Tambahan
                    </p>
                    <p className="text-[10px] text-amber-600 mt-0.5">
                      Selesaikan pembayaran untuk layanan tambahan Anda.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      window.open(
                        pendingAdditionalPayment.xenditInvoiceUrl,
                        "_blank",
                      )
                    }
                    className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-xl transition-all text-xs"
                  >
                    Bayar Sekarang
                  </button>
                </div>
              )}
            </div>

            {/* Riwayat Pembayaran Timeline */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-5 md:p-6 text-left">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-slate-400" /> Riwayat
                Pembayaran
              </h3>

              <div className="ml-2">
                {sortedPaymentDetails.map((p, idx) => {
                  let displayStatus = p.status;
                  if (hasExpiredDP && p.orderId?.endsWith("-FINAL")) {
                    displayStatus = "EXPIRED";
                  }

                  // Only force EXPIRED on the timeline if the admin has NOT allowed overdue repayment
                  if (
                    repaymentPastDueDate &&
                    displayStatus !== "PAID" &&
                    displayStatus !== "SUCCESS" &&
                    !allowOverdueRepayment
                  ) {
                    displayStatus = "EXPIRED";
                  }

                  const pLunas =
                    displayStatus === "PAID" || displayStatus === "SUCCESS";
                  const config = getPaymentStatusConfig(displayStatus);
                  const isLast = idx === sortedPaymentDetails.length - 1;
                  const isPelunasan = p.orderId?.endsWith("-FINAL");

                  return (
                    <div
                      key={p.id || idx}
                      className={`relative pl-7 border-l-2 ${isLast ? "border-transparent pb-0" : "border-slate-200 pb-8"}`}
                    >
                      {/* Timeline dot marker */}
                      <div
                        className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full flex items-center justify-center ${
                          pLunas
                            ? "bg-emerald-500 border-4 border-white"
                            : displayStatus === "EXPIRED"
                              ? "bg-red-500 border-4 border-white"
                              : "border-2 border-amber-500 bg-white"
                        }`}
                      >
                        {pLunas ? (
                          <Check className="text-white w-2.5 h-2.5 stroke-[4]" />
                        ) : displayStatus === "EXPIRED" ? (
                          <X className="text-white w-2.5 h-2.5 stroke-[4]" />
                        ) : (
                          <div className="w-2 h-2 bg-amber-500 rounded-full" />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {/* Row 1: Title & Amount */}
                        <div className="flex justify-between items-center gap-4">
                          <p className="text-base font-bold text-slate-900">
                            {p.orderId?.startsWith("TB-ADDL-")
                              ? "Layanan Tambahan"
                              : p.orderId?.startsWith("TB-ADD-")
                                ? "Penambahan Peserta"
                                : p.orderId?.endsWith("-FINAL")
                                  ? "Pelunasan Utama"
                                  : data?.paymentScheme === "FULL"
                                    ? "Pembayaran Penuh"
                                    : "Down Payment (DP)"}
                          </p>
                          <p className="text-base sm:text-lg font-bold text-slate-900 font-mono">
                            {formatRupiah(
                              p.finalPrice || p.grossAmount || p.amount,
                            )}
                          </p>
                        </div>

                        {/* Row 2: Subtitle & Status Badge */}
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <div className="text-xs sm:text-sm text-slate-500">
                            {isPelunasan && data?.tripDate?.date ? (
                              <span>
                                {dayjs(data.tripDate.date)
                                  .subtract(data?.trip?.dpRepaymentDaysBefore ?? 7, "day")
                                  .format("D MMM YYYY")}
                                {" • 23:59 WIB "}
                                <span className="text-amber-600 font-bold">
                                  (H-{data?.trip?.dpRepaymentDaysBefore ?? 7} Trip Berangkat)
                                </span>
                              </span>
                            ) : (
                              <span>
                                {dayjs(p.createdAt).format(
                                  "D MMM YYYY • HH:mm WIB",
                                )}
                              </span>
                            )}
                          </div>

                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                              pLunas
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : displayStatus === "EXPIRED"
                                  ? "bg-red-50 text-red-600 border-red-100"
                                  : "bg-amber-50 text-amber-700 border-amber-200/60"
                            }`}
                          >
                            {!pLunas &&
                            displayStatus !== "EXPIRED" &&
                            isPelunasan
                              ? "MENUNGGU PEMBAYARAN"
                              : config.label}
                          </span>
                        </div>

                        {/* Info Banner Box for Pelunasan */}
                        {isPelunasan && (
                          <div className="bg-[#fff8f0] border border-amber-200/80 p-3 sm:p-3.5 rounded-xl flex items-start sm:items-center gap-3 mt-3">
                            <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 font-serif font-bold text-[10px]">
                              i
                            </div>
                            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                              Pelunasan juga bisa dilakukan sewaktu-waktu
                              sebelum tanggal jatuh tempo agar rencana
                              perjalanan lancar.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PIC Data Section */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden text-left mb-6">
              <div className="p-5 md:p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Data Pemesan (PIC)
                </h3>
              </div>
              <div className="p-5 md:p-6 bg-white">
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-500 flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                        {data?.personInCharge?.fullName ||
                          data?.user?.name ||
                          "-"}
                      </h4>
                      <p className="text-xs text-slate-500 mb-0.5">
                        {data?.personInCharge?.email ||
                          (data?.user as any)?.email ||
                          "-"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {data?.personInCharge?.phoneNumber ||
                          data?.user?.phone ||
                          "-"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider whitespace-nowrap ${isPicParticipating ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-600 border-slate-200"}`}
                  >
                    {isPicParticipating ? "Ikut" : "Tidak Ikut"}
                  </span>
                </div>
              </div>
            </div>

            {/* Collapsible Participants */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden text-left mb-6">
              <div className="p-5 md:p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 text-white">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Identitas Peserta ({activeParticipants.length} Orang)
                </h3>
              </div>
              <div className="p-5 md:p-6 bg-white">
                {incompleteParticipants.length > 0 &&
                !isPaymentExpired &&
                !isPastH1 ? (
                  <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-orange-800">
                        Harap lengkapi identitas{" "}
                        <span className="font-bold">
                          {incompleteParticipants.length} peserta
                        </span>{" "}
                        di bawah ini.
                      </p>
                      <p className="text-sm text-orange-800 mt-1">
                        Data diperlukan untuk keperluan manifest perjalanan dan
                        asuransi.
                      </p>
                    </div>
                  </div>
                ) : incompleteParticipants.length === 0 ? (
                  <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="text-sm font-bold text-emerald-700">
                      Seluruh Data Peserta Telah Lengkap
                    </p>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeParticipants.map((bp: any, idx: number) => (
                    <ParticipantCard
                      key={bp.id || idx}
                      item={bp}
                      index={idx}
                      onEdit={
                        !isPastH1 &&
                        !isPaymentExpired &&
                        bp.status !== "EXPIRED" &&
                        data?.tripDate?.status !== "cancel"
                          ? () => {
                              setParticipantToEdit(bp);
                              setIsCompleteParticipantModalOpen(true);
                            }
                          : undefined
                      }
                    />
                  ))}
                </div>

                {/* Add participant button */}
                {data?.tripDate?.status === "pending" &&
                  data?.tripDate?.isGuarantee &&
                  !isPaymentExpired &&
                  !pendingPayment && (
                    <button
                      onClick={() => setIsAddParticipantModalOpen(true)}
                      className="cursor-pointer w-full mt-6 p-4 rounded-2xl border-2 border-dashed border-sky-200 text-sky-600 font-bold hover:bg-sky-50/50 hover:border-sky-400 transition-all flex items-center justify-center gap-2 bg-transparent"
                    >
                      <Users className="w-5 h-5" />
                      Tambah Peserta Lainnya
                    </button>
                  )}
              </div>
            </div>

            {/* Expired Participants Section */}
            {expiredParticipants.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden text-left mb-6">
                <div className="p-5 md:p-6 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Peserta Expired ({expiredParticipants.length} Orang)
                  </h3>
                </div>
                <div className="p-5 md:p-6 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {expiredParticipants.map((bp: any, idx: number) => (
                      <ParticipantCard
                        key={bp.id || idx}
                        item={bp}
                        index={activeParticipants.length + idx}
                        onEdit={undefined}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Important Notes */}
            <div className="bg-sky-50/50 rounded-2xl border border-sky-100 p-5 md:p-6 text-left">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Info className="w-4.5 h-4.5 text-sky-500" /> Informasi Penting
              </h3>
              <ul className="text-xs sm:text-sm text-slate-600 space-y-2 list-disc pl-5">
                <li>
                  E-Tiket dan detail titik kumpul (meeting point) akan
                  dikirimkan H-3 sebelum keberangkatan ke alamat email utama.
                </li>
                <li>
                  Harap membawa identitas asli (KTP/Paspor) sesuai data peserta
                  saat hari keberangkatan.
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column Sticky Sidebar */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24 space-y-5 text-left">
              {/* Trip Decision Status */}
              {!isPaymentExpired &&
                (() => {
                  const theme = getTripDepartureStatusTheme(
                    data?.tripDate?.status,
                  );
                  const StatusIcon = theme.icon;

                  return (
                    <div
                      className={`rounded-2xl border ${theme.borderColor} ${theme.cardBg} ${theme.glowEffect} p-5 relative overflow-hidden transition-all duration-300`}
                    >
                      {/* Top Accent Bar */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1.5 ${theme.topBarGradient}`}
                      />

                      {/* Header with Icon & Status Label */}
                      <div className="flex items-center gap-3 mb-3.5">
                        <div
                          className={`w-9 h-9 rounded-xl ${theme.iconBg} flex items-center justify-center shrink-0 shadow-xs`}
                        >
                          <StatusIcon className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Status Keberangkatan
                          </p>
                          <h4
                            className={`text-sm md:text-base font-extrabold tracking-tight leading-tight mt-0.5 ${theme.titleColor}`}
                          >
                            {renderTripStatusLabel(data?.tripDate?.status)}
                          </h4>
                        </div>
                      </div>

                      {/* Description Container */}
                      <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3.5 border border-white/80 shadow-xs">
                        <p
                          className={`text-xs ${theme.descColor} leading-relaxed font-semibold`}
                        >
                          {renderTripStatusDescription(data?.tripDate?.status)}
                        </p>
                      </div>
                    </div>
                  );
                })()}

              {/* Feedback Section (Sidebar Entry Point) */}
              {canShowFeedback && (
                <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 text-left">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <h4 className="text-sm font-bold text-slate-900">
                      Bantu Mindies Jadi Lebih Baik
                    </h4>
                    <button
                      onClick={() => setIsOpenFeedback((prev) => !prev)}
                      className="w-7 h-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors border-0 bg-transparent cursor-pointer"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${isOpenFeedback ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpenFeedback
                        ? "max-h-[300px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                      Gimana pengalaman kamu trip bersama Travel Buddies? Kasih
                      review yuk!
                    </p>
                    <div className="flex items-center justify-between gap-1">
                      {emojiRatings.map((emoji, idx) => (
                        <Link
                          key={idx}
                          href={`/booking/${id}/feedback`}
                          className="p-2 rounded-xl bg-slate-50 hover:bg-sky-50 hover:scale-110 transition-all duration-300 flex flex-col items-center gap-1 group border border-slate-100 flex-1"
                        >
                          <emoji.icon className="w-5 h-5 text-slate-400 group-hover:text-sky-500 transition-colors" />
                          <span className="text-[8px] font-bold text-slate-400 group-hover:text-sky-600 transition-colors uppercase tracking-wider">
                            {emoji.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Documentation Section (Sidebar Entry Point) */}
              {Boolean(data?.averageRating || data?.hasFeedback) && (
                <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 text-left">
                  <div className="text-center py-2 border-b border-slate-100 mb-3">
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {data?.averageRating || data?.hasFeedback
                        ? "Terima kasih atas ulasanmu!"
                        : "Dokumentasi Perjalanan"}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {data?.averageRating || data?.hasFeedback
                        ? "Dokumentasi foto perjalananmu sudah siap diunduh di bawah ini."
                        : "Dokumentasi foto perjalanan tersedia di bawah ini."}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {docLinks.length > 0 ? (
                      docLinks.map((doc: string, idx: number) => {
                        const link = doc.startsWith("http")
                          ? doc
                          : `https://${doc}`;
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-2 justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                Dokumentasi #{idx + 1}
                              </p>
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-sky-600 truncate block hover:underline"
                              >
                                {link}
                              </a>
                            </div>
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors border-0 shrink-0"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                          <Info className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          Dokumentasi sedang diproses
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Mindies sedang upload file dokumentasi. Cek berkala
                          ya!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Refund Guarantee */}
              <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1">
                    Garansi Refund 100%
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Jika kuota trip tidak terpenuhi atau dibatalkan
                    penyelenggara, dana akan dikembalikan sepenuhnya maksimal{" "}
                    <strong>H+3 hari kerja</strong>.
                  </p>
                </div>
              </div>

              {/* Help WhatsApp */}
              <div className="bg-gradient-to-br from-[#128C7E] to-[#075E54] rounded-xl shadow-md p-5 text-white">
                <h4 className="text-sm font-extrabold mb-1">Butuh Bantuan?</h4>
                <p className="text-xs text-white/80 mb-4">
                  Tim Customer Support Travel Buddies siap melayani kendalamu.
                </p>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white text-[#075E54] hover:bg-slate-50 font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs border-0 no-underline cursor-pointer"
                >
                  Hubungi WhatsApp Admin
                </a>
              </div>

              {/* Share */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 text-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs border border-slate-100 text-sky-500">
                  <Share2 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">
                  Berangkat Bareng Teman?
                </h4>
                <p className="text-[11px] text-slate-400 mb-4">
                  Bagikan rincian pesanan trip ini ke peserta lain.
                </p>
                <button
                  onClick={handleShare}
                  className="cursor-pointer w-full bg-white border border-slate-300 hover:border-sky-500 hover:text-sky-600 text-slate-600 font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs"
                >
                  Bagikan Rincian Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Action Bar */}
      {!isLunas && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-6 z-40 shadow-lg flex justify-between items-center gap-4 text-left">
          <div className="flex-1">
            <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider mb-0.5">
              Sisa Tagihan
            </p>
            <p className="text-lg font-black text-slate-900 leading-none font-mono">
              {formatRupiah(sisaPembayaran)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrintInvoice}
              className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold w-12 h-12 rounded-xl transition-all flex items-center justify-center flex-shrink-0 border-0"
            >
              <FileText className="w-5 h-5" />
            </button>
            {!repaymentPastDueDate &&
              !hasExpiredDP &&
              (pendingPayment || (hasExpiredRepayment && isRepaymentEligible) || (allowOverdueRepayment && expiredRepayment)) && (
                <button
                  onClick={() => {
                    const targetPayment = pendingPayment || expiredRepayment;
                    if (
                      data?.paymentScheme === "DP" &&
                      targetPayment?.orderId?.endsWith("-FINAL") &&
                      !targetPayment?.xenditInvoiceUrl
                    ) {
                      setSelectedRepaymentPayment(targetPayment);
                      setIsRepaymentModalOpen(true);
                    } else if (targetPayment?.xenditInvoiceUrl) {
                      if (targetPayment.status === "EXPIRED") {
                        setSelectedRepaymentPayment(targetPayment);
                        setIsRepaymentModalOpen(true);
                      } else {
                        window.open(targetPayment.xenditInvoiceUrl, "_blank");
                      }
                    }
                  }}
                  className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-5 rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-1 text-xs border-0"
                >
                  Bayar Tagihan <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
          </div>
        </div>
      )}

      {/* Add Participant Modal */}
      <AddParticipantModal
        isOpen={isAddParticipantModalOpen}
        onClose={() => setIsAddParticipantModalOpen(false)}
        bookingId={id}
        meetingPoints={meetingPoints}
        trip={data?.trip}
        onSuccess={(invoiceUrl) => {
          window.open(invoiceUrl, "_blank");
        }}
      />



      {/* Repayment Modal */}
      <RepaymentModal
        isOpen={isRepaymentModalOpen}
        onClose={() => setIsRepaymentModalOpen(false)}
        booking={data}
        payment={selectedRepaymentPayment}
      />
      <CompleteParticipantModal
        isOpen={isCompleteParticipantModalOpen}
        onClose={() => {
          setIsCompleteParticipantModalOpen(false);
          setParticipantToEdit(null);
        }}
        bookingId={id}
        meetingPoints={meetingPoints}
        incompleteParticipants={
          participantToEdit ? [participantToEdit] : incompleteParticipants
        }
      />
      <OrderAdditionalModal
        isOpen={isOrderAdditionalModalOpen}
        onClose={() => setIsOrderAdditionalModalOpen(false)}
        booking={data}
        additionalQuantities={additionalQuantities}
        setAdditionalQuantities={setAdditionalQuantities}
        consolidatedAdditionals={consolidatedAdditionals}
      />
    </div>
  );
}
