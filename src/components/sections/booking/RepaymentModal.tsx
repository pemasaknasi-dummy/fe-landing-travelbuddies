"use client";
import { bookingApi } from "@/features/bookings/api/booking-api";
import { formatRupiah } from "@/lib/format-rupiah";
import { obfuscateKtp } from "@/lib/obfuscate-ktp";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, Check, ChevronRight, CreditCard, Hourglass, Loader2, Smartphone, Users, Wallet, XCircle, Ban } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

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

    const trip = booking?.trip;
    const hasAdditionals = useMemo(() => normalizeAdditionals(trip), [trip]);

    useEffect(() => {
        if (!hasAdditionals?.length) return;

        setAdditionalQuantities((prev) => {
            return (hasAdditionals as NormalizedAdditional[]).map((item) => {
                const existing = prev.find(
                    (p) => p?.additionalId === item?.additionalId
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
                    : item
            )
        );
    };

    const handleDecreaseAdditional = (id: number) => {
        setAdditionalQuantities((prev) =>
            prev.map((item) => {
                if (item?.additionalId !== id) return item;
                if (item?.quantity <= 0) return item;
                return { ...item, quantity: item?.quantity - 1 };
            })
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
                      border-top-color: #2563eb;
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
                    <p>Mohon tunggu sebentar, Anda akan otomatis diarahkan ke Pembayaran...</p>
                  </div>
                </body>
              </html>
            `);
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
                if (paymentWindow) {
                    paymentWindow.location.href = res.invoiceUrl;
                } else {
                    window.open(res.invoiceUrl, "_blank");
                }
            } else {
                if (paymentWindow) paymentWindow.close();
                toast.error("Gagal memproses pembayaran pelunasan");
            }

            // Invalidate queries to reload detail page
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full h-full sm:h-auto sm:max-w-5xl sm:max-h-[90vh] sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl text-slate-800">
                <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-amber-50/50">
                    <h2 className="text-lg sm:text-xl font-bold text-amber-950">
                        Pelunasan Booking
                    </h2>
                    <button
                        onClick={onClose}
                        className="cursor-pointer p-2 hover:bg-amber-100 rounded-full transition-colors border-0 bg-transparent outline-none flex items-center justify-center"
                    >
                        <XCircle className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 flex flex-col lg:flex-row min-h-0 gap-6">
                    {/* Left: Participant Data (Read Only) */}
                    <div className="flex-1 space-y-4">
                        <div className="border-b border-slate-100 pb-2">
                            <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                                <Users className="w-4 h-4 text-sky-600" /> Data Peserta
                            </h3>
                        </div>

                        <div className="space-y-3 max-h-[40vh] lg:max-h-[50vh] overflow-y-auto p-1 pr-2">
                            {booking?.bookingParticipants?.map((bp: any, idx: number) => (
                                <div
                                    key={bp.id || idx}
                                    className="p-4 border border-slate-150 rounded-2xl bg-slate-50/50 space-y-3 text-left"
                                >
                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                                        <div className="size-5 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center text-xs font-bold">
                                            {idx + 1}
                                        </div>
                                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                            {bp.participant?.name || "-"}
                                        </span>
                                        {idx === 0 && (
                                            <span className="text-[9px] bg-sky-50 text-sky-600 border border-sky-100 px-1.5 py-0.5 rounded-full font-bold uppercase shrink-0">
                                                PIC
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[11px] sm:text-xs text-slate-500">
                                        <div>
                                            <span className="text-slate-400 font-semibold block">Email</span>
                                            <span className="font-medium text-slate-700">{bp.participant?.email || "-"}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 font-semibold block">Nomor WhatsApp</span>
                                            <span className="font-medium text-slate-700">{bp.participant?.phone || "-"}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 font-semibold block">Nomor KTP/Passport</span>
                                            <span className="font-medium text-slate-700">{obfuscateKtp(bp.participant?.noKtp)}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 font-semibold block">Jenis Kelamin</span>
                                            <span className="font-medium text-slate-700">
                                                {bp.participant?.gender === "Male" ? "Laki-laki" : bp.participant?.gender === "Female" ? "Perempuan" : "-"}
                                            </span>
                                        </div>
                                        {bp.meetingPoints && (
                                            <div className="sm:col-span-2">
                                                <span className="text-slate-400 font-semibold block">Meeting Point</span>
                                                <span className="font-medium text-slate-700">
                                                    {bp.meetingPoints.location} ({bp.meetingPoints.time})
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Additionals */}
                        {/* <div className="bg-white ring-1 ring-slate-200 shadow-xs rounded-2xl p-4 sm:p-5 mt-4">
              <div className="mb-4 text-left">
                <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-0.5">
                  Layanan Tambahan
                </p>
              </div>

              {hasAdditionals.length === 0 ? (
                <div className="flex items-center gap-2 text-slate-400 py-2">
                  <Info className="size-4 shrink-0" />
                  <p className="text-sm">Destinasi tidak memiliki layanan tambahan</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {hasAdditionals.map((item) => {
                    const quantity =
                      additionalQuantities.find(
                        (q) => q?.additionalId === item?.additionalId
                      )?.quantity ?? 0;
                    const isDisabledDecrease = quantity <= 0;
                    const isDisabledIncrease = quantity >= (booking?.bookingParticipants?.length || 1);

                    return (
                      <div
                        key={item?.additionalId}
                        className="group flex items-center justify-between gap-4 rounded-xl px-3 sm:px-4 py-3 ring-1 ring-slate-100 bg-slate-50/50"
                      >
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {item?.name}
                          </p>
                          <p className="text-xs font-bold text-slate-500">
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
                              ${isDisabledDecrease
                                ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                                : "border-slate-300 text-slate-500 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                              }
                            `}
                          >
                            <Minus className="size-3.5" strokeWidth={3} />
                          </button>

                          <span className="w-5 text-center text-sm font-bold tabular-nums text-slate-800">
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
                              ${isDisabledIncrease
                                ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                                : "border-slate-300 text-slate-500 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                              }
                            `}
                          >
                            <Plus className="size-3.5" strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div> */}
                    </div>

                    {/* Right: Payment Method */}
                    <div className="w-full lg:w-[380px] space-y-4 shrink-0 text-left">
                        <div className="border-b border-slate-100 pb-2">
                            <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                                <CreditCard className="w-4.5 h-4.5 text-amber-500" /> Pilih Metode Pembayaran
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2.5 max-h-[35vh] lg:max-h-[45vh] overflow-y-auto p-1 pr-2">
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
                                                className={`cursor-pointer w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left bg-transparent ${isDisabled 
                                                    ? "opacity-70 bg-slate-50/50 grayscale-[50%] cursor-not-allowed border-slate-200" 
                                                    : ((options && isSelected) || (!options && selectedPayment === method.id)
                                                    ? "border-amber-500 bg-amber-50/20"
                                                    : "border-slate-200 bg-white hover:border-amber-200")}
                                                    `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`p-1.5 rounded-lg ${isDisabled
                                                            ? "bg-slate-100 text-slate-400"
                                                            : ((options && isSelected) || (!options && selectedPayment === method.id)
                                                            ? "bg-amber-500 text-white"
                                                            : "bg-slate-100 text-slate-500")}
                                                            `}
                                                    >
                                                        <Icon className="w-4.5 h-4.5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`font-bold text-xs sm:text-sm ${isDisabled ? "text-slate-400" : "text-slate-800"}`}>
                                                            {method.name}
                                                        </span>
                                                        {isDisabled && (
                                                            <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-red-50 text-red-500 text-[9px] font-bold tracking-wide uppercase rounded w-fit">
                                                                Maks Transaksi Rp 10 Juta
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {isDisabled ? (
                                                    <Ban className="w-4 h-4 text-slate-300" />
                                                ) : options ? (
                                                    <ChevronRight
                                                        className={`w-4 h-4 text-slate-400 transition-transform ${isSelected ? "rotate-90" : ""
                                                            }`}
                                                    />
                                                ) : (
                                                    selectedPayment === method.id && (
                                                        <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center shrink-0">
                                                            <Check className="w-3 h-3 text-white" />
                                                        </div>
                                                    )
                                                )}
                                            </button>

                                            {options && isSelected && (
                                                <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-xl animate-fade-in">
                                                    {options.map((option) => (
                                                        <button
                                                            key={option.id}
                                                            type="button"
                                                            onClick={() => setSelectedPayment(option.id)}
                                                            className={`cursor-pointer relative flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all bg-white ${selectedPayment === option.id
                                                                ? "border-amber-500 bg-white shadow-xs scale-102"
                                                                : "border-transparent bg-white hover:border-amber-200"
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
                                                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">
                                                                {option.name}
                                                            </span>
                                                            {selectedPayment === option.id && (
                                                                <div className="absolute top-1 right-1">
                                                                    <div className="w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center">
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
                        </form>
                    </div>
                </div>

                {/* Repayment Footer */}
                <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4 shrink-0 shadow-xs">
                    <div className="text-left">
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Total Pelunasan
                        </p>
                        <p className="text-base sm:text-lg font-black text-amber-600">
                            {formatRupiah(
                                (payment?.grossAmount || payment?.amount || 0) +
                                additionalQuantities.reduce(
                                    (sum, item) => sum + item.price * item.quantity,
                                    0
                                )
                            )}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 font-bold text-slate-600 rounded-xl hover:bg-slate-200 transition-colors text-xs border-0 bg-transparent cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !selectedPayment}
                            className="px-6 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs cursor-pointer border-0 shadow-md shadow-amber-100 flex items-center gap-1.5 animate-in"
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