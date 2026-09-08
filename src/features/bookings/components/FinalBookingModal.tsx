/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { X, Users, MapPin, CreditCard, CircleAlert, Coins } from "lucide-react";
import dayjs from "dayjs";
import { formatRupiah } from "@/lib/format-rupiah";
import { Tag } from "lucide-react";
import { useTerms } from "@/features/terms";
import Skeleton from "react-loading-skeleton";

export interface SummaryResponse {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface SelectedAvailableDate {
  id: number | null;
  date: string; // ISO string
  minimum: number | null;
  price: number | null;
  quota: number | null;
  remaining: number | null;
  status: "pending" | "confirmed" | "cancelled" | string;
}

export interface BookingMeetingPoint {
  time?: string;
  location?: string;
}

export interface BookingData {
  selectedAvailableDate: SelectedAvailableDate | null;
  participants: BookingParticipant[];
  paymentMethod?: string | null;
  paymentScheme?: "FULL" | "DP";
  customDpAmount?: number;
}

export interface BookingParticipant {
  meetingPoint: BookingMeetingPoint | null;
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  noKtp?: string;
  dateOfBirth?: string;
  label?: string;
  gender?: string;
}

interface Props {
  onClose: () => void;
  bookingData: BookingData;
  prefetchedSummary: any;
  onSubmit: (data: any, paymentWindow?: Window | null) => void;
  isLoading: boolean;
  summaryLoading: boolean;
}

function SummarySkeleton() {
  return (
    <>
      <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
        <div className="flex items-start gap-3">
          <div className="size-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
            <MapPin className="size-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <Skeleton width={80} height={14} borderRadius={4} />
            <Skeleton width={100} height={14} borderRadius={4} />
            <Skeleton width={50} height={10} borderRadius={4} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <Skeleton width={120} height={16} borderRadius={6} />
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton width={100} height={14} borderRadius={4} />
              <Skeleton width={80} height={14} borderRadius={4} />
            </div>
            <div className="space-y-2">
              <Skeleton width={130} height={12} borderRadius={4} />
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between items-center pl-2">
                  <Skeleton width={120} height={14} borderRadius={4} />
                  <Skeleton width={70} height={14} borderRadius={4} />
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center gap-2">
              <Skeleton width={140} height={14} borderRadius={4} />
              <Skeleton width={80} height={14} borderRadius={4} />
            </div>
            <div className="border-t border-gray-200 my-2" />
            <div className="flex justify-between items-center">
              <Skeleton width={110} height={16} borderRadius={4} />
              <Skeleton width={100} height={24} borderRadius={6} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton circle width={16} height={16} />
            <Skeleton width={160} height={16} borderRadius={6} />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg"
              >
                <Skeleton
                  circle
                  width={20}
                  height={20}
                  className="shrink-0 mt-0.5"
                />
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Skeleton
                      width={100 + i * 20}
                      height={14}
                      borderRadius={4}
                    />
                    {i === 1 && (
                      <Skeleton width={56} height={16} borderRadius={999} />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Skeleton circle width={12} height={12} />
                    <Skeleton width={160} height={12} borderRadius={4} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export const FinalBookingModal = ({
  onClose,
  bookingData,
  prefetchedSummary,
  onSubmit,
  isLoading,
  summaryLoading,
}: Props) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const { data: termsData } = useTerms();
  const terms = termsData?.items?.[0];
  const sanitizedContent = terms?.content.replace(/&nbsp;/g, " ");

  const [tripSummaries, setTripSummaries] = useState<SummaryResponse[]>([]);
  const [additionalSummary, setAdditionalSummary] = useState<
    SummaryResponse[] | null
  >([]);
  const [adminFeeSummary, setAdminFeeSummary] = useState<
    SummaryResponse | null
  >(null);
  const [promoSummary, setPromoSummary] = useState<SummaryResponse | null>(
    null,
  );
  const [cashbackSummary, setCashbackSummary] = useState<SummaryResponse | null>(
    null,
  );
  const [discountValueSummary, setDiscountValueSummary] = useState<number>(0);
  const [totalPriceSummary, setTotalPriceSummary] = useState<number>(0);
  const hasFetched = useRef<boolean>(false);

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const bottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 10;
    if (bottom && !isScrolledToBottom) {
      setIsScrolledToBottom(true);
    }
  };

  const parseSummary = (data: any) => {
    setTripSummaries(
      data.item_details?.filter((i: any) => i.id.startsWith("trip-")) ?? [],
    );
    setAdditionalSummary(
      data.item_details?.filter((i: any) => i.id.startsWith("additional-")) ??
      [],
    );
    setAdminFeeSummary(
      data.item_details?.find((i: any) => i.id.startsWith("admin-fee-")) ?? null,
    );
    setPromoSummary(
      data.item_details?.find(
        (i: any) => i.id.startsWith("promo-") || i.id.startsWith("voucher-"),
      ) ?? null,
    );
    setCashbackSummary(
      data.item_details?.find((i: any) => i.id.startsWith("cashback-")) ?? null,
    );
    setDiscountValueSummary(data.discountValue ?? 0);
    setTotalPriceSummary(data.totalAmount ?? 0);
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    if (prefetchedSummary) {
      parseSummary(prefetchedSummary);
      return;
    }
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
          <div className="relative bg-linear-to-r from-emerald-600 to-emerald-700 px-6 py-5 text-white">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="size-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <CircleAlert className="size-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Konfirmasi Pemesanan</h2>
                <p className="text-sm text-white/80">
                  Periksa kembali detail pesanan Anda
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {summaryLoading ? (
              <SummarySkeleton />
            ) : (
              <>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-start gap-3">
                    <div className="size-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="size-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-0.5">Destinasi</p>
                      <p className="text-sm font-medium text-gray-900">
                        {tripSummaries?.[0]?.name
                          ? tripSummaries[0].name.replace(/ \(([^)]+)\)$/, "")
                          : ""}
                      </p>
                      {bookingData?.selectedAvailableDate && (
                        <p className="text-xs text-gray-600 mt-1">
                          {dayjs(bookingData?.selectedAvailableDate.date).format(
                            "DD MMMM YYYY",
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-medium text-gray-700">
                      Ringkasan Harga
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="space-y-2 mb-3">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Peserta Trip
                      </p>
                      {tripSummaries?.map((ts: any) => {
                        const isChild = ts.id?.toString().endsWith("-child") || ts.name?.toLowerCase().includes("anak");
                        const typeLabel = isChild ? "(ANAK)" : "(DEWASA)";
                        return (
                          <div key={ts.id} className="space-y-2 pl-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Jumlah Peserta {typeLabel}</span>
                              <span className="font-medium text-gray-900">
                                {ts.quantity} Orang
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Harga per Orang {typeLabel}</span>
                              <span className="font-medium text-gray-900">
                                {formatRupiah(ts.price ?? 0)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Subtotal Trip {typeLabel}</span>
                              <span className="font-semibold text-gray-900">
                                {formatRupiah(
                                  (ts.price ?? 0) * (ts.quantity ?? 0),
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {((additionalSummary && additionalSummary.length > 0) || adminFeeSummary) && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tambahan Layanan
                        </p>
                        {additionalSummary?.map(
                          (item: SummaryResponse, index: number) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-sm pl-2"
                            >
                              <span className="text-gray-600">
                                {item.name} ×{item.quantity}
                              </span>
                              <span className="text-gray-900">
                                {formatRupiah(item?.price! * item.quantity)}
                              </span>
                            </div>
                          ),
                        )}
                        {adminFeeSummary && (
                          <div className="flex justify-between items-center text-sm pl-2">
                            <span className="text-gray-600">
                              {adminFeeSummary.name}
                            </span>
                            <span className="text-gray-900">
                              {formatRupiah(adminFeeSummary.price * adminFeeSummary.quantity)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {promoSummary && (
                      <div className="flex justify-between items-center text-sm gap-2">
                        <span className="text-gray-600 flex items-center gap-1 line-clamp-1">
                          <Tag className="size-3 text-rose-500" />
                          {promoSummary?.name}
                        </span>
                        <span className="font-medium text-rose-600 shrink-0">
                          - {formatRupiah(discountValueSummary)}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-gray-200 my-2"></div>

                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">
                        {bookingData?.paymentScheme === "DP" ? "Total Tagihan (DP)" : "Total Pembayaran"}
                      </span>
                      <span className="text-xl font-bold text-emerald-600">
                        {formatRupiah(
                          bookingData?.paymentScheme === "DP" && prefetchedSummary?.dpAmount
                            ? prefetchedSummary.dpAmount
                            : totalPriceSummary
                        )}
                      </span>
                    </div>

                    {bookingData?.paymentScheme === "DP" && prefetchedSummary?.remainingAmount && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-left">
                        <div className="flex justify-between items-center text-xs font-semibold text-blue-900 mb-1">
                          <span>Sisa Pelunasan (Tahap 2)</span>
                          <span>{formatRupiah(prefetchedSummary.remainingAmount)}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-tight">
                          Pelunasan paling lambat pada tanggal{" "}
                          <span className="font-bold text-blue-900">
                            {prefetchedSummary?.dpDeadline ? dayjs(prefetchedSummary.dpDeadline).format("DD MMMM YYYY") : "-"}
                          </span>
                        </p>
                      </div>
                    )}

                    {cashbackSummary && (
                      <div className="flex justify-between items-start text-sm gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        <span className="text-amber-700 flex items-center gap-1.5 line-clamp-1">
                          <span className="flex items-center justify-center size-4 bg-amber-400 rounded-full shrink-0">
                            <Coins className="size-2.5 text-white" />
                          </span>
                          <span className="font-medium">
                            {cashbackSummary?.name}
                          </span>
                        </span>
                        <span className="font-semibold text-amber-600 shrink-0 whitespace-nowrap">
                          +{" "}
                          {formatRupiah(
                            cashbackSummary?.price * cashbackSummary?.quantity,
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* {bookingData?.participants &&
                  bookingData?.participants.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Users className="size-4 text-purple-600" />
                        <span>
                          Daftar Peserta ({bookingData?.participants.length})
                        </span>
                      </h3>
                      <div className="">
                        {bookingData?.participants.map(
                          (participant, index: number) => {
                            return (
                              <div
                                key={index}
                                className="flex items-start gap-2 text-sm bg-gray-50 p-3 rounded-lg"
                              >
                                <div className="size-5 bg-purple-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                  <span className="text-xs text-purple-600 font-medium">
                                    {index + 1}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-gray-900">
                                      {participant.name}
                                    </p>
                                    {participant.label === "pic" && (
                                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                        Pemesan
                                      </span>
                                    )}
                                  </div>
                                  {participant?.meetingPoint && (
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                      <MapPin className="size-3 text-gray-400" />
                                      {participant?.meetingPoint?.time
                                        ? `${participant?.meetingPoint?.time} - ${participant?.meetingPoint?.location}`
                                        : `${participant?.meetingPoint?.location}`}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )} */}
              </>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="size-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-gray-500">Metode Pembayaran</p>
                    <p className="text-sm font-medium text-gray-900">
                      {bookingData?.paymentMethod || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 space-y-4">
            <button
              onClick={() => setShowTermsModal(true)}
              className="w-full py-3 bg-linear-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 font-medium text-sm cursor-pointer disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/25"
            >
              Lanjutkan Pembayaran
            </button>
          </div>
        </div>
      </div>

      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Syarat dan Ketentuan
              </h3>
              <button
                disabled={isLoading || summaryLoading}
                onClick={() => {
                  setAgreedToTerms(false);
                  setIsScrolledToBottom(false);
                  setShowTermsModal(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <X className="size-5" />
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto px-6 py-4"
              onScroll={handleTermsScroll}
            >
              <div className="space-y-4 text-sm text-gray-700">
                <div className="max-w-[1024px] 2xl:max-w-[1440px] mx-auto px-5 xl:px-0">
                  <h1 className="font-bold text-3xl mt-5">{terms?.title}</h1>
                  <div
                    className="html-content prose prose-lg max-w-full mt-5"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent! }}
                  />
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 smt-6">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    <strong>Catatan:</strong> Dengan mencentang kotak persetujuan
                    dan melanjutkan pembayaran, Anda menyatakan telah membaca
                    dan menyetujui seluruh syarat dan ketentuan di atas. Jika
                    ada pertanyaan, silakan hubungi customer service kami
                    sebelum melakukan pemesanan.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 space-y-3">
              {!isScrolledToBottom ? (
                <p className="w-full text-sm text-center text-amber-600">
                  Scroll kebawah untuk membaca seluru syarat dan ketentuan
                </p>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="flex items-center">
                    <input
                      id="terms-checkbox"
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      disabled={isLoading}
                      className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <label
                    htmlFor="terms-checkbox"
                    className="text-sm text-gray-700 leading-tight"
                  >
                    Saya telah membaca dan menyetujui{" "}
                    <span className="text-emerald-600 font-medium hover:text-emerald-700 disabled:cursor-not-allowed">
                      Syarat dan Ketentuan
                    </span>{" "}
                    yang berlaku
                  </label>
                </div>
              )}

              <button
                onClick={() => {
                  const paymentWindow = window.open("", "_blank");
                  if (paymentWindow) {
                    paymentWindow.document.write(`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <title>Mengarahkan ke Xendit...</title>
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
                            @keyframes spin {
                              to { transform: rotate(360deg); }
                            }
                            h2 {
                              margin: 0 0 8px;
                              font-size: 18px;
                              font-weight: 600;
                              color: #0f172a;
                            }
                            p {
                              margin: 0;
                              font-size: 14px;
                              color: #64748b;
                            }
                          </style>
                        </head>
                        <body>
                          <div class="card">
                            <div class="spinner"></div>
                            <h2>Mengarahkan ke Pembayaran</h2>
                            <p>Mohon tunggu sebentar, kami sedang me-redirect Anda ke Xendit...</p>
                          </div>
                        </body>
                      </html>
                    `);
                  }
                  onSubmit({}, paymentWindow);
                }}
                disabled={!agreedToTerms || isLoading}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Memproses Pemesanan ....
                  </span>
                ) : (
                  "Selesaikan Pembayaran"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
