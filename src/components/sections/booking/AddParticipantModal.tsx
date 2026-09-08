"use client";
import { useAddParticipants, useAddParticipantsSummary } from "@/features/bookings/hooks/useBooking";
import { formatRupiah } from "@/lib/format-rupiah";
import { AlertCircle, Ban, Building2, Check, ChevronRight, CreditCard, Hourglass, Loader2, Minus, Plus, Receipt, Smartphone, Users, Wallet, XCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export function AddParticipantModal({
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
    const [addedAdultCount, setAddedAdultCount] = useState<number>(1);
    const [addedChildCount, setAddedChildCount] = useState<number>(0);

    const participants = useMemo(() => {
        const list = [];
        for (let i = 0; i < addedAdultCount; i++) {
            list.push({
                name: `Peserta ${i + 1}`,
                customerType: "ADULT",
                meetingPointId: meetingPoints?.[0]?.id || "",
            });
        }
        for (let i = 0; i < addedChildCount; i++) {
            list.push({
                name: `Peserta ${addedAdultCount + i + 1}`,
                customerType: "CHILD",
                meetingPointId: meetingPoints?.[0]?.id || "",
            });
        }
        return list;
    }, [addedAdultCount, addedChildCount, meetingPoints]);

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
            ])
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
            ])
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
                    (p) => p?.additionalId === item?.additionalId
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
            participants: participants.map(p => ({ customerType: p.customerType || "ADULT" })),
            additional_order: additionalQuantities.filter((a) => a.quantity > 0)?.map(a => {
                const { name, price, ...rest } = a;
                return {
                    ...rest,
                };
            }),
        };
    }, [participants, additionalQuantities]);

    const { data: summaryData, isLoading: isLoadingSummary, error: summaryError } =
        useAddParticipantsSummary(bookingId, isOpen ? summaryPayload : null);

    const existingChildCount = summaryData?.oldChildSlots ?? 0;
    const maxAddableChildren = Math.max(0, 2 - existingChildCount);

    useEffect(() => {
        if (summaryData?.oldChildSlots !== undefined) {
            const maxAddable = Math.max(0, 2 - summaryData.oldChildSlots);
            if (addedChildCount > maxAddable) {
                setAddedChildCount(maxAddable);
            }
        }
    }, [summaryData?.oldChildSlots, addedChildCount]);

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
            setAddedAdultCount(1);
            setAddedChildCount(0);
            setSelectedPayment(null);
            setExpandedCategory(null);

            onClose();
        } catch (error: any) {
            alert(error.response?.data?.error || "Gagal menambahkan peserta");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full h-full sm:h-auto sm:max-w-5xl sm:max-h-[90vh] sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl text-slate-800">
                <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-sky-50/50">
                    <h2 className="text-lg sm:text-xl font-bold text-sky-950">
                        Tambah Peserta Baru
                    </h2>
                    <button
                        onClick={onClose}
                        className="cursor-pointer p-2 hover:bg-sky-100 rounded-full transition-colors border-0 bg-transparent outline-none flex items-center justify-center"
                    >
                        <XCircle className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">
                    <form
                        onSubmit={handleSubmit}
                        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 lg:border-r lg:border-slate-100"
                    >
                        <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100 text-sky-900 text-xs sm:text-sm leading-relaxed">
                            <span className="font-bold">Informasi:</span> Menambahkan peserta akan menyesuaikan harga total berdasarkan tier pax terbaru. Data peserta (Nama, KTP, Kontak) dapat dilengkapi di menu riwayat pemesanan setelah pembayaran berhasil.
                        </div>

                        {/* Participant Counter Card */}
                        <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 space-y-4 shadow-xs">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm sm:text-base border-b border-slate-100 pb-3">
                                <Users className="w-5 h-5 text-sky-500" /> Pilih Jumlah Peserta Baru
                            </h3>

                            {/* Dewasa Counter */}
                            <div className="flex items-center justify-between py-1">
                                <div>
                                    <p className="font-bold text-slate-800 text-sm sm:text-base">Dewasa (≥2 tahun)</p>
                                    <p className="text-xs text-slate-400">Peserta usia 11 tahun ke atas</p>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setAddedAdultCount(prev => Math.max(0, prev - 1))}
                                        disabled={addedAdultCount <= 0 || (addedAdultCount + addedChildCount) <= 1}
                                        className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white transition-all cursor-pointer disabled:cursor-not-allowed border-0 shadow-xs"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-black text-slate-800 text-base">
                                        {addedAdultCount}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setAddedAdultCount(prev => prev + 1)}
                                        className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer border-0 shadow-xs"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Anak-anak Counter */}
                            <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-800 text-sm sm:text-base">Anak-anak (≤ 2 tahun)</p>
                                    <p className="text-xs text-slate-400">
                                        Harga 50% dari pax dewasa (Maks. 2 anak per booking)
                                    </p>
                                    {existingChildCount > 0 && (
                                        <p className="text-[11px] font-semibold text-amber-600 mt-0.5">
                                            {existingChildCount >= 2
                                                ? "Booking ini sudah memiliki 2 peserta anak (maksimal)."
                                                : `Booking ini sudah memiliki ${existingChildCount} peserta anak.`}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setAddedChildCount(prev => Math.max(0, prev - 1))}
                                        disabled={addedChildCount <= 0 || (addedAdultCount + addedChildCount) <= 1}
                                        className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white transition-all cursor-pointer disabled:cursor-not-allowed border-0 shadow-xs"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-black text-slate-800 text-base">
                                        {addedChildCount}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setAddedChildCount(prev => Math.min(maxAddableChildren, prev + 1))}
                                        disabled={addedChildCount >= maxAddableChildren}
                                        className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white transition-all cursor-pointer disabled:cursor-not-allowed border-0 shadow-xs"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-4 pt-4 border-t border-slate-200">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2 px-1 text-sm sm:text-base">
                                <CreditCard className="w-4.5 h-4.5 text-sky-600" />
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
                                                className={`cursor-pointer w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border-2 transition-all text-left bg-transparent ${isDisabled
                                                    ? "opacity-70 bg-slate-50/50 grayscale-[50%] cursor-not-allowed border-slate-200"
                                                    : ((options && isSelected) || (!options && selectedPayment === method.id)
                                                        ? "border-sky-500 bg-sky-50/20 shadow-xs"
                                                        : "border-slate-100 bg-white hover:border-sky-200")}
                                                    `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`p-2 rounded-xl ${isDisabled
                                                            ? "bg-slate-100 text-slate-400"
                                                            : ((options && isSelected) || (!options && selectedPayment === method.id)
                                                                ? "bg-sky-600 text-white"
                                                                : "bg-slate-100 text-slate-500")}
                                                            `}
                                                    >
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`font-bold text-sm sm:text-base ${isDisabled ? "text-slate-400" : "text-slate-800"}`}>
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
                                                    <Ban className="w-5 h-5 text-slate-300" />
                                                ) : options ? (
                                                    <ChevronRight
                                                        className={`w-5 h-5 text-slate-400 transition-transform ${isSelected ? "rotate-90" : ""
                                                            }`}
                                                    />
                                                ) : (
                                                    selectedPayment === method.id && (
                                                        <div className="w-5 h-5 bg-sky-600 rounded-full flex items-center justify-center shrink-0">
                                                            <Check className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                    )
                                                )}
                                            </button>

                                            {options && isSelected && (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 p-3 bg-slate-50 rounded-2xl animate-fade-in">
                                                    {options.map((option) => (
                                                        <button
                                                            key={option.id}
                                                            type="button"
                                                            onClick={() => setSelectedPayment(option.id)}
                                                            className={`cursor-pointer relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all bg-white ${selectedPayment === option.id
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
                                                                    <div className="w-4 h-4 bg-sky-600 rounded-full flex items-center justify-center">
                                                                        <Check className="w-2.5 h-2.5 text-white" />
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
                    </form>

                    {/* Pricing Preview (Desktop/LG only) */}
                    <div className="hidden lg:flex lg:w-[380px] bg-slate-50/50 border-l border-slate-100 p-6 overflow-y-auto flex-col shrink-0 text-slate-800">
                        <div className="space-y-6">
                            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-200 pb-3 flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-sky-600" /> Ringkasan Pembayaran
                            </h3>

                            {isLoadingSummary ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                                    <Loader2 className="animate-spin text-sky-600 w-8 h-8" />
                                    <p className="text-sm font-semibold text-slate-500">
                                        Menghitung rincian harga...
                                    </p>
                                </div>
                            ) : summaryError ? (
                                <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 text-xs space-y-2">
                                    <div className="flex items-center gap-2 font-bold">
                                        <AlertCircle className="w-4 h-4 shrink-0" /> Gagal memuat rincian
                                    </div>
                                    <p>
                                        {(summaryError as any).response?.data?.error ||
                                            "Terjadi kesalahan saat menghitung rincian harga."}
                                    </p>
                                </div>
                            ) : summaryData ? (
                                <div className="space-y-4">
                                    <div className="space-y-3 text-sm">
                                        <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-2 text-left shadow-xs">
                                            <div>
                                                <p className="font-bold text-[10px] uppercase tracking-wider text-sky-600">
                                                    Pemesanan Trip
                                                </p>
                                                <p className="font-semibold text-slate-700 mt-1 text-xs">
                                                    {trip?.title}
                                                </p>
                                            </div>

                                            <div className="pt-2 border-t border-dashed border-slate-100 space-y-1 text-xs text-slate-500">
                                                <div className="flex justify-between">
                                                    <span>Slots Awal ({summaryData.oldAdultSlots ?? summaryData.oldSlots} dewasa{(summaryData.oldChildSlots ?? 0) > 0 ? ` + ${summaryData.oldChildSlots} anak` : ""})</span>
                                                    <span>{formatRupiah(summaryData.oldPaxTotal)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Slots Baru ({summaryData.newAdultSlots ?? summaryData.totalSlots} dewasa{(summaryData.newChildSlots ?? 0) > 0 ? ` + ${summaryData.newChildSlots} anak` : ""})</span>
                                                    <span>{formatRupiah(summaryData.newPaxTotal)}</span>
                                                </div>
                                                <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-50">
                                                    <span>Selisih Harga Pax</span>
                                                    <span className="text-sky-600">{formatRupiah(summaryData.paxDiffAmount)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {summaryData.additionalDiffAmount > 0 && (
                                            <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-2 text-left shadow-xs">
                                                <p className="font-bold text-[10px] uppercase tracking-wider text-amber-600">
                                                    Layanan Tambahan
                                                </p>
                                                <div className="space-y-1.5 text-xs text-slate-500">
                                                    {summaryData.item_details
                                                        .filter((item) => item.id?.startsWith("additional-"))
                                                        .map((item, idx) => (
                                                            <div key={idx} className="flex justify-between">
                                                                <span>{item.name}</span>
                                                                <span>{formatRupiah(item.price)}</span>
                                                            </div>
                                                        ))}
                                                    <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-50">
                                                        <span>Subtotal Additional</span>
                                                        <span className="text-sky-600">
                                                            {formatRupiah(summaryData.additionalDiffAmount)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100 flex justify-between items-center mt-6 text-left">
                                        <div className="flex-1 mr-2">
                                            <p className="text-xs font-semibold text-sky-900">
                                                Total Selisih Pembayaran
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                                                Invoice baru akan dibuat sejumlah ini
                                            </p>
                                        </div>
                                        <p className="text-lg font-black text-sky-950 shrink-0">
                                            {formatRupiah(
                                                summaryData.totalDiffAmount - (summaryData.uniqueNumber || 0)
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-sm text-slate-400">
                                    Tambah peserta untuk menghitung rincian harga
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer with actions */}
                <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-xs">
                    {summaryData ? (
                        <div className="flex flex-row justify-between items-center sm:flex-col sm:items-start">
                            <div>
                                <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">
                                    Total Selisih Pembayaran
                                </p>
                                <p className="text-lg sm:text-xl font-black text-sky-600">
                                    {formatRupiah(
                                        summaryData.totalDiffAmount - (summaryData.uniqueNumber || 0)
                                    )}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="hidden sm:block">
                            <p className="text-xs text-slate-400">Silakan pilih jumlah peserta</p>
                        </div>
                    )}

                    <div className="flex gap-3 items-center w-full sm:w-auto">
                        <button
                            type="button"
                            disabled={mutation.isPending}
                            onClick={onClose}
                            className={`cursor-pointer flex-1 sm:flex-none px-6 py-3 font-bold text-slate-600 rounded-xl hover:bg-slate-200 transition-colors text-sm border-0 bg-transparent ${mutation.isPending ? "cursor-not-allowed" : ""
                                }`}
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={mutation.isPending || !selectedPayment || !summaryData}
                            className="cursor-pointer flex-[2] sm:flex-none px-8 py-3 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2 whitespace-nowrap border-0"
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