"use client";

import { formatRupiah } from "@/lib/format-rupiah";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  CreditCard,
  User,
  Phone,
  Mail,
  CreditCard as IdCardIcon,
  Cake,
  CheckCircle2,
  ExternalLink,
  Receipt,
  ChevronRight,
  XCircle,
  RefreshCw,
  Loader2,
  Link2,
  Gift,
  TrendingDown,
  CircleCheck,
  Timer,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  UserRound,
  ShieldCheck,
  Share2,
  CircleArrowRight,
  Angry,
  Frown,
  Annoyed,
  Smile,
  Laugh,
  ArrowRight,
  Download,
  Plus,
  Minus,
  Info,
  Building2,
  Wallet,
  Hourglass,
  Smartphone,
  Check,
  Ban,
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
import BadgeStatusTrip from "@/components/sections/BadgeStatusTrip";
import { StatusPayment } from "@/components/sections/StatusPayment";
import dayjs from "dayjs";
import "dayjs/locale/id";
import NotFoundCard from "@/components/sections/NotFoundCard";
import toast from "react-hot-toast";
dayjs.locale("id");

function ParticipantCard({ item }: { item: any }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-gray-100 p-2 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <div className="relative">
            <UserRound
              fill={item.status === "CONFIRMED" ? "blue" : "#9ca3af"}
              stroke="none"
              size={30}
              className={`p-1 rounded-lg ${item.status === "CONFIRMED" ? "bg-blue-100" : "bg-gray-200"}`}
            />
            {item.status !== "CONFIRMED" && (
              <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 border border-white">
                <Clock className="w-2 h-2 text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1
                className={`font-bold text-sm ${item.status === "CONFIRMED" ? "text-gray-900" : "text-gray-400 italic"}`}
              >
                {item.participant.name}
              </h1>
              {item.status !== "CONFIRMED" && (
                <span
                  className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${item.status === "EXPIRED"
                    ? "bg-red-50 text-red-600 border-red-100"
                    : "bg-amber-50 text-amber-600 border-amber-100"
                    }`}
                >
                  {item.status === "EXPIRED" ? "Expired" : "Pending"}
                </span>
              )}
            </div>
            {item.label === "pic" && (
              <span className="text-[10px] font-semibold text-blue-500 bg-blue-100 px-1.5 py-0.5 rounded-full">
                PIC
              </span>
            )}
          </div>
        </div>
        <button onClick={() => setIsOpen((prev) => !prev)}>
          <ChevronDown
            className={`transition-transform duration-300 cursor-pointer ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Detail */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="text-xs text-gray-500 pl-2 space-y-2 mt-3 pb-1">
          <div className="flex items-center gap-x-1">
            <Mail size={16} />
            <p>{item.participant.email}</p>
          </div>
          <div className="flex items-center gap-x-1">
            <Phone size={16} />
            <p>{item.participant.phone}</p>
          </div>
          <div className="flex items-center gap-x-1">
            <MapPin size={16} />
            <p>
              {item?.meetingPoints?.location} ·{" "}
              {item?.meetingPoints?.time ? item?.meetingPoints?.time : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddParticipantModal({
  isOpen,
  bookingId,
  meetingPoints,
  onSuccess,
  trip,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  meetingPoints: any[];
  onSuccess: (invoiceUrl: string) => void;
  trip: any;
}) {
  const [participants, setParticipants] = useState<any[]>([
    {
      name: "",
      email: "",
      phone: "",
      noKtp: "",
      gender: "",
      dateOfBirth: "",
      meetingPointId: meetingPoints?.[0]?.id || "",
    },
  ]);

  interface NormalizedAdditional {
    additionalId: number;
    name: string;
    unit: string;
    basePrice: number;
    price: number;
    promoPrice: number | null;
    isRequired: boolean;
  }

  const [additionalQuantities, setAdditionalQuantities] = useState<any[]>([]);

  const normalizeAdditionals = (trip: any): NormalizedAdditional[] => {
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

    return tripAdditionals.map((item: any) => {
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

  const hasAdditionals = useMemo(() => normalizeAdditionals(trip), [trip]);

  useEffect(() => {
    if (!hasAdditionals?.length) return;

    setAdditionalQuantities((prev) => {
      return (hasAdditionals as NormalizedAdditional[]).map((item) => {
        const existing = prev.find(
          (p) => p?.additionalId === item?.additionalId,
        );
        const isRequired = item?.isRequired;
        const maxParticipant = participants.length;

        return {
          name: item?.name,
          additionalId: item?.additionalId,
          quantity: isRequired
            ? maxParticipant
            : Math.min(existing?.quantity ?? 0, maxParticipant),
          price: item?.promoPrice ?? item.price,
        };
      });
    });
  }, [hasAdditionals, participants.length]);

  const handleIncreaseAdditional = (id: number) => {
    setAdditionalQuantities((prev) =>
      prev.map((item) =>
        item?.additionalId === id
          ? { ...item, quantity: item?.quantity + 1 }
          : item,
      ),
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

  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const paymentMethods = [
    {
      id: "va",
      name: "Virtual Account",
      icon: Building2,
      banks: [
        { id: "BCA", name: "BCA", image: "/images/payment-method/bca.png" },
        {
          id: "MANDIRI",
          name: "Mandiri",
          image: "/images/payment-method/mandiri.png",
        },
        { id: "BNI", name: "BNI", image: "/images/payment-method/bni.png" },
        { id: "BRI", name: "BRI", image: "/images/payment-method/bri.png" },
        {
          id: "SAHABAT_SAMPOERNA",
          name: "Sahabat Sampoerna",
          image: "/images/payment-method/sampoerna.png",
        },
        {
          id: "PERMATA",
          name: "Permata",
          image: "/images/payment-method/permata.png",
        },
        {
          id: "CIMB",
          name: "CIMB Niaga",
          image: "/images/payment-method/cimb-niaga.png",
        },
      ],
    },
    {
      id: "ewallet",
      name: "E-Wallet",
      icon: Wallet,
      options: [
        { id: "OVO", name: "OVO", image: "/images/payment-method/ovo.png" },
        {
          id: "ASTRAPAY",
          name: "AstraPay",
          image: "/images/payment-method/astra-pay.png",
        },
      ],
    },
    {
      id: "paylater",
      name: "Paylater",
      icon: Hourglass,
      options: [
        {
          id: "AKULAKU",
          name: "Akulaku",
          image: "/images/payment-method/akulaku.png",
        },
      ],
    },
    {
      id: "QRIS",
      name: "QRIS",
      image: "/images/payment-method/qris.png",
      icon: Smartphone,
    },
    {
      id: "CREDIT_CARD",
      name: "Kartu Kredit/Debit",
      image: "/images/payment-method/visa.png",
      icon: CreditCard,
    },
  ];

  const mutation = useAddParticipants(bookingId);

  const summaryPayload = useMemo(() => {
    return {
      slots: participants.length,
      additional_order: additionalQuantities.filter((a) => a.quantity > 0)?.map(a => {
        const { name, price, ...rest } = a
        return {
          ...rest,
        }
      }),
    };
  }, [participants.length, additionalQuantities]);

  const { data: summaryData, isLoading: isLoadingSummary, error: summaryError } =
    useAddParticipantsSummary(bookingId, summaryPayload);

  useEffect(() => {
    if (meetingPoints?.length > 0 && participants[0].meetingPointId === "") {
      setParticipants([
        { ...participants[0], meetingPointId: meetingPoints[0].id },
      ]);
    }
  }, [meetingPoints]);

  const handleAddPax = () => {
    setParticipants([
      ...participants,
      {
        name: "",
        email: "",
        phone: "",
        noKtp: "",
        gender: "Male",
        dateOfBirth: "",
        meetingPointId: meetingPoints?.[0]?.id || "",
      },
    ]);
  };

  const handleRemovePax = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newParticipants = [...participants];
    newParticipants[index][field] = value;
    setParticipants(newParticipants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPayment) {
      alert("Silakan pilih metode pembayaran");
      return;
    }

    try {
      const res: any = await mutation.mutateAsync({
        participants,
        additional_order: additionalQuantities.filter((a) => a.quantity > 0),
        paymentMethod: selectedPayment,
      });
      if (res.invoiceUrl) {
        onSuccess(res.invoiceUrl);
      }

      // Reset form states
      setParticipants([
        {
          name: "",
          email: "",
          phone: "",
          noKtp: "",
          gender: "",
          dateOfBirth: "",
          meetingPointId: meetingPoints?.[0]?.id || "",
        },
      ]);
      setSelectedPayment(null);
      setExpandedCategory(null);

      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || "Gagal menambahkan peserta");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-5xl sm:max-h-[90vh] sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl text-black">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between bg-blue-50/50">
          <h2 className="text-lg sm:text-xl font-bold text-blue-900">
            Tambah Peserta Baru
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 hover:bg-blue-100 rounded-full transition-colors"
          >
            <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">
          {/* Main Form Scrollable Container */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 lg:border-r lg:border-gray-100"
          >
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                <span className="font-bold">Informasi:</span> Menambahkan peserta
                akan menyesuaikan harga total berdasarkan tier pax terbaru. Anda
                akan menerima invoice baru untuk selisih harganya.
              </p>
            </div>

            {participants.map((p, index) => (
              <div
                key={index}
                className="p-4 sm:p-5 border-2 border-gray-100 rounded-2xl space-y-4 relative bg-white hover:border-blue-200 transition-colors"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-blue-600 flex items-center gap-2 text-sm sm:text-base">
                    <UserRound className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> Peserta #{index + 1}
                  </h3>
                  {participants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePax(index)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-left">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 ml-1">
                      Nama Lengkap
                    </label>
                    <input
                      required
                      placeholder="Contoh: Budi Santoso"
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                      value={p.name}
                      onChange={(e) =>
                        handleChange(index, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 ml-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="email@contoh.com"
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                      value={p.email}
                      onChange={(e) =>
                        handleChange(index, "email", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 ml-1">
                      Nomor WhatsApp
                    </label>
                    <input
                      required
                      placeholder="08xxxxxxxxxx"
                      maxLength={13}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                      value={p.phone}
                      onChange={(e) =>
                        handleChange(index, "phone", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 ml-1">
                      Nomor KTP/KIA/Passport
                    </label>
                    <input
                      required
                      placeholder="16 digit nomor KTP"
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                      value={p.noKtp}
                      maxLength={16}
                      onChange={(e) =>
                        handleChange(index, "noKtp", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 ml-1">
                      Jenis Kelamin
                    </label>
                    <select
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white text-sm"
                      value={p.gender}
                      onChange={(e) =>
                        handleChange(index, "gender", e.target.value)
                      }
                    >
                      <option value="Male">Laki-laki</option>
                      <option value="Female">Perempuan</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 ml-1">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                      value={p.dateOfBirth}
                      onChange={(e) =>
                        handleChange(index, "dateOfBirth", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 ml-1">
                      Meeting Point
                    </label>
                    <select
                      required
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white text-sm"
                      value={p.meetingPointId}
                      onChange={(e) =>
                        handleChange(index, "meetingPointId", e.target.value)
                      }
                    >
                      <option value="" disabled>
                        Pilih Meeting Point
                      </option>
                      {meetingPoints.map((mp: any) => (
                        <option key={mp.id} value={mp.id}>
                          {mp.meetingPoint.location} ({mp.time})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {/* Additionals Section */}
            <div className="bg-white ring-1 ring-gray-200 shadow-sm rounded-2xl p-4 sm:p-5">
              <div className="mb-4 text-left">
                <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-0.5">
                  Additionals
                </p>
              </div>

              {hasAdditionals.length === 0 ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Info className="size-4 shrink-0" strokeWidth={2} />
                  <p className="text-sm">Destinasi tidak memiliki additionals</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {hasAdditionals.map((item) => {
                    const quantity =
                      additionalQuantities.find(
                        (q) => q?.additionalId === item?.additionalId,
                      )?.quantity ?? 0;
                    const isDisabledDecrease = item?.isRequired
                      ? quantity <= 1
                      : quantity <= 0;
                    const isDisabledIncrease = quantity >= participants.length;

                    return (
                      <div
                        key={item?.additionalId}
                        className="group flex items-center justify-between gap-4 rounded-xl px-3 sm:px-4 py-3 ring-1 ring-gray-200 transition-all duration-150"
                      >
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {item?.name}
                            </p>
                            {item?.isRequired && (
                              <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded-md bg-red-50 text-red-500 border border-red-100">
                                Wajib
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-gray-400">
                            {formatRupiah(item?.promoPrice ?? item?.price)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              handleDecreaseAdditional(
                                item?.additionalId,
                                item?.isRequired,
                              )
                            }
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
                            type="button"
                            onClick={() =>
                              handleIncreaseAdditional(item?.additionalId)
                            }
                            disabled={isDisabledIncrease || item?.isRequired}
                            className={`
                              size-8 rounded-xl flex items-center justify-center border
                              transition-all duration-150 active:scale-95
                              ${isDisabledIncrease || item?.isRequired ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed" : "border-gray-300 text-gray-500 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"}
                            `}
                          >
                            <Plus className="size-3.5" strokeWidth={4} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddPax}
              className="cursor-pointer w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              Tambah Peserta Lainnya
            </button>

            {/* Payment Method Selection */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 px-1 text-sm sm:text-base">
                <CreditCard className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-600" />
                Pilih Metode Pembayaran
              </h3>

              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const isSelected = expandedCategory === method.id;
                  const Icon = method.icon;
                  const options = method.banks || method.options;
                  
                  const totalAmount = summaryData ? (summaryData.totalDiffAmount - (summaryData.uniqueNumber || 0)) : 0;
                  const isDisabled = method.id === "QRIS" && totalAmount > 10000000;

                  return (
                    <div key={method.id} className="space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (isDisabled) return;
                          if (options) {
                            setExpandedCategory(isSelected ? null : method.id);
                          } else {
                            setExpandedCategory(null);
                            setSelectedPayment(method.id);
                          }
                        }}
                        disabled={isDisabled}
                        className={`cursor-pointer w-full flex items-center justify-between p-3 sm:p-4 rounded-2xl border-2 transition-all text-left ${isDisabled 
                            ? "opacity-70 bg-gray-50/50 grayscale-[50%] cursor-not-allowed border-gray-200" 
                            : ((options && isSelected) || (!options && selectedPayment === method.id)
                          ? "border-blue-500 bg-blue-50/50 shadow-sm"
                          : "border-gray-100 bg-white hover:border-blue-200")}
                          `}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl ${isDisabled
                                ? "bg-gray-100 text-gray-400"
                                : ((options && isSelected) || (!options && selectedPayment === method.id)
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-500")}
                              `}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                              <span className={`font-bold text-sm sm:text-base ${isDisabled ? "text-gray-400" : "text-gray-900"}`}>
                                {method.name}
                              </span>
                              {isDisabled && (
                                  <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-red-50 text-red-500 text-[10px] font-bold tracking-wide uppercase rounded w-fit">
                                      Maks Transaksi Rp 10 Juta
                                  </span>
                              )}
                          </div>
                        </div>
                        {isDisabled ? (
                            <Ban className="w-5 h-5 text-gray-300" />
                        ) : options ? (
                          <ChevronRight
                            className={`w-5 h-5 text-gray-400 transition-transform ${isSelected ? "rotate-90" : ""}`}
                          />
                        ) : (
                          selectedPayment === method.id && (
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          )
                        )}
                      </button>

                      {options && isSelected && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 p-2 bg-gray-50 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                          {options.map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setSelectedPayment(option.id)}
                              className={`cursor-pointer relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${selectedPayment === option.id
                                ? "border-blue-500 bg-white shadow-md scale-105"
                                : "border-transparent bg-white hover:border-blue-200"
                                }`}
                            >
                              <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                                <Image
                                  src={option.image}
                                  alt={option.name}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <span className="text-[9px] sm:text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                                {option.name}
                              </span>
                              {selectedPayment === option.id && (
                                <div className="absolute top-1 right-1">
                                  <div className="w-3.5 h-3.5 bg-blue-600 rounded-full flex items-center justify-center">
                                    <Check className="w-2 h-2 text-white" />
                                  </div>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Summary preview (Mobile only) */}
            <div className="block lg:hidden bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-100 space-y-6">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base border-b border-gray-200 pb-3 flex items-center gap-2">
                <Receipt className="w-4.5 h-4.5 text-blue-600" /> Ringkasan Pembayaran
              </h3>

              {isLoadingSummary ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-2">
                  <Loader2 className="animate-spin text-blue-600 w-6 h-6" />
                  <p className="text-xs font-semibold text-gray-500">Menghitung rincian harga...</p>
                </div>
              ) : summaryError ? (
                <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" /> Gagal memuat rincian
                  </div>
                  <p>{(summaryError as any).response?.data?.error || "Terjadi kesalahan saat menghitung rincian harga."}</p>
                </div>
              ) : summaryData ? (
                <div className="space-y-4">
                  {/* Breakdown Items */}
                  <div className="space-y-3 text-xs sm:text-sm">
                    {/* Trip Row */}
                    <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 space-y-2 text-left">
                      <div>
                        <p className="font-bold text-gray-900 text-[9px] sm:text-[10px] uppercase tracking-wider text-blue-600">Pemesanan Trip</p>
                        <p className="font-semibold text-gray-800 mt-1 text-xs">{trip?.title}</p>
                      </div>

                      <div className="pt-2 border-t border-dashed border-gray-100 space-y-1 text-[11px] sm:text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Slots Awal ({summaryData.oldSlots} pax)</span>
                          <span>{formatRupiah(summaryData.oldPaxTotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Slots Baru ({summaryData.totalSlots} pax)</span>
                          <span>{formatRupiah(summaryData.newPaxTotal)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-50">
                          <span>Selisih Harga Pax</span>
                          <span className="text-blue-600">{formatRupiah(summaryData.paxDiffAmount)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Additionals Row */}
                    {summaryData.additionalDiffAmount > 0 && (
                      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 space-y-2 text-left">
                        <p className="font-bold text-gray-900 text-[9px] sm:text-[10px] uppercase tracking-wider text-amber-600">Additionals Tambahan</p>
                        <div className="space-y-1.5 text-[11px] sm:text-xs text-gray-600">
                          {summaryData.item_details
                            .filter((item) => item.id?.startsWith("additional-"))
                            .map((item, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>{item.name}</span>
                                <span>{formatRupiah(item.price)}</span>
                              </div>
                            ))}
                          <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-50">
                            <span>Subtotal Additional</span>
                            <span className="text-blue-600">{formatRupiah(summaryData.additionalDiffAmount)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs sm:text-sm text-gray-400">
                  Tambah peserta untuk menghitung rincian harga
                </div>
              )}
            </div>
          </form>

          {/* Right Column: Price Summary preview (Desktop/LG only) */}
          <div className="hidden lg:flex lg:w-[380px] bg-gray-50 border-l border-gray-100 p-6 overflow-y-auto flex-col shrink-0">
            <div className="space-y-6">
              <h3 className="font-bold text-gray-900 text-lg border-b border-gray-200 pb-3 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" /> Ringkasan Pembayaran
              </h3>

              {isLoadingSummary ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
                  <p className="text-sm font-semibold text-gray-500">Menghitung rincian harga...</p>
                </div>
              ) : summaryError ? (
                <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 text-sm space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" /> Gagal memuat rincian
                  </div>
                  <p>{(summaryError as any).response?.data?.error || "Terjadi kesalahan saat menghitung rincian harga."}</p>
                </div>
              ) : summaryData ? (
                <div className="space-y-4">
                  {/* Breakdown Items */}
                  <div className="space-y-3 text-sm">
                    {/* Trip Row */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-2 text-left">
                      <div>
                        <p className="font-bold text-gray-900 text-[10px] uppercase tracking-wider text-blue-600">Pemesanan Trip</p>
                        <p className="font-semibold text-gray-800 mt-1 text-xs">{trip?.title}</p>
                      </div>

                      <div className="pt-2 border-t border-dashed border-gray-100 space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Slots Awal ({summaryData.oldSlots} pax)</span>
                          <span>{formatRupiah(summaryData.oldPaxTotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Slots Baru ({summaryData.totalSlots} pax)</span>
                          <span>{formatRupiah(summaryData.newPaxTotal)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-50 text-xs">
                          <span>Selisih Harga Pax</span>
                          <span className="text-blue-600">{formatRupiah(summaryData.paxDiffAmount)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Additionals Row */}
                    {summaryData.additionalDiffAmount > 0 && (
                      <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-2 text-left">
                        <p className="font-bold text-gray-900 text-[10px] uppercase tracking-wider text-amber-600">Additionals Tambahan</p>
                        <div className="space-y-1.5 text-xs text-gray-600">
                          {summaryData.item_details
                            .filter((item) => item.id?.startsWith("additional-"))
                            .map((item, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>{item.name}</span>
                                <span>{formatRupiah(item.price)}</span>
                              </div>
                            ))}
                          <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-50 text-xs">
                            <span>Subtotal Additional</span>
                            <span className="text-blue-600">{formatRupiah(summaryData.additionalDiffAmount)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Grand Total */}
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex justify-between items-center mt-6 text-left">
                    <div className="flex-1 mr-2">
                      <p className="text-xs font-semibold text-blue-900">Total Selisih Pembayaran</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Invoice baru akan dibuat sejumlah ini</p>
                    </div>
                    <p className="text-lg font-black text-blue-900 shrink-0">
                      {formatRupiah(summaryData.totalDiffAmount - (summaryData.uniqueNumber || 0))}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-sm text-gray-400">
                  Tambah peserta untuk menghitung rincian harga
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with sticky price summary and action buttons */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-lg sm:shadow-none">
          {summaryData ? (
            <div className="flex flex-row justify-between items-center sm:flex-col sm:items-start">
              <div>
                <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Total Selisih Pembayaran</p>
                <p className="text-lg sm:text-xl font-black text-blue-600">
                  {formatRupiah(summaryData.totalDiffAmount - (summaryData.uniqueNumber || 0))}
                </p>
              </div>
            </div>
          ) : (
            <div className="hidden sm:block">
              <p className="text-xs text-gray-400">Silakan lengkapi form</p>
            </div>
          )}

          <div className="flex gap-3 items-center w-full sm:w-auto">
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={onClose}
              className={`flex-1 sm:flex-none px-6 py-3.5 font-bold text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors text-sm ${mutation.isPending ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={mutation.isPending || !selectedPayment || !summaryData}
              className="cursor-pointer flex-[2] sm:flex-none px-8 py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 transition-all text-sm flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" /> Memproses...
                </>
              ) : (
                "Konfirmasi & Bayar"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RepaymentModal({
  isOpen,
  onClose,
  booking,
  payment,
}: {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  payment: any;
}) {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  interface NormalizedAdditional {
    additionalId: number;
    name: string;
    unit: string;
    basePrice: number;
    price: number;
    promoPrice: number | null;
    isRequired: boolean;
  }

  const [additionalQuantities, setAdditionalQuantities] = useState<any[]>([]);

  const normalizeAdditionals = (trip: any): NormalizedAdditional[] => {
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

    return tripAdditionals.map((item: any) => {
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

  const trip = booking?.trip;
  const hasAdditionals = useMemo(() => normalizeAdditionals(trip), [trip]);

  useEffect(() => {
    if (!hasAdditionals?.length) return;

    setAdditionalQuantities((prev) => {
      return (hasAdditionals as NormalizedAdditional[]).map((item) => {
        const existing = prev.find(
          (p) => p?.additionalId === item?.additionalId,
        );
        const maxParticipant = booking?.bookingParticipants?.length || 1;

        return {
          name: item?.name,
          additionalId: item?.additionalId,
          quantity: Math.min(existing?.quantity ?? 0, maxParticipant),
          price: item?.promoPrice ?? item.price,
        };
      });
    });
  }, [hasAdditionals, booking?.bookingParticipants?.length]);

  const handleIncreaseAdditional = (id: number) => {
    setAdditionalQuantities((prev) =>
      prev.map((item) =>
        item?.additionalId === id
          ? { ...item, quantity: item?.quantity + 1 }
          : item,
      ),
    );
  };

  const handleDecreaseAdditional = (id: number) => {
    setAdditionalQuantities((prev) =>
      prev.map((item) => {
        if (item?.additionalId !== id) return item;
        if (item?.quantity <= 0) return item;
        return { ...item, quantity: item?.quantity - 1 };
      }),
    );
  };

  const paymentMethods = [
    {
      id: "va",
      name: "Virtual Account",
      icon: Building2,
      banks: [
        { id: "BCA", name: "BCA", image: "/images/payment-method/bca.png" },
        { id: "MANDIRI", name: "Mandiri", image: "/images/payment-method/mandiri.png" },
        { id: "BNI", name: "BNI", image: "/images/payment-method/bni.png" },
        { id: "BRI", name: "BRI", image: "/images/payment-method/bri.png" },
        { id: "SAHABAT_SAMPOERNA", name: "Sahabat Sampoerna", image: "/images/payment-method/sampoerna.png" },
        { id: "PERMATA", name: "Permata", image: "/images/payment-method/permata.png" },
        { id: "CIMB", name: "CIMB Niaga", image: "/images/payment-method/cimb-niaga.png" },
      ],
    },
    {
      id: "ewallet",
      name: "E-Wallet",
      icon: Wallet,
      options: [
        { id: "OVO", name: "OVO", image: "/images/payment-method/ovo.png" },
        { id: "ASTRAPAY", name: "AstraPay", image: "/images/payment-method/astra-pay.png" },
      ],
    },
    {
      id: "paylater",
      name: "Paylater",
      icon: Hourglass,
      options: [
        { id: "AKULAKU", name: "Akulaku", image: "/images/payment-method/akulaku.png" },
      ],
    },
    {
      id: "QRIS",
      name: "QRIS",
      image: "/images/payment-method/qris.png",
      icon: Smartphone,
    },
    {
      id: "CREDIT_CARD",
      name: "Kartu Kredit/Debit",
      image: "/images/payment-method/visa.png",
      icon: CreditCard,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) {
      toast.error("Silakan pilih metode pembayaran");
      return;
    }

    setIsSubmitting(true);
    try {
      const additional_order = additionalQuantities
        .filter((item) => item.quantity > 0)
        .map((item) => ({
          additionalId: item.additionalId,
          quantity: item.quantity,
        }));

      const res = await bookingApi.createRepaymentInvoice(
        Number(booking.bookingId),
        selectedPayment,
        additional_order.length > 0 ? additional_order : undefined
      );
      if (res?.invoiceUrl) {
        window.open(res.invoiceUrl, "_blank");
      } else {
        toast.error("Gagal memproses pembayaran pelunasan");
      }

      // Invalidate queries to reload detail page
      queryClient.invalidateQueries({
        queryKey: ["history-detail", Number(booking.bookingId)],
      });
      queryClient.invalidateQueries({ queryKey: ["history"] });

      onClose();
    } catch (err: any) {
      console.error("Repayment error:", err);
      alert(err?.response?.data?.error || "Gagal memproses pembayaran pelunasan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[90vh] sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl text-black">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between bg-orange-50/50">
          <h2 className="text-lg sm:text-xl font-bold text-orange-950">
            Pelunasan Booking
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 hover:bg-orange-100 rounded-full transition-colors border-0 bg-transparent outline-none"
          >
            <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 flex flex-col lg:flex-row min-h-0 gap-6">
          {/* Left: Participant Data (Read Only) */}
          <div className="flex-1 space-y-4">
            <div className="border-b border-gray-100 pb-2">
              <h3 className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" /> Data Peserta (Read Only)
              </h3>
            </div>

            <div className="space-y-3 max-h-[40vh] lg:max-h-[50vh] overflow-y-auto pr-2">
              {booking?.bookingParticipants?.map((bp: any, idx: number) => (
                <div
                  key={bp.id || idx}
                  className="p-4 border border-gray-150 rounded-2xl bg-gray-50/50 space-y-3"
                >
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-1.5">
                    <div className="size-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    <span className="font-bold text-gray-900 text-xs sm:text-sm">
                      {bp.participant?.name || "-"}
                    </span>
                    {idx === 0 && (
                      <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-full font-bold uppercase shrink-0">
                        PIC
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[11px] sm:text-xs text-gray-600">
                    <div>
                      <span className="text-gray-400 font-semibold block">Email</span>
                      <span className="font-medium text-gray-800">{bp.participant?.email || "-"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold block">Nomor WhatsApp</span>
                      <span className="font-medium text-gray-800">{bp.participant?.phone || "-"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold block">Nomor KTP/Passport</span>
                      <span className="font-medium text-gray-800">{bp.participant?.noKtp || "-"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold block">Jenis Kelamin</span>
                      <span className="font-medium text-gray-800">
                        {bp.participant?.gender === "Male" ? "Laki-laki" : bp.participant?.gender === "Female" ? "Perempuan" : "-"}
                      </span>
                    </div>
                    {bp.meetingPoints && (
                      <div className="sm:col-span-2">
                        <span className="text-gray-400 font-semibold block">Meeting Point</span>
                        <span className="font-medium text-gray-800">
                          {bp.meetingPoints.location} ({bp.meetingPoints.time})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Additionals Section */}
            <div className="bg-white ring-1 ring-gray-200 shadow-sm rounded-2xl p-4 sm:p-5 mt-4">
              <div className="mb-4 text-left">
                <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-0.5">
                  Additionals Tambahan
                </p>
              </div>

              {hasAdditionals.length === 0 ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Info className="size-4 shrink-0" strokeWidth={2} />
                  <p className="text-sm">Destinasi tidak memiliki additionals</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {hasAdditionals.map((item) => {
                    const quantity =
                      additionalQuantities.find(
                        (q) => q?.additionalId === item?.additionalId,
                      )?.quantity ?? 0;
                    const isDisabledDecrease = quantity <= 0;
                    const isDisabledIncrease = quantity >= (booking?.bookingParticipants?.length || 1);

                    return (
                      <div
                        key={item?.additionalId}
                        className="group flex items-center justify-between gap-4 rounded-xl px-3 sm:px-4 py-3 ring-1 ring-gray-200 transition-all duration-150"
                      >
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {item?.name}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-gray-400">
                            {formatRupiah(item?.promoPrice ?? item?.price)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              handleDecreaseAdditional(item?.additionalId)
                            }
                            disabled={isDisabledDecrease}
                            className={`
                              size-8 rounded-xl flex items-center justify-center border
                              transition-all duration-150 active:scale-95
                              ${isDisabledDecrease ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed" : "border-gray-300 text-gray-500 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"}
                            `}
                          >
                            <Minus className="size-3.5" strokeWidth={4} />
                          </button>

                          <span className="w-5 text-center text-sm font-bold tabular-nums text-gray-900">
                            {quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleIncreaseAdditional(item?.additionalId)
                            }
                            disabled={isDisabledIncrease}
                            className={`
                              size-8 rounded-xl flex items-center justify-center border
                              transition-all duration-150 active:scale-95
                              ${isDisabledIncrease ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed" : "border-gray-300 text-gray-500 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"}
                            `}
                          >
                            <Plus className="size-3.5" strokeWidth={4} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Payment Method Selection */}
          <div className="w-full lg:w-[380px] space-y-4 shrink-0">
            <div className="border-b border-gray-100 pb-2">
              <h3 className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-500" /> Pilih Metode Pembayaran
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2.5 max-h-[35vh] lg:max-h-[45vh] overflow-y-auto pr-1">
                {paymentMethods.map((method) => {
                  const isSelected = expandedCategory === method.id;
                  const Icon = method.icon;
                  const options = method.banks || method.options;
                  
                  const totalRepaymentAmount = (payment?.grossAmount || payment?.amount || 0) +
                      additionalQuantities.reduce(
                          (sum, item) => sum + item.price * item.quantity,
                          0
                      );
                  
                  const isDisabled = method.id === "QRIS" && totalRepaymentAmount > 10000000;

                  return (
                    <div key={method.id} className="space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (isDisabled) return;
                          if (options) {
                            setExpandedCategory(isSelected ? null : method.id);
                          } else {
                            setExpandedCategory(null);
                            setSelectedPayment(method.id);
                          }
                        }}
                        disabled={isDisabled}
                        className={`cursor-pointer w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${isDisabled
                          ? "opacity-70 bg-gray-50/50 grayscale-[50%] cursor-not-allowed border-gray-200"
                          : ((options && isSelected) || (!options && selectedPayment === method.id)
                          ? "border-orange-500 bg-orange-50/30"
                          : "border-gray-200 bg-white hover:border-orange-200")
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-1.5 rounded-lg ${isDisabled
                                ? "bg-gray-100 text-gray-400"
                                : ((options && isSelected) || (!options && selectedPayment === method.id)
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 text-gray-500")
                              }`}
                          >
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                          <div className="flex flex-col">
                              <span className={`font-bold text-xs sm:text-sm ${isDisabled ? "text-gray-400" : "text-gray-900"}`}>
                                {method.name}
                              </span>
                              {isDisabled && (
                                  <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-red-50 text-red-500 text-[10px] font-bold tracking-wide uppercase rounded w-fit">
                                      Maks Transaksi Rp 10 Juta
                                  </span>
                              )}
                          </div>
                        </div>
                        {isDisabled ? (
                            <Ban className="w-4 h-4 text-gray-300" />
                        ) : options ? (
                          <ChevronRight
                            className={`w-4 h-4 text-gray-400 transition-transform ${isSelected ? "rotate-90" : ""}`}
                          />
                        ) : (
                          selectedPayment === method.id && (
                            <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )
                        )}
                      </button>

                      {options && isSelected && (
                        <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded-xl animate-in fade-in slide-in-from-top-2 duration-150">
                          {options.map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setSelectedPayment(option.id)}
                              className={`cursor-pointer relative flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all bg-white ${selectedPayment === option.id
                                ? "border-orange-500 bg-white shadow-sm scale-102"
                                : "border-transparent bg-white hover:border-orange-200"
                                }`}
                            >
                              <div className="relative w-8 h-8">
                                <Image
                                  src={option.image}
                                  alt={option.name}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <span className="text-[9px] font-bold text-gray-700 uppercase tracking-wider">
                                {option.name}
                              </span>
                              {selectedPayment === option.id && (
                                <div className="absolute top-1 right-1">
                                  <div className="w-3.5 h-3.5 bg-orange-500 rounded-full flex items-center justify-center">
                                    <Check className="w-2 h-2 text-white" />
                                  </div>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </form>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-4 shrink-0">
          <div className="text-left">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Pelunasan</p>
            <p className="text-base sm:text-lg font-black text-orange-600">
              {formatRupiah(
                (payment.grossAmount || payment.amount || 0) +
                additionalQuantities.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0,
                )
              )}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 font-bold text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-xs border-0 bg-transparent cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedPayment}
              className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs cursor-pointer border-0 shadow-md shadow-orange-100 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin w-3.5 h-3.5" />
                  Memproses...
                </>
              ) : (
                <>
                  Bayar Sekarang
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
const getManualAdditions = (booking: any) => {
  const manualAdditions: { name: string; quantity: number; price: number; total: number }[] = [];
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

  // Get first online payment (Xendit or Midtrans)
  const onlinePayment = booking.payment?.details?.find((p: any) => p.method !== "manual");
  let paidItems = [];
  if (onlinePayment?.rawResponse) {
    const raw = typeof onlinePayment.rawResponse === "string"
      ? JSON.parse(onlinePayment.rawResponse)
      : onlinePayment.rawResponse;
    paidItems = raw.items || [];
  }

  let totalDiff = 0;

  orderDetail.forEach((item: any) => {
    // Exclude unique numbers and promo discount lines in comparison
    if (item.id === "unique-number" || item.id === "unique-number-dp" || item.id?.startsWith("promo-") || item.id?.startsWith("voucher-") || item.name === "Unique number") {
      return;
    }

    const currentQty = Number(item.quantity || 0);

    // Find matching item in paid items by name
    const paidItem = paidItems.find((pi: any) =>
      pi.name === item.name || pi.name?.startsWith(`${item.name} `) || pi.name?.startsWith(item.name)
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
        total
      });
      totalDiff += total;
    }
  });

  return { items: manualAdditions, totalDiff };
};

export default function HistoryBookingDetailPageV2() {
  const params = useParams();
  const id = Number(params?.id);
  const { data, isLoading } = useBookingDetail(id);

  const sortedPaymentDetails = useMemo(() => {
    if (!data?.payment?.details) return [];
    return [...data.payment.details].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [data?.payment?.details]);

  const sortedItems = useMemo(() => {
    if (!data?.items) return [];
    const paymentsMap = new Map<number, { createdAt: string; orderId: string }>();
    data.payment?.details?.forEach((p: any) => {
      paymentsMap.set(p.id, { createdAt: p.createdAt, orderId: p.orderId });
    });

    return [...data.items]
      .filter((item: any) => {
        const payment = item.paymentId ? paymentsMap.get(item.paymentId) : null;
        const isAddition = payment?.orderId?.startsWith("TB-ADD-");
        if (isAddition && item.status !== "PAID" && item.status !== "SUCCESS") {
          return false; // exclude unpaid additions
        }
        return true;
      })
      .sort((a: any, b: any) => {
        const paymentA = (a as any).paymentId ? paymentsMap.get((a as any).paymentId) : null;
        const paymentB = (b as any).paymentId ? paymentsMap.get((b as any).paymentId) : null;
        const dateA = paymentA ? new Date(paymentA.createdAt).getTime() : 0;
        const dateB = paymentB ? new Date(paymentB.createdAt).getTime() : 0;
        return dateA - dateB;
      });
  }, [data?.items, data?.payment?.details]);

  const consolidatedAdditionals = useMemo(() => {
    if (!sortedItems) return [];

    const map = new Map<string, { name: string; quantity: number; price: number; status: string }>();

    sortedItems.forEach((item: any) => {
      const isTrip = item.name === data?.trip?.title || item.name.startsWith(data?.trip?.title + " (");
      const isUnique = item.name === "Unique number";
      const isCashback = item.name.startsWith("Cashback");
      const isPromo = item.name.startsWith("Promo:") || item.name.startsWith("Voucher");
      const isAddPart = item.name.startsWith("Add Participant") || item.name.startsWith("Penambahan peserta");
      const isDp = item.name.startsWith("Down Payment");
      const isRepayment = item.name.startsWith("Pelunasan")

      if (isTrip || isUnique || isCashback || isPromo || isAddPart || isDp || isRepayment) return;

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
    return sortedItems
      ?.filter((item: any) =>
        item.name === data?.trip?.title ||
        item.name.startsWith(data?.trip?.title + " (") ||
        item.name.startsWith("Add Participant") ||
        item.name.startsWith("Penambahan peserta") ||
        item.name.startsWith("Down Payment") ||
        item.name.startsWith("Pelunasan")
      )
      ?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
  }, [sortedItems, data?.trip?.title]);

  const activePayments = useMemo(() => {
    if (!data?.payment?.details) return [];
    return data.payment.details.filter((p: any) => {
      const isAddition = p.orderId?.startsWith("TB-ADD-");
      if (isAddition && p.status !== "PAID" && p.status !== "SUCCESS") {
        return false;
      }
      return true;
    });
  }, [data?.payment?.details]);

  const activeTotalAmount = useMemo(() => {
    return activePayments.reduce((sum: number, p: any) => {
      return sum + (p.finalPrice ? Number(p.finalPrice) : (p.grossAmount ? Number(p.grossAmount) : p.amount || 0));
    }, 0);
  }, [activePayments]);

  const [isOpenPricing, setIsOpenPricing] = useState<boolean>(true);
  const [isOpenParticipant, setIsOpenParticipant] = useState<boolean>(true);
  const [isOpenInfo, setIsOpenInfo] = useState<boolean>(true);
  const [isOpenFeedback, setIsOpenFeedback] = useState<boolean>(true);
  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] =
    useState<boolean>(false);
  const [isRepaymentModalOpen, setIsRepaymentModalOpen] =
    useState<boolean>(false);
  const [selectedRepaymentPayment, setSelectedRepaymentPayment] =
    useState<any>(null);
  const mainPayment = data?.payment?.details?.find(
    (p: any) => p.orderId && !p.orderId.startsWith("TB-ADD-"),
  );
  const uniqueNumber = data?.items.find(
    (item) =>
      item.name === "Unique number" &&
      (!mainPayment || (item as any).paymentId === mainPayment.id),
  );
  const isFullQuota =
    (data?.tripDate?.booked ?? 0) >= (data?.tripDate?.quota ?? 1);
  const payments = data?.payment?.details || [];
  const hasPaid = payments.some(
    (p) => p.status === "PAID" || p.status === "SUCCESS",
  );
  const allPaid =
    payments.length > 0 &&
    payments.every((p) => p.status === "PAID" || p.status === "SUCCESS");
  const hasPending = payments.some((p) => p.status === "PENDING");

  const consolidatedStatus = data?.payment?.status || "PENDING";

  const firstPayment = payments?.[0];
  const paymentMethod = firstPayment?.method;

  // H - 6 End Date Trip
  const now = new Date();

  const startDate = new Date(data?.tripDate?.date ?? "");

  const days = data?.trip?.days ?? 1; // default 1 hari

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (days - 1));
  endDate.setHours(23, 59, 59, 999);

  const feedbackAvailableTime = new Date(endDate);
  feedbackAvailableTime.setHours(feedbackAvailableTime.getHours() - 6);

  const isTripDone = data?.tripDate.status === "done";
  const isTripDepart = data?.tripDate.status === "depart";

  const isWithinFeedbackTime = now >= feedbackAvailableTime;

  const canShowFeedback =
    consolidatedStatus === "PAID" &&
    !data?.hasFeedback &&
    (isTripDone || (isTripDepart && isWithinFeedbackTime));

  const meetingPoints = useMemo(() => {
    return data?.trip?.destinations?.[0]?.destinationMeetingPoints || [];
  }, [data]);

  const renderStatus = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Menunggu keberangkatan";
      case "full":
        return "Penuh";
      case "depart":
        return "Berangkat";
      default:
        return status;
    }
  };

  const adminPhone = "+6282258401785";
  const defaultMessage = [
    `Halo mindies aku mau tanya tentang :`,
    ``,
    `Order ID : ${data?.orderId}`,
    `==========================`,
    `Nama Pemesan : ${data?.user?.name}`,
    `Jumlah Peserta : ${data?.bookingParticipants?.length}`,
    `Nama Trip : ${data?.trip?.title}`,
    `Tanggal Trip : ${dayjs(data?.trip?.date).format("DD")} - ${dayjs(
      data?.trip?.date,
    )
      .add((data?.trip?.days ?? 0) - 1, "day")
      .format("DD MMMM YYYY")}`,
    `Status Pembayaran : ${data?.status}`,
    `Metode Pembayaran : ${firstPayment?.method}`,
    `Total Harga : ${formatRupiah(data?.amount)}`,
    `Diskon/Promo : ${data?.items?.find((i) => i?.name?.startsWith("Promo:"))?.name?.split("Promo:")[1] ?? "-"}`,
    `Status Keberangkatan : ${renderStatus(data?.tripDate?.status)}`,
  ].join("\n");

  const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(defaultMessage)}`;

  const [additionalOrders, setAdditionalOrders] = useState<
    | {
      additionalId: number;
      name: string;
      price: number;
      quantity: number;
      status: string;
    }[]
    | null
  >(null);

  useEffect(() => {
    if (!data) return;

    const prices = data?.trip?.destinations?.[0]?.additional_prices;

    const formatted = data?.additionalOrder.map((item: any) => {
      const findPrice = prices.find(
        (p: any) => p.additionalId === item.additionalId,
      );

      // Find corresponding item in invoice to determine status
      // Items in Xendit invoice might be named "Item Name" or "Item Name (+quantity)"
      const invoiceItems = data?.items?.filter(
        (i: any) => i.name === item.name || i.name.startsWith(item.name + " (")
      );

      // If any of the invoice items for this additional order is unpaid, we might want to show it.
      // Or just take the latest status
      const unpaidInvoice = invoiceItems?.find((i: any) => i.status !== "PAID");
      const finalStatus = unpaidInvoice ? unpaidInvoice.status : (invoiceItems?.[0]?.status || "PAID");

      return {
        additionalId: item.additionalId,
        name: item.name,
        quantity: item.quantity,
        price: findPrice?.promoPrice ?? findPrice?.price ?? 0,
        status: finalStatus,
      };
    });

    setAdditionalOrders(formatted);
  }, [data]);

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

  const activeEmoji = Math.round(data?.averageRating || 0); // 3.8 → 4

  const channelLabel =
    paymentChannelMap[paymentMethod as keyof typeof paymentChannelMap] ??
    "Tidak diketahui";

  const handleShare = async () => {
    const url = data?.trip?.slug;
    if (!url) return;

    const title = "Travel Buddies";
    const text = "Your best travel mate!";
    if (!navigator.share) {
      // fallback
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard");
      return;
    }

    try {
      await navigator.share({
        title,
        text,
        url,
      });
    } catch (error) {
      // user cancel → no error needed
      console.log("Share cancelled");
    }
  };

  const statusConfig = getStatusTripConfig(data?.tripDate?.status);
  const pendingPayment = data?.payment?.details?.find(
    (p: any) => p.status === "PENDING",
  );

  const { minutes, seconds, isExpired } = useCountdown(
    pendingPayment?.createdAt || data?.payment?.createdAt || "",
    pendingPayment ? "PENDING" : data?.payment?.status,
  );

  if (isLoading) return <SpinnerLoading />;

  // Empty State
  if (!data || data === undefined) {
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
    <div className="bg-gray-200">
      <div className="relative max-w-[1024px] 2xl:max-w-[1440px] mx-auto px-5 lg:px-0 pb-10  min-h-screen">
        {/* Header */}
        <div className="mx-auto py-4 inline-block">
          <Link
            href={"/profile"}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Kembali</span>
          </Link>
        </div>

        {/* ── Responsive grid: 1 col mobile, 2 col lg+ ── */}
        <div className="lg:grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] lg:gap-5 lg:items-start">
          {/* ══ LEFT COLUMN ══ */}
          <div className="flex flex-col order-1 gap-5">
            {/* Card: Hero + Trip info + Progress + Payment */}
            <div className="rounded-3xl bg-white overflow-hidden shadow-sm">
              {/* Hero Image & Status */}
              <div className="relative overflow-hidden shadow-lg shadow-blue-200/50">
                {/* Image */}
                <div className="relative w-full h-38 lg:h-52 object-cover">
                  {data?.trip?.image && (
                    <Image
                      src={data?.trip?.image}
                      alt={data?.trip?.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-black/10"></div>
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>

                {/* Trip info */}
                <div className="text-white absolute left-4 bottom-3 right-4">
                  <p className="text-sm font-bold leading-tight truncate lg:text-base">
                    {data?.trip?.title}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5 text-white/80">
                    <MapPin size={13} />
                    <p className="text-xs font-medium truncate">
                      {data?.trip?.location}
                    </p>
                  </div>
                </div>

                {/* Badge Status */}
                <BadgeStatusTrip
                  status={consolidatedStatus}
                  paymentConfig={getPaymentStatusConfig(consolidatedStatus)}
                  statusConfig={statusConfig}
                  minutes={minutes}
                  seconds={seconds}
                  isExpired={isExpired}
                />
              </div>

              {/* Trip details */}
              <div className="space-y-3 pt-3 pb-1">
                {/* Date + Peserta */}
                <div className="flex items-start justify-between px-5">
                  <h4 className="font-bold text-sm tracking-wider">
                    Tanggal Trip
                  </h4>
                  <p className="text-gray-500 font-semibold text-sm mt-0.5">
                    {dayjs(data?.tripDate?.date).format("MMMM DD, YYYY")}
                  </p>
                </div>

                {/* ── Payment Summary & History ── */}
                <div className="px-5 pb-4">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Ringkasan Pembayaran
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${data?.status === "PAID"
                            ? "bg-green-500"
                            : data?.payment?.details?.some(
                              (p) => p.status === "PAID",
                            )
                              ? "bg-amber-500"
                              : data?.payment?.details?.some(
                                (p) => p.status === "EXPIRED",
                              )
                                ? "bg-red-500"
                                : "bg-blue-500"
                            }`}
                        />
                        <span className="text-xs font-bold text-gray-700">
                          {data?.status === "PAID"
                            ? "Lunas"
                            : data?.payment?.details?.some(
                              (p) => p.status === "PAID",
                            )
                              ? "Dibayar Sebagian"
                              : data?.payment?.details?.some(
                                (p) => p.status === "EXPIRED",
                              )
                                ? "Kadaluwarsa"
                                : "Menunggu"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {sortedPaymentDetails.map((p, idx) => {
                        const config = getPaymentStatusConfig(p.status);
                        const pChannelLabel =
                          paymentChannelMap[
                          p.method as keyof typeof paymentChannelMap
                          ] ?? "Lainnya";

                        return (
                          <div
                            key={p.id || idx}
                            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-xl ${config.iconWrap} scale-90`}
                              >
                                {config.icon}
                              </div>
                              <div>
                                <p className="font-bold text-sm text-gray-900">
                                  {formatRupiah(p.finalPrice ?? p.grossAmount ?? p.amount)}
                                </p>
                                <p className="text-[10px] text-gray-500 font-medium">
                                  {p.method} •{" "}
                                  {dayjs(p.createdAt).format("DD MMM YYYY")}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.bg} whitespace-nowrap`}
                              >
                                {config.label}
                              </span>
                              {p.status === "PENDING" && (
                                data?.paymentScheme === "DP" && p.orderId?.endsWith("-FINAL") && !p.xenditInvoiceUrl ? (
                                  <button
                                    onClick={() => {
                                      setSelectedRepaymentPayment(p);
                                      setIsRepaymentModalOpen(true);
                                    }}
                                    className="block w-full text-right mt-1 text-[10px] font-bold text-blue-600 hover:underline bg-transparent border-0 cursor-pointer"
                                  >
                                    Pelunasan →
                                  </button>
                                ) : p.xenditInvoiceUrl ? (
                                  <a
                                    href={p.xenditInvoiceUrl}
                                    target="_blank"
                                    className="block mt-1 text-[10px] font-bold text-blue-600 hover:underline"
                                  >
                                    Bayar Sekarang →
                                  </a>
                                ) : null
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>


                    {data?.payment?.details?.length > 1 && (
                      <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm font-bold text-gray-900">
                          Total Terbayar
                        </p>
                        <p className="text-sm font-bold text-blue-600">
                          {formatRupiah(
                            data.payment.details?.reduce(
                              (acc, p) =>
                                p.status === "PAID" || p.status === "SUCCESS"
                                  ? acc + (p.finalPrice ?? p.grossAmount ?? p.amount)
                                  : acc,
                              0,
                            ),
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Button Payment if status pending */}

            {canShowFeedback && (
              <div className="hidden md:block px-5 bg-white rounded-2xl">
                <div className="flex items-center justify-between py-4">
                  <h1 className="font-bold">Bantu kami jadi lebih baik</h1>
                  <button onClick={() => setIsOpenFeedback((prev) => !prev)}>
                    <ChevronDown
                      className={`transition-transform duration-300 cursor-pointer ${isOpenFeedback ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpenFeedback ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div>
                    {isOpenFeedback && (
                      <div className="space-y-3 pb-5">
                        <p>
                          Gimana pengalaman kamu trip bersama travel buddies?
                        </p>

                        {/* Emots */}
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/booking/${id}/feedback`}
                            className="p-2 rounded-lg bg-gray-200/70 hover:scale-110 transition-all duration-300"
                          >
                            <Angry size={32} color="gray" />
                          </Link>

                          <Link
                            href={`/booking/${id}/feedback`}
                            className="p-2 rounded-lg bg-gray-200/70 hover:scale-110 transition-all duration-300"
                          >
                            <Frown size={32} color="gray" />
                          </Link>

                          <Link
                            href={`/booking/${id}/feedback`}
                            className="p-2 rounded-lg bg-gray-200/70 hover:scale-110 transition-all duration-300"
                          >
                            <Annoyed size={32} color="gray" />
                          </Link>

                          <Link
                            href={`/booking/${id}/feedback`}
                            className="p-2 rounded-lg bg-gray-200/70 hover:scale-110 transition-all duration-300"
                          >
                            <Smile size={32} color="gray" />
                          </Link>

                          <Link
                            href={`/booking/${id}/feedback`}
                            className="p-2 rounded-lg bg-gray-200/70 hover:scale-110 transition-all duration-300"
                          >
                            <Laugh size={32} color="gray" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Filled Feedback Desktop */}
            {data?.averageRating && (
              <div className="hidden md:block px-5 bg-white rounded-2xl">
                <div className="text-center py-5">
                  <h1 className="font-bold">Terima kasih!</h1>
                  <p className="text-xs text-gray-500">
                    Review kamu membantu traveler lain memilih trip terbaik.
                    Dokumentasi foto perjalananmu siap diunduh.
                  </p>
                </div>
                <div className="space-y-3 pb-5">
                  {/* Emots */}
                  <div className="flex items-center justify-between">
                    {emojiRatings.map(
                      ({ value, icon: Icon, color, bg, label }) => {
                        const isActive = value === activeEmoji;
                        return (
                          <button
                            key={value}
                            type="button"
                            title={label}
                            style={{
                              backgroundColor: isActive ? bg : "#e5e7eb",
                              transform: isActive ? "scale(1.15)" : "scale(1)",
                              transition: "all 0.2s ease",
                            }}
                            className="p-2.5 rounded-lg"
                          >
                            <Icon size={32} color={isActive ? color : "gray"} />
                          </button>
                        );
                      },
                    )}
                  </div>

                  {/* Button Feedback */}
                  {isLoading ? (
                    <>
                      <SpinnerLoading />
                    </>
                  ) : data?.documentationLink?.length > 0 ? (
                    data?.documentationLink?.map((doc, index) => {
                      const link = doc.startsWith("http")
                        ? doc
                        : `https://${doc}`;
                      return (
                        <div key={index} className="space-y-1">
                          <h1 className="font-bold">Dokumentasi {index + 1}</h1>
                          <div className="flex items-center gap-3">
                            <a
                              href={link}
                              target="_blank"
                              className="w-full bg-gray-200/70 h-10 flex flex-col justify-center px-2 rounded-lg text-blue-500 font-semibold hover:underline line-clamp-1"
                            >
                              {link}
                            </a>
                            <a
                              href={link}
                              target="_blank"
                              className="px-3 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-700 transition-colors duration-300"
                            >
                              <ArrowRight />
                            </a>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-5 px-6 text-center gap-4">
                      <svg
                        width="56"
                        height="56"
                        viewBox="0 0 56 56"
                        fill="none"
                        className="opacity-40"
                      >
                        <rect
                          x="10"
                          y="8"
                          width="28"
                          height="36"
                          rx="4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <rect
                          x="18"
                          y="4"
                          width="28"
                          height="36"
                          rx="4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          fill="white"
                        />
                        <line
                          x1="24"
                          y1="15"
                          x2="38"
                          y2="15"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <line
                          x1="24"
                          y1="21"
                          x2="38"
                          y2="21"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <line
                          x1="24"
                          y1="27"
                          x2="32"
                          y2="27"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="41"
                          cy="38"
                          r="8"
                          fill="white"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <line
                          x1="41"
                          y1="35"
                          x2="41"
                          y2="39"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <circle cx="41" cy="41.5" r="0.8" fill="currentColor" />
                      </svg>

                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-gray-700">
                          Dokumentasi belum tersedia
                        </p>
                        <p className="text-xs text-gray-400 max-w-[220px] leading-relaxed">
                          Tautan dokumentasi sedang diproses dan akan muncul di
                          sini setelah selesai.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Share — visible only on lg+ in left column */}
            <div className="hidden lg:block px-5 pb-4 bg-white rounded-2xl">
              <div className="flex items-center justify-between pt-4 pb-2">
                <h1 className="font-bold">Bantu agar trip ini berjalan</h1>
              </div>

              <div className="w-full space-y-5">
                <p className="text-gray-500 text-sm">
                  Yuk, bantu share ke teman-teman kamu supaya kuota trip cepat
                  terpenuhi.
                </p>
                <div className="flex items-center w-full">
                  <button
                    onClick={handleShare}
                    aria-label="Share"
                    className="bg-[#FE5E00] w-full p-2.5 flex items-center justify-center gap-2 text-white font-bold rounded-xl hover:bg-[#e55400] transition-colors cursor-pointer"
                  >
                    Bagikan trip ini
                    <Share2 />
                  </button>
                </div>
              </div>
            </div>

            {/* WA Admin */}
            <div className="hidden sm:block bg-linear-to-br from-green-600 to-green-700 rounded-2xl shadow-lg shadow-green-200 p-6 text-white">
              <h3 className="font-bold mb-2">Butuh Bantuan?</h3>
              <p className="text-sm text-green-100 mb-4">
                Hubungi customer service kami
              </p>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white text-green-600 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
              >
                <Phone className="w-4 h-4" />
                WhatsApp CS
              </a>
            </div>
          </div>
          {/* ══ END LEFT COLUMN ══ */}

          {/* ══ RIGHT COLUMN ══ */}
          <div className="flex flex-col gap-5 mt-5 lg:mt-0">
            {/* Feedback Empty Mobile*/}
            {canShowFeedback && (
              <div className="md:hidden px-5 bg-white rounded-2xl">
                <div className="flex items-center justify-between py-4">
                  <h1 className="font-bold">Bantu kami jadi lebih baik</h1>
                  <button onClick={() => setIsOpenFeedback((prev) => !prev)}>
                    <ChevronDown
                      className={`transition-transform duration-300 cursor-pointer ${isOpenFeedback ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpenFeedback ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div>
                    {isOpenFeedback && (
                      <div className="space-y-3 pb-5">
                        <p>
                          Gimana pengalaman kamu trip bersama travel buddies?
                        </p>

                        {/* Emots */}
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/booking/${id}/feedback`}
                            className="p-2 rounded-lg bg-gray-200/70 hover:scale-110 transition-all duration-300"
                          >
                            <Angry size={32} color="gray" />
                          </Link>

                          <Link
                            href={`/booking/${id}/feedback`}
                            className="p-2 rounded-lg bg-gray-200/70 hover:scale-110 transition-all duration-300"
                          >
                            <Frown size={32} color="gray" />
                          </Link>

                          <Link
                            href={`/booking/${id}/feedback`}
                            className="p-2 rounded-lg bg-gray-200/70 hover:scale-110 transition-all duration-300"
                          >
                            <Annoyed size={32} color="gray" />
                          </Link>

                          <Link
                            href={`/booking/${id}/feedback`}
                            className="p-2 rounded-lg bg-gray-200/70 hover:scale-110 transition-all duration-300"
                          >
                            <Smile size={32} color="gray" />
                          </Link>

                          <Link
                            href={`/booking/${id}/feedback`}
                            className="p-2 rounded-lg bg-gray-200/70 hover:scale-110 transition-all duration-300"
                          >
                            <Laugh size={32} color="gray" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* FIlled Feedback Mobile */}
            {data?.averageRating && (
              <div className="md:hidden px-5 bg-white rounded-2xl">
                <div className="text-center py-5">
                  <h1 className="font-bold">Terima kasih!</h1>
                  <p className="text-[12px] text-gray-500">
                    Review kamu membantu traveler lain memilih trip terbaik.
                    Dokumentasi foto perjalananmu siap diunduh.
                  </p>
                </div>
                <div className="space-y-3 pb-5">
                  {/* Emots */}
                  <div className="flex items-center justify-between">
                    {emojiRatings.map(
                      ({ value, icon: Icon, color, bg, label }) => {
                        const isActive = value === activeEmoji;
                        return (
                          <button
                            key={value}
                            type="button"
                            title={label}
                            style={{
                              backgroundColor: isActive ? bg : "#e5e7eb",
                              transform: isActive ? "scale(1.15)" : "scale(1)",
                              transition: "all 0.2s ease",
                            }}
                            className="p-2.5 rounded-lg"
                          >
                            <Icon size={32} color={isActive ? color : "gray"} />
                          </button>
                        );
                      },
                    )}
                  </div>

                  {/* Button Feedback */}
                  {isLoading ? (
                    <>
                      <SpinnerLoading />
                    </>
                  ) : (
                    data?.documentationLink?.map((doc, index) => {
                      const link = doc.startsWith("http")
                        ? doc
                        : `https://${doc}`;
                      return (
                        <div key={index} className="space-y-1">
                          <h1 className="font-bold">Dokumentasi {index + 1}</h1>
                          <div className="flex items-center gap-3">
                            <a
                              href={link}
                              target="_blank"
                              className="w-full bg-gray-200/70 h-10 flex flex-col justify-center px-2 rounded-lg text-blue-500 font-semibold line-clamp-1"
                            >
                              {link}
                            </a>
                            <a
                              href={link}
                              target="_blank"
                              className="px-3 py-2 bg-blue-500 rounded-lg text-white"
                            >
                              <ArrowRight />
                            </a>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Rincian Harga */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => setIsOpenPricing((prev) => !prev)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <h1 className="font-bold text-gray-900">Rincian Harga</h1>
                </div>
                <div
                  className={`p-1.5 rounded-full bg-gray-100 transition-transform duration-300 ${isOpenPricing ? "rotate-180" : ""}`}
                >
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpenPricing ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="px-5 pb-6 space-y-5">
                  {/* Total Pax Info */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50/50 rounded-xl border border-blue-100/50">
                    <Users className="w-4 h-4 text-blue-500" />
                    <p className="text-xs font-bold text-blue-700">
                      Total untuk {totalPaxCount} Pax paket
                      trip
                    </p>
                  </div>

                  {/* Main Trip Items */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                      <h2 className="font-bold text-sm text-gray-900 uppercase tracking-wider">
                        Harga Open Trip
                      </h2>
                    </div>
                    {sortedItems
                      ?.filter(
                        (item: any) =>
                          item.name === data?.trip?.title ||
                          item.name.startsWith(data?.trip?.title + " (") ||
                          (data?.trip?.title && item.name.includes(data.trip.title)) ||
                          item.name.toLowerCase().includes("unique number") ||
                          item.id?.startsWith("unique-number"),
                      )
                      .map((tripItem: any, index: number) => (
                        <div
                          key={`trip-${index}`}
                          className={`flex items-center justify-between group ${tripItem.status !== "PAID" ? "opacity-60" : ""}`}
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                                {tripItem.name}
                              </p>
                              {tripItem.status !== "PAID" && (
                                <span
                                  className={`text-[8px] font-bold px-1 py-0.5 rounded uppercase ${tripItem.status === "EXPIRED" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"}`}
                                >
                                  {tripItem.status === "EXPIRED"
                                    ? "Expired"
                                    : "Belum Bayar"}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400">
                              Harga Satuan: {formatRupiah(tripItem.price)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                              x{tripItem.quantity}
                            </span>
                            <p className="font-bold text-sm text-gray-900">
                              {formatRupiah(tripItem.price * tripItem.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Additional Items */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-4 bg-gray-300 rounded-full"></div>
                      <h2 className="font-bold text-sm text-gray-900 uppercase tracking-wider">
                        Layanan Tambahan
                      </h2>
                    </div>
                    {consolidatedAdditionals?.length === 0 ? (
                      <p className="text-xs text-gray-400 italic pl-3">
                        Tidak ada layanan tambahan
                      </p>
                    ) : (
                      consolidatedAdditionals?.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between group"
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                                {item.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                              x{item.quantity}
                            </span>
                            <p className="font-bold text-sm text-gray-900">
                              {formatRupiah(
                                Number(item.price) * Number(item.quantity),
                              )}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Participant Items */}
                  {sortedItems?.some((item: any) =>
                    item.name.startsWith("Add Participant") ||
                    item.name.startsWith("Penambahan peserta"),
                  ) && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-4 bg-orange-400 rounded-full"></div>
                          <h2 className="font-bold text-sm text-gray-900 uppercase tracking-wider">
                            Peserta Tambahan
                          </h2>
                        </div>
                        {sortedItems
                          ?.filter((item: any) =>
                            item.name.startsWith("Add Participant") ||
                            item.name.startsWith("Penambahan peserta"),
                          )
                          .map((item: any, index: number) => {
                            const paymentDetail = data?.payment?.details?.find(
                              (p: any) => p.id === item.paymentId,
                            );
                            const uniqueNumber = paymentDetail?.uniqueNumber;

                            return (
                              <div
                                key={`add-pax-container-${index}`}
                                className="space-y-2"
                              >
                                <div className="flex items-center justify-between group">
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                                        {item.name}
                                      </p>
                                    </div>
                                    <p className="text-[10px] text-gray-400">
                                      Harga Satuan: {formatRupiah(item.price)}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                                      x{item.quantity}
                                    </span>
                                    <p className="font-bold text-sm text-gray-900">
                                      {formatRupiah(item.price * item.quantity)}
                                    </p>
                                  </div>
                                </div>

                                {uniqueNumber && (
                                  <div className="flex items-center justify-between group">
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                                          Kode Unik (Peserta Tambahan)
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <p className="font-bold text-sm text-gray-900">
                                        {formatRupiah(uniqueNumber)}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}

                  {/* Other Fees */}
                  {uniqueNumber && (
                    <div className="pt-4 border-t border-dashed border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600 font-medium">
                          Unique Number
                        </p>
                        <p className="font-bold text-sm text-gray-900">
                          {formatRupiah(uniqueNumber?.price)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Promos & Discounts */}
                  {sortedItems?.some(
                    (item: any) =>
                      item.name.startsWith("Promo:") ||
                      item.name.startsWith("Voucher"),
                  ) && (
                      <div className="space-y-3 py-3 border-t border-dashed border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Gift className="w-4 h-4 text-emerald-500" />
                          <h2 className="font-bold text-sm text-emerald-600 uppercase tracking-wider">
                            Potongan Harga
                          </h2>
                        </div>

                        {sortedItems
                          ?.filter((item: any) => item.name.startsWith("Promo:"))
                          .map((promo: any) => (
                            <div
                              key={promo.name}
                              className="flex items-center justify-between group"
                            >
                              <p className="text-sm text-emerald-600 font-medium">
                                {promo.name.replace("Promo: ", "")}
                              </p>
                              <p className="font-bold text-sm text-emerald-600">
                                -
                                {formatRupiah(
                                  Math.abs(promo?.price * promo.quantity),
                                )}
                              </p>
                            </div>
                          ))}

                        {sortedItems
                          ?.filter((item: any) => item.name.startsWith("Voucher"))
                          .map((promo: any) => (
                            <div
                              key={promo.name}
                              className="flex items-center justify-between group"
                            >
                              <p className="text-sm text-emerald-600 font-medium">
                                {promo.name.replace("Voucher: ", "")}
                              </p>
                              <p className="font-bold text-sm text-emerald-600">
                                -
                                {formatRupiah(
                                  Math.abs(promo?.price * promo.quantity),
                                )}
                              </p>
                            </div>
                          ))}
                      </div>
                    )}

                  {(() => {
                    const { items, totalDiff } = getManualAdditions(data);
                    if (items.length === 0) return null;

                    const originalPaidAmount = data?.payment?.details?.find((p: any) => p.method !== "manual")?.finalPrice ??
                      data?.payment?.details?.find((p: any) => p.method !== "manual")?.grossAmount ??
                      data?.payment?.details?.find((p: any) => p.method !== "manual")?.amount ?? 0;
                    const finalPrice = originalPaidAmount + totalDiff;

                    return (
                      <div className="mb-5 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
                        <h4 className="font-bold text-orange-950 text-xs uppercase tracking-wider mb-2.5">
                          Rincian Penambahan Manual
                        </h4>
                        <div className="space-y-2 text-xs text-orange-900">
                          {items.map((item, idx) => (
                            <div key={idx} className="flex justify-between border-b border-orange-100 pb-1.5">
                              <span>{item.name} (Tambahan x{item.quantity})</span>
                              <span className="font-semibold">{formatRupiah(item.total)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between pt-1 text-gray-600">
                            <span>Total Pembayaran Online (Awal)</span>
                            <span>{formatRupiah(originalPaidAmount)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-orange-950 border-t border-orange-200 pt-2 mt-1">
                            <span>Total Akhir Booking</span>
                            <span>{formatRupiah(finalPrice)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Summary Total */}
                  {(() => {
                    const { items, totalDiff } = getManualAdditions(data);
                    const originalPaidAmount = data?.payment?.details?.find((p: any) => p.method !== "manual")?.finalPrice ??
                      data?.payment?.details?.find((p: any) => p.method !== "manual")?.grossAmount ??
                      data?.payment?.details?.find((p: any) => p.method !== "manual")?.amount ?? 0;
                    const finalCombinedPrice = items.length > 0 ? (originalPaidAmount + totalDiff) : activeTotalAmount;

                    return (
                      <div className="pt-5 border-t border-gray-200">
                        <div className="bg-gray-900 rounded-2xl p-5 text-white shadow-xl shadow-gray-200">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm text-gray-400 font-medium">
                              Total Harga
                            </p>
                            <h3 className="text-2xl font-black">
                              {formatRupiah(finalCombinedPrice)}
                            </h3>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Cashback Info */}
                  {sortedItems?.some((item: any) =>
                    item.name.startsWith("Cashback"),
                  ) && (
                      <div className="mt-4 p-4 rounded-2xl bg-linear-to-br from-amber-50 to-yellow-50 border border-amber-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl shadow-sm text-amber-500">
                            <TrendingDown className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                              Total Cashback
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              {sortedItems
                                ?.find((item: any) => item.name.startsWith("Cashback"))
                                ?.name.replace("Cashback: ", "")}
                            </p>
                          </div>
                        </div>
                        <p className="text-lg font-black text-amber-600">
                          {formatRupiah(
                            sortedItems
                              ?.filter((item: any) => item.name.startsWith("Cashback"))
                              .reduce(
                                (acc: number, curr: any) => acc + curr.price * curr.quantity,
                                0,
                              ),
                          )}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Tagihan Pending */}
            {sortedPaymentDetails.filter(
              (p) => p.status === "PENDING" || p.status === "EXPIRED",
            ).length > 0 && (
                <div className="px-5 py-5 bg-white rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <CreditCard className="w-5 h-5 text-[#FE5E00]" />
                      </div>
                      <h1 className="font-bold text-gray-900">
                        Tagihan & Invoices
                      </h1>
                    </div>
                    {
                      sortedPaymentDetails.some(p => p.status === "PENDING") && (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider animate-pulse">
                          Menunggu Tindakan
                        </span>
                      )
                    }
                  </div>

                  <div className="space-y-4">
                    {sortedPaymentDetails
                      ?.filter(
                        (p) => p.status === "PENDING" || p.status === "EXPIRED",
                      )
                      .map((p, idx) => (
                        <div
                          key={p.id || idx}
                          className={`group relative overflow-hidden p-4 rounded-2xl transition-all duration-300 border ${p.status === "PENDING"
                            ? "bg-linear-to-br from-white to-orange-50/30 border-orange-100 hover:border-orange-300"
                            : "bg-gray-50 border-gray-200"
                            }`}
                        >
                          <div className="flex items-center justify-between relative z-10">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                                  {dayjs(p.createdAt).format(
                                    "DD MMM YYYY • HH:mm",
                                  )}
                                </p>
                                {p.status === "EXPIRED" && (
                                  <span className="text-[9px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-md font-bold uppercase">
                                    Kadaluwarsa
                                  </span>
                                )}
                              </div>
                              <p className="font-extrabold text-xl text-gray-900 leading-none">
                                {formatRupiah(p.finalPrice ?? p.grossAmount ?? p.amount)}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-1 font-medium">
                                {p.method}
                              </p>
                            </div>

                            {p?.status === "PENDING" && (
                              <button
                                onClick={() => {
                                  if (data?.paymentScheme === "DP" && p.orderId?.endsWith("-FINAL") && !p.xenditInvoiceUrl) {
                                    setSelectedRepaymentPayment(p);
                                    setIsRepaymentModalOpen(true);
                                  } else if (p.xenditInvoiceUrl) {
                                    window.open(p.xenditInvoiceUrl, "_blank");
                                  }
                                }}
                                className="group/btn cursor-pointer relative overflow-hidden px-6 py-3 bg-[#FE5E00] text-white text-sm font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-200"
                              >
                                <span className="relative z-10 flex items-center gap-2">
                                  {data?.paymentScheme === "DP" && p.orderId?.endsWith("-FINAL") ? "Pelunasan" : "Bayar"}
                                  <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                </span>
                              </button>
                            )}
                          </div>

                          {/* Decorative background element for pending */}
                          {p.status === "PENDING" && (
                            <div className="absolute -right-4 -bottom-4 opacity-5 transform rotate-12 transition-transform group-hover:scale-110">
                              <CreditCard size={100} />
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                  <div className="mt-5 p-3 bg-blue-50 rounded-xl border border-blue-100/50">
                    <p className="text-[11px] text-blue-700 leading-relaxed text-center font-medium">
                      ✨ Segera selesaikan pembayaran agar pesanan kamu aman dan
                      tidak hangus!
                    </p>
                  </div>
                </div>
              )}

            {/*Peserta / Participants */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => setIsOpenParticipant((prev) => !prev)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <UserRound size={20} />
                  </div>
                  <h1 className="font-bold text-gray-900">Peserta Trip</h1>
                </div>
                <div
                  className={`p-1.5 rounded-full bg-gray-100 transition-transform duration-300 ${isOpenParticipant ? "rotate-180" : ""}`}
                >
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </button>

              <div
                className={`overflow-auto transition-all duration-300 ease-in-out ${isOpenParticipant ? "opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="px-5 pb-6">
                  <div className="space-y-6">
                    {/* Confirmed Section */}
                    {data?.bookingParticipants?.some(
                      (p: any) => p.status === "CONFIRMED",
                    ) && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              Terkonfirmasi
                            </h3>
                          </div>
                          {data?.bookingParticipants
                            ?.filter((p: any) => p.status === "CONFIRMED")
                            .map((item: any) => (
                              <ParticipantCard key={item.id} item={item} />
                            ))}
                        </div>
                      )}

                    {/* Pending Section */}
                    {data?.bookingParticipants?.some(
                      (p: any) => p.status === "PENDING",
                    ) && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-3 bg-amber-400 rounded-full"></div>
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              Menunggu Pembayaran
                            </h3>
                          </div>
                          {data?.bookingParticipants
                            ?.filter((p: any) => p.status === "PENDING")
                            .map((item: any) => (
                              <ParticipantCard key={item.id} item={item} />
                            ))}
                        </div>
                      )}

                    {/* Expired Section */}
                    {data?.bookingParticipants?.some(
                      (p: any) => p.status === "EXPIRED",
                    ) && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-3 bg-red-400 rounded-full"></div>
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              Peserta Batal / Kadaluwarsa
                            </h3>
                          </div>
                          {data?.bookingParticipants
                            ?.filter((p: any) => p.status === "EXPIRED")
                            .map((item: any) => (
                              <ParticipantCard key={item.id} item={item} />
                            ))}
                        </div>
                      )}
                  </div>

                  {/* Button Add Participant if Trip Guarantee and status pending */}
                  {data?.tripDate?.status === "pending" && data?.tripDate?.isGuarantee && (
                    <button
                      onClick={() => setIsAddParticipantModalOpen(true)}
                      className="cursor-pointer w-full mt-6 p-4 rounded-2xl border-2 border-dashed border-blue-200 text-blue-600 font-bold hover:bg-blue-50 hover:border-blue-400 transition-all flex items-center justify-center gap-2"
                    >
                      <Users size={20} />
                      Tambah Peserta Lainnya
                    </button>
                  )}

                  <div className="mt-5 flex items-center justify-center gap-2 text-gray-400">
                    <ShieldCheck size={14} />
                    <p className="text-[10px] font-medium italic">
                      Data peserta aman dan terenkripsi
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informasi Penting */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => setIsOpenInfo((prev) => !prev)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <AlertCircle size={20} />
                  </div>
                  <h1 className="font-bold text-gray-900">Informasi Penting</h1>
                </div>
                <div
                  className={`p-1.5 rounded-full bg-gray-100 transition-transform duration-300 ${isOpenInfo ? "rotate-180" : ""}`}
                >
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpenInfo ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="px-5 pb-6 space-y-4">
                  {/* Status */}
                  <div className="group flex items-start gap-4 p-4 bg-linear-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl border border-blue-100/50 transition-all hover:shadow-md hover:shadow-blue-100/20">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                      <Timer size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 mb-1">
                        Pemberitahuan Keputusan Trip
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Keputusan keberangkatan trip akan kami informasikan pada
                        tanggal{" "}
                        <span className="font-bold text-blue-600">
                          {dayjs(data?.tripDate?.date)
                            .subtract(2, "day")
                            .format("DD MMMM YYYY")}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Refund Info */}
                  <div className="group flex items-start gap-4 p-4 bg-linear-to-br from-emerald-50/50 to-green-50/50 rounded-2xl border border-emerald-100/50 transition-all hover:shadow-md hover:shadow-emerald-100/20">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-emerald-600 group-hover:scale-110 transition-transform">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 mb-1">
                        Garansi Refund 100%
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Jika kuota trip tidak terpenuhi, dana Anda akan
                        dikembalikan sepenuhnya maksimal dalam{" "}
                        <span className="font-bold text-emerald-600">
                          H+3 hari kerja
                        </span>{" "}
                        setelah pengajuan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Share — visible only on mobile in right column */}
            <div className="lg:hidden px-5 pb-4 bg-white rounded-2xl mb-7">
              <div className="flex items-center justify-between pt-4 pb-2">
                <h1 className="font-bold">Bantu agar trip ini berjalan</h1>
              </div>

              <div className="w-full space-y-5">
                <p className="text-gray-500 text-sm">
                  Yuk, bantu share ke teman-teman kamu supaya kuota trip cepat
                  terpenuhi.
                </p>
                <div className="flex items-center w-full">
                  <button
                    onClick={handleShare}
                    aria-label="Share"
                    className="bg-[#FE5E00] w-full p-2.5 flex items-center justify-center gap-2 text-white font-bold rounded-xl "
                  >
                    Bagikan trip ini
                    <Share2 />
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* ══ END RIGHT COLUMN ══ */}
        </div>
        {/* ── END grid ── */}

        {/* WA Admin */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="sm:hidden sticky bottom-5 w-full mt-5 block"
        >
          <div className="flex items-center justify-center py-2 rounded-xl gap-x-2 bg-green-500 lg:max-w-sm lg:mx-auto hover:bg-green-600 transition-colors">
            <div className="relative size-8">
              <Image
                src={"/images/social-media/whatsapp.png"}
                alt="whats-app-icon"
                fill
                className="object-cover"
              />
            </div>
            <p className="font-bold text-white">Hubungi Admin</p>
          </div>
        </a>
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
        <RepaymentModal
          isOpen={isRepaymentModalOpen}
          onClose={() => setIsRepaymentModalOpen(false)}
          booking={data}
          payment={selectedRepaymentPayment}
        />
      </div>
    </div>
  );
}