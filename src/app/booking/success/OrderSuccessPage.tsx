"use client";

import { useEffect, useState } from "react";
import { CheckCircle, ArrowRight, Clock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  if (!orderId) return;
  const parts = orderId.split("-");
  const bookingId = parts[2];

  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      router.push(`/booking/${bookingId}`);
    }
  }, [countdown, router, orderId]);

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          {/* Success Icon with Animation */}
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
            <div className="relative bg-green-100 rounded-full p-4">
              <CheckCircle className="w-16 h-16 text-green-600" strokeWidth={2.5} />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Pembayaran Berhasil!</h1>
            <p className="text-gray-600">Transaksi Anda telah berhasil diproses melalui Xendit</p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Booking Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">ID Booking</span>
              <span className="font-semibold text-gray-900">{orderId}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Status</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Lunas</span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-800">
              Redirect otomatis dalam <span className="font-bold text-lg">{countdown}</span> detik
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-y-3">
            <Link href={`/booking/${bookingId}`} className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              <span>Lihat Detail Booking</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link href="/" className="w-full bg-white hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl border-2 border-gray-400 transition-all duration-200">
              Kembali ke Beranda
            </Link>
          </div>

          {/* Additional Info */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">Konfirmasi pembayaran telah dikirim ke email Anda</p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">Terima kasih telah melakukan pembayaran 🎉</p>
        </div>
      </div>
    </div>
  );
}
