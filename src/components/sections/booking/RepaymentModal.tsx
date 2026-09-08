"use client";
import { bookingApi } from "@/features/bookings/api/booking-api";
import { formatRupiah } from "@/lib/format-rupiah";
import { obfuscateKtp } from "@/lib/obfuscate-ktp";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Ban,
  Building2,
  Check,
  CheckSquare,
  ChevronRight,
  CreditCard,
  Hourglass,
  Loader2,
  Minus,
  Plus,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Square,
  UserCheck,
  Users,
  UserX,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

interface AdditionalItemState {
  additionalId: number;
  name: string;
  unit: string;
  fullPrice: number;
  repaymentPricePerUnit: number; // Sisa pelunasan per unit (misal 50% untuk item DP)
  initialOrderedQty: number; // Qty yang dipesan saat DP awal
  quantity: number; // Qty yang dipilih untuk dilunasi
  isFromInitialOrder: boolean;
}

export function RepaymentModal({
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

  const [additionalItemsState, setAdditionalItemsState] = useState<AdditionalItemState[]>([]);

  // Participants Selection for Partial Repayment
  const allParticipants = useMemo(() => {
    return booking?.bookingParticipants || [];
  }, [booking?.bookingParticipants]);

  const [selectedParticipantIds, setSelectedParticipantIds] = useState<number[]>([]);

  // Initialize selected participants (all selected by default)
  useEffect(() => {
    if (allParticipants.length > 0) {
      setSelectedParticipantIds(allParticipants.map((bp: any, idx: number) => bp.id ?? idx));
    }
  }, [allParticipants, isOpen]);

  const totalOriginalParticipants = allParticipants.length || Number(booking?.slots) || 1;
  const selectedCount = selectedParticipantIds.length;
  const isPartialParticipants = selectedCount > 0 && selectedCount < totalOriginalParticipants;

  // Toggle participant selection
  const handleToggleParticipant = (participantId: number) => {
    if (selectedParticipantIds.includes(participantId)) {
      if (selectedParticipantIds.length <= 1) {
        toast.error("Minimal 1 peserta harus dipilih untuk pelunasan");
        return;
      }
      setSelectedParticipantIds((prev) => prev.filter((id) => id !== participantId));
    } else {
      setSelectedParticipantIds((prev) => [...prev, participantId]);
    }
  };

  const handleSelectAllParticipants = () => {
    setSelectedParticipantIds(allParticipants.map((bp: any, idx: number) => bp.id ?? idx));
  };

  // Extract destination additionals
  const destinationAdditionals = useMemo(() => {
    const tripAdditionals = booking?.trip?.additionals || [];
    if (tripAdditionals.length === 0) return [];
    const destination = booking?.trip?.destinations?.[0];
    if (!destination) return [];

    const infoMap = new Map<number, { name: string; unit: string }>(
      destination?.additionals?.map((a: any) => [a?.id, { name: a?.name, unit: a?.unit }])
    );
    const priceMap = new Map<number, { basePrice: number; price: number; promoPrice: number | null }>(
      destination?.additional_prices?.map((p: any) => [
        p?.additionalId,
        { basePrice: p?.basePrice, price: p?.price, promoPrice: p?.promoPrice },
      ])
    );

    return tripAdditionals.map((item: any) => {
      const info = infoMap.get(item?.additionalId);
      const prices = priceMap.get(item?.additionalId);
      return {
        additionalId: item?.additionalId,
        name: info?.name || "Unknown",
        unit: info?.unit || "pax",
        basePrice: prices?.basePrice ?? 0,
        price: prices?.price ?? 0,
        promoPrice: prices?.promoPrice ?? null,
        isRequired: item?.isRequired ?? false,
      };
    });
  }, [booking?.trip]);

  // Existing ordered additionals from DP
  const initialOrderedAdditionals = useMemo(() => {
    const existing = booking?.additionalOrder || [];
    if (Array.isArray(existing) && existing.length > 0) {
      return existing;
    }
    const fromItems = (booking?.items || []).filter(
      (item: any) =>
        !item.name?.startsWith(booking?.trip?.title) &&
        !item.name?.startsWith("Down Payment") &&
        !item.name?.startsWith("Pelunasan") &&
        !item.name?.startsWith("Unique") &&
        !item.name?.startsWith("Promo") &&
        !item.name?.startsWith("Voucher") &&
        !item.name?.startsWith("Add Participant")
    );
    return fromItems;
  }, [booking?.additionalOrder, booking?.items, booking?.trip?.title]);

  // Synchronize additional items state
  useEffect(() => {
    const itemsMap = new Map<number, AdditionalItemState>();

    // 1. Process items from initial DP order
    initialOrderedAdditionals.forEach((ord: any) => {
      const addId = Number(ord.additionalId || ord.id || 0);
      const fullPrice = Number(ord.price || 0);
      const initialQty = Number(ord.quantity || 0);
      const repaymentPricePerUnit = booking?.paymentScheme === "DP" ? Math.round(fullPrice * 0.5) : fullPrice;

      itemsMap.set(addId, {
        additionalId: addId,
        name: ord.name || "Layanan Tambahan",
        unit: ord.unit || "pax",
        fullPrice,
        repaymentPricePerUnit,
        initialOrderedQty: initialQty,
        quantity: Math.min(initialQty, selectedCount || initialQty),
        isFromInitialOrder: true,
      });
    });

    // 2. Process other available destination additionals
    destinationAdditionals.forEach((destAdd: any) => {
      if (!itemsMap.has(destAdd.additionalId)) {
        const fullPrice = destAdd.promoPrice ?? destAdd.price ?? 0;
        itemsMap.set(destAdd.additionalId, {
          additionalId: destAdd.additionalId,
          name: destAdd.name,
          unit: destAdd.unit,
          fullPrice,
          repaymentPricePerUnit: fullPrice,
          initialOrderedQty: 0,
          quantity: 0,
          isFromInitialOrder: false,
        });
      }
    });

    setAdditionalItemsState(Array.from(itemsMap.values()));
  }, [initialOrderedAdditionals, destinationAdditionals, booking?.paymentScheme, isOpen]);

  // Adjust max additional quantity when participant selection changes
  useEffect(() => {
    setAdditionalItemsState((prev) =>
      prev.map((item) => {
        if (item.quantity > selectedCount && selectedCount > 0) {
          return { ...item, quantity: selectedCount };
        }
        return item;
      })
    );
  }, [selectedCount]);

  const handleIncreaseAdditional = (id: number) => {
    setAdditionalItemsState((prev) =>
      prev.map((item) => {
        if (item.additionalId !== id) return item;
        const maxAllowed = item.isFromInitialOrder
          ? Math.min(item.initialOrderedQty, selectedCount)
          : selectedCount;

        if (item.quantity >= maxAllowed) {
          toast.error(`Maksimal ${maxAllowed} item sesuai peserta dilunasi`);
          return item;
        }
        return { ...item, quantity: item.quantity + 1 };
      })
    );
  };

  const handleDecreaseAdditional = (id: number) => {
    setAdditionalItemsState((prev) =>
      prev.map((item) => {
        if (item.additionalId !== id) return item;
        if (item.quantity <= 0) return item;
        return { ...item, quantity: item.quantity - 1 };
      })
    );
  };

  // Base Repayment Calculation
  const totalBaseRepayment = payment?.grossAmount || payment?.amount || 0;

  // Calculate base initial additionals repayment amount if any
  const totalInitialAdditionalsRepayment = initialOrderedAdditionals.reduce((sum: number, ord: any) => {
    const fullPrice = Number(ord.price || 0);
    const qty = Number(ord.quantity || 0);
    const unitRepayment = booking?.paymentScheme === "DP" ? Math.round(fullPrice * 0.5) : fullPrice;
    return sum + unitRepayment * qty;
  }, 0);

  // Pure Pax Repayment Total
  const purePaxBaseRepayment = Math.max(0, totalBaseRepayment - totalInitialAdditionalsRepayment);
  const repaymentPerPax =
    totalOriginalParticipants > 0
      ? Math.round(purePaxBaseRepayment / totalOriginalParticipants)
      : Math.round(totalBaseRepayment / (totalOriginalParticipants || 1));

  const currentParticipantsRepayment = repaymentPerPax * selectedCount;

  // Selected Additionals Repayment Total
  const totalAdditionalsAmount = additionalItemsState.reduce(
    (sum, item) => sum + item.repaymentPricePerUnit * item.quantity,
    0
  );

  const totalRepaymentAmount = currentParticipantsRepayment + totalAdditionalsAmount;

  const hasPartialAdditionals = additionalItemsState.some(
    (item) => item.isFromInitialOrder && item.quantity < item.initialOrderedQty
  );

  const isAnyReduction = isPartialParticipants || hasPartialAdditionals;
  const reductionAmount = Math.max(0, totalBaseRepayment - totalRepaymentAmount);

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
        {
          id: "SAHABAT_SAMPOERNA",
          name: "Sahabat Sampoerna",
          image: "/images/payment-method/sampoerna.png",
        },
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
      options: [{ id: "AKULAKU", name: "Akulaku", image: "/images/payment-method/akulaku.png" }],
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedCount === 0) {
      toast.error("Pilih minimal 1 peserta untuk dilunasi");
      return;
    }

    if (!selectedPayment) {
      toast.error("Silakan pilih metode pembayaran");
      return;
    }

    const paymentWindow = window.open("", "_blank");
    if (paymentWindow) {
      paymentWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Menyiapkan Pembayaran Pelunasan...</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  <style>
                    body {
                      margin: 0;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      min-height: 100vh;
                      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                      background-color: #f8fafc;
                      color: #334155;
                    }
                    .card {
                      text-align: center;
                      padding: 32px 24px;
                      background: #ffffff;
                      border-radius: 16px;
                      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
                      max-width: 360px;
                      width: 90%;
                    }
                    .spinner {
                      width: 44px;
                      height: 44px;
                      border: 4px solid #e2e8f0;
                      border-top-color: #0284c7;
                      border-radius: 50%;
                      animation: spin 0.8s linear infinite;
                      margin: 0 auto 20px;
                    }
                    @keyframes spin { to { transform: rotate(360deg); } }
                    h2 { margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #0f172a; }
                    p { margin: 0; font-size: 14px; color: #64748b; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="spinner"></div>
                    <h2>Menyiapkan Pembayaran Pelunasan</h2>
                    <p>Mohon tunggu sebentar, Anda akan otomatis diarahkan ke halaman pembayaran...</p>
                  </div>
                </body>
              </html>
            `);
    }

    setIsSubmitting(true);
    try {
      const additional_order = additionalItemsState
        .filter((item) => item.quantity > 0)
        .map((item) => ({
          additionalId: item.additionalId,
          quantity: item.quantity,
        }));

      const excludedIds = allParticipants
        .filter((bp: any, idx: number) => !selectedParticipantIds.includes(bp.id ?? idx))
        .map((bp: any, idx: number) => bp.id ?? idx);

      const res = await bookingApi.createRepaymentInvoice(
        Number(booking.bookingId),
        selectedPayment,
        additional_order.length > 0 ? additional_order : undefined,
        {
          participantIds: selectedParticipantIds,
          excludedParticipantIds: excludedIds,
          slots: selectedCount,
          amount: totalRepaymentAmount,
        }
      );

      if (res?.invoiceUrl) {
        if (paymentWindow) {
          paymentWindow.location.href = res.invoiceUrl;
        } else {
          window.open(res.invoiceUrl, "_blank");
        }
      } else {
        if (paymentWindow) paymentWindow.close();
        toast.error("Gagal memproses pembayaran pelunasan");
      }

      queryClient.invalidateQueries({
        queryKey: ["history-detail", Number(booking.bookingId)],
      });
      queryClient.invalidateQueries({ queryKey: ["history"] });

      onClose();
    } catch (err: any) {
      if (paymentWindow) paymentWindow.close();
      console.error("Repayment error:", err);
      alert(err?.response?.data?.error || "Gagal memproses pembayaran pelunasan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-5xl md:max-w-6xl sm:max-h-[92vh] sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl text-slate-800 border border-slate-100">
        
        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-sky-50/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
              <CreditCard className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-bold text-slate-900">
                  Pelunasan Pembayaran
                </h2>
                {isAnyReduction && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <Sparkles className="size-2.5" /> Pelunasan Parsial
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {booking?.trip?.title || "Perjalanan Travel Buddies"} • Booking #{booking?.bookingId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="cursor-pointer p-2 hover:bg-sky-100/60 rounded-full transition-colors border-0 bg-transparent outline-none flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">
          
          {/* LEFT COLUMN: Steps Form */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 lg:border-r lg:border-slate-100">
            
            {/* Informational banner */}
            <div className="bg-sky-50/60 p-3.5 sm:p-4 rounded-2xl border border-sky-100 text-sky-900 text-xs sm:text-sm leading-relaxed flex items-start gap-2.5">
              <AlertCircle className="size-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Ketentuan Pelunasan:</span> Pilih peserta dan layanan tambahan yang akan dilunasi. Jika ada peserta yang batal ikut, hilangkan tanda centang pada namanya (DP peserta yang batal dinyatakan hangus).
              </div>
            </div>

            {/* STEP 1: Participants Checklist */}
            <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-lg bg-sky-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                    1
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Pilih Peserta yang Diberangkatkan
                  </h3>
                  <span className="text-xs font-semibold text-slate-400">
                    ({selectedCount}/{totalOriginalParticipants} dipilih)
                  </span>
                </div>

                {selectedCount < totalOriginalParticipants && (
                  <button
                    type="button"
                    onClick={handleSelectAllParticipants}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-sky-100 flex items-center gap-1"
                  >
                    <CheckSquare className="size-3.5" /> Pilih Semua
                  </button>
                )}
              </div>

              {/* Participants Items List */}
              <div className="space-y-2.5">
                {allParticipants.map((bp: any, idx: number) => {
                  const pId = bp.id ?? idx;
                  const isSelected = selectedParticipantIds.includes(pId);
                  const isPic = idx === 0 || bp.label === "pic";

                  return (
                    <div
                      key={pId}
                      onClick={() => handleToggleParticipant(pId)}
                      className={`p-3 sm:p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
                        isSelected
                          ? "border-sky-500 bg-sky-50/20 shadow-xs"
                          : "border-slate-200 bg-slate-50/60 opacity-60 hover:opacity-85"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`size-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "bg-sky-600 text-white"
                              : "border border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected ? (
                            <Check className="size-3.5 stroke-[3]" />
                          ) : (
                            <Square className="size-3 text-transparent" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold text-xs sm:text-sm truncate ${
                                isSelected ? "text-slate-900" : "text-slate-500 line-through"
                              }`}
                            >
                              {bp.participant?.name || `Peserta ${idx + 1}`}
                            </span>
                            {isPic && (
                              <span className="text-[9px] bg-sky-100 text-sky-700 font-bold px-1.5 py-0.5 rounded uppercase shrink-0">
                                PIC
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {bp.participant?.phone ? `${bp.participant.phone} • ` : ""}
                            KTP: {obfuscateKtp(bp.participant?.noKtp)}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <UserCheck className="size-3" /> {formatRupiah(repaymentPerPax)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                            <UserX className="size-3" /> Batal (Hangus)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: Layanan Tambahan (Additionals) */}
            {additionalItemsState.length > 0 && (
              <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-lg bg-sky-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                      2
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      Layanan Tambahan (Additional Items)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    Maks. {selectedCount} per item
                  </span>
                </div>

                <div className="space-y-2.5">
                  {additionalItemsState.map((item) => {
                    const isOrderedAtDP = item.isFromInitialOrder;
                    const maxAllowed = isOrderedAtDP
                      ? Math.min(item.initialOrderedQty, selectedCount)
                      : selectedCount;

                    const isDisabledDecrease = item.quantity <= 0;
                    const isDisabledIncrease = item.quantity >= maxAllowed;

                    return (
                      <div
                        key={item.additionalId}
                        className={`p-3 sm:p-3.5 rounded-xl border-2 flex items-center justify-between gap-3 transition-all ${
                          item.quantity > 0
                            ? "border-sky-500 bg-sky-50/20"
                            : "border-slate-100 bg-slate-50/50 opacity-70"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                              {item.name}
                            </p>
                            {isOrderedAtDP && (
                              <span className="text-[9px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded">
                                Awal: {item.initialOrderedQty}x
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-bold text-sky-700 mt-0.5">
                            {formatRupiah(item.repaymentPricePerUnit)}{" "}
                            <span className="text-[10px] text-slate-400 font-normal">
                              /{item.unit}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => handleDecreaseAdditional(item.additionalId)}
                              disabled={isDisabledDecrease}
                              className="size-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white transition-all cursor-pointer disabled:cursor-not-allowed shadow-xs"
                            >
                              <Minus className="size-3.5" />
                            </button>

                            <span className="w-6 text-center font-black text-slate-800 text-xs sm:text-sm">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleIncreaseAdditional(item.additionalId)}
                              disabled={isDisabledIncrease}
                              className="size-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white transition-all cursor-pointer disabled:cursor-not-allowed shadow-xs"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>

                          <div className="text-right min-w-[70px]">
                            <span className="text-xs font-bold text-slate-900 block">
                              {formatRupiah(item.repaymentPricePerUnit * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Payment Method Selector */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-lg bg-sky-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                  {additionalItemsState.length > 0 ? "3" : "2"}
                </div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Pilih Metode Pembayaran
                </h3>
              </div>

              <div className="space-y-2.5">
                {paymentMethods.map((method) => {
                  const isSelected = expandedCategory === method.id;
                  const Icon = method.icon;
                  const options = method.banks || method.options;
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
                        className={`cursor-pointer w-full flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border-2 transition-all text-left bg-transparent ${
                          isDisabled
                            ? "opacity-70 bg-slate-50/50 grayscale-[50%] cursor-not-allowed border-slate-200"
                            : (options && isSelected) || (!options && selectedPayment === method.id)
                            ? "border-sky-500 bg-sky-50/20 shadow-xs"
                            : "border-slate-100 bg-white hover:border-sky-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl ${
                              isDisabled
                                ? "bg-slate-100 text-slate-400"
                                : (options && isSelected) || (!options && selectedPayment === method.id)
                                ? "bg-sky-600 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <Icon className="size-5" />
                          </div>
                          <div>
                            <span className={`font-bold text-sm ${isDisabled ? "text-slate-400" : "text-slate-800"}`}>
                              {method.name}
                            </span>
                            {isDisabled && (
                              <span className="block mt-0.5 text-[10px] text-red-500 font-bold uppercase tracking-wider">
                                Maksimal Rp 10 Juta
                              </span>
                            )}
                          </div>
                        </div>

                        {isDisabled ? (
                          <Ban className="size-4 text-slate-300" />
                        ) : options ? (
                          <ChevronRight
                            className={`size-4 text-slate-400 transition-transform ${
                              isSelected ? "rotate-90" : ""
                            }`}
                          />
                        ) : (
                          selectedPayment === method.id && (
                            <div className="size-5 bg-sky-600 rounded-full flex items-center justify-center shrink-0">
                              <Check className="size-3 text-white stroke-[3]" />
                            </div>
                          )
                        )}
                      </button>

                      {options && isSelected && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5 p-3 bg-slate-50 rounded-2xl animate-fade-in border border-slate-100">
                          {options.map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setSelectedPayment(option.id)}
                              className={`cursor-pointer relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all bg-white ${
                                selectedPayment === option.id
                                  ? "border-sky-500 bg-white shadow-xs scale-102"
                                  : "border-transparent bg-white hover:border-sky-200"
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
                              <span className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                {option.name}
                              </span>
                              {selectedPayment === option.id && (
                                <div className="absolute top-1.5 right-1.5">
                                  <div className="size-4 bg-sky-600 rounded-full flex items-center justify-center">
                                    <Check className="size-2.5 text-white stroke-[3]" />
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
          </div>

          {/* RIGHT COLUMN: Dedicated Ringkasan Pembayaran (Sticky / Desktop) */}
          <div className="hidden lg:flex lg:w-[380px] bg-slate-50/50 border-l border-slate-100 p-6 overflow-y-auto flex-col justify-between shrink-0 text-slate-800">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Receipt className="size-5 text-sky-600" /> Ringkasan Pelunasan
                </h3>
                {isAnyReduction && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Parsial
                  </span>
                )}
              </div>

              {/* Breakdown Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div>
                  <p className="font-bold text-[10px] uppercase tracking-wider text-sky-600">
                    Pemesanan
                  </p>
                  <p className="font-bold text-slate-800 text-xs mt-0.5 truncate">
                    {booking?.trip?.title || "Perjalanan Travel Buddies"}
                  </p>
                </div>

                <div className="pt-2 border-t border-dashed border-slate-200 space-y-2 text-xs text-slate-600">
                  {isAnyReduction && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Total Sisa Awal ({totalOriginalParticipants} Pax)</span>
                      <span className="line-through">{formatRupiah(totalBaseRepayment)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-700">
                      Peserta ({selectedCount} Pax × {formatRupiah(repaymentPerPax)})
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatRupiah(currentParticipantsRepayment)}
                    </span>
                  </div>

                  {additionalItemsState
                    .filter((item) => item.quantity > 0)
                    .map((item) => (
                      <div
                        key={item.additionalId}
                        className="flex items-center justify-between text-slate-600"
                      >
                        <span className="truncate max-w-[180px]">
                          {item.name} ({item.quantity}×)
                        </span>
                        <span className="font-semibold text-slate-800">
                          {formatRupiah(item.repaymentPricePerUnit * item.quantity)}
                        </span>
                      </div>
                    ))}

                  {isAnyReduction && reductionAmount > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-emerald-600 font-bold text-[11px]">
                      <span>Penyesuaian Biaya</span>
                      <span>- {formatRupiah(reductionAmount)}</span>
                    </div>
                  )}
                </div>

                {/* Total Section */}
                <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Total Pelunasan
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ({selectedCount} Pax • {additionalItemsState.reduce((s, i) => s + i.quantity, 0)} Item)
                    </span>
                  </div>
                  <span className="text-xl font-black text-sky-700">
                    {formatRupiah(totalRepaymentAmount)}
                  </span>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                <span>Pembayaran aman & invoice langsung terbit otomatis.</span>
              </div>
            </div>

            {/* Desktop Action Button */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting || !selectedPayment || selectedCount === 0}
                className="cursor-pointer w-full py-3.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md shadow-sky-100 flex items-center justify-center gap-2 text-sm border-0"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin size-4" />
                    Memproses Pembayaran...
                  </>
                ) : (
                  <>
                    Bayar Sekarang
                    <ChevronRight className="size-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer (Mobile & Tablet) */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-100 bg-white flex items-center justify-between gap-4 shrink-0 lg:hidden">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Pelunasan:
            </span>
            <span className="text-base sm:text-lg font-black text-sky-700">
              {formatRupiah(totalRepaymentAmount)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 font-bold text-slate-600 rounded-xl hover:bg-slate-100 transition-colors text-xs border-0 bg-transparent cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting || !selectedPayment || selectedCount === 0}
              className="px-4 py-2.5 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs cursor-pointer border-0 shadow-md shadow-sky-100 flex items-center gap-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin size-3.5" />
                  Memproses...
                </>
              ) : (
                <>
                  Bayar Sekarang
                  <ChevronRight className="size-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}