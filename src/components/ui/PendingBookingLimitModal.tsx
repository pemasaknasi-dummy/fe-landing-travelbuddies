"use client";

import { X, Clock, ChevronRight, AlertTriangle, CreditCard } from "lucide-react";
import Image from "next/image";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

export interface PendingBookingItem {
  bookingId: number;
  orderId: string;
  tripTitle: string;
  tripImage: string | null;
  tripDate: string;
  slots: number;
  createdAt: string;
  invoiceUrl: string | null;
}

interface PendingBookingLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingBookings: PendingBookingItem[];
}

export default function PendingBookingLimitModal({
  isOpen,
  onClose,
  pendingBookings,
}: PendingBookingLimitModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 px-6 pt-6 pb-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-full transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="size-5" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="size-11 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold leading-tight">
                Batas Booking Tercapai
              </h2>
              <p className="text-sm text-white/80 leading-snug mt-0.5">
                Maksimal 2 booking menunggu pembayaran
              </p>
            </div>
          </div>

          <p className="text-sm text-white/90 leading-relaxed">
            Silakan selesaikan pembayaran atau tunggu booking berikut berakhir
            sebelum membuat booking baru.
          </p>
        </div>

        {/* Pending Booking List */}
        <div className="px-4 py-4 space-y-3 max-h-[55vh] overflow-y-auto">
          {pendingBookings.map((booking) => (
            <div
              key={booking.bookingId}
              className="group rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 overflow-hidden"
            >
              <div className="flex items-stretch">
                {/* Trip Image */}
                <div className="relative w-24 min-h-[88px] shrink-0 overflow-hidden">
                  <Image
                    src={booking.tripImage || "/images/empty-state.png"}
                    alt={booking.tripTitle}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                </div>

                {/* Info */}
                <div className="flex-1 px-3 py-2.5 min-w-0">
                  <p className="text-sm font-bold text-gray-900 leading-tight truncate">
                    {booking.tripTitle}
                  </p>

                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="size-3 text-gray-400 shrink-0" />
                    <p className="text-xs text-gray-500">
                      {dayjs(booking.tripDate).format("DD MMM YYYY")}
                    </p>
                    <span className="text-gray-300 text-xs">•</span>
                    <p className="text-xs text-gray-500">
                      {booking.slots} peserta
                    </p>
                  </div>

                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                    <div className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                      Menunggu Pembayaran
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex border-t border-gray-100">
                <button
                  onClick={() => {
                    onClose();
                    router.push(`/booking/${booking.bookingId}`);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  Lihat Detail
                  <ChevronRight className="size-3.5" />
                </button>

                {booking.invoiceUrl && (
                  <>
                    <div className="w-px bg-gray-100" />
                    <button
                      onClick={() => {
                        window.location.href = booking.invoiceUrl!;
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      <CreditCard className="size-3.5" />
                      Bayar Sekarang
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-1">
          <button
            onClick={onClose}
            className="w-full py-3 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-2xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
