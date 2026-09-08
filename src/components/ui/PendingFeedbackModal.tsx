"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePendingFeedbacks } from "@/features/feedbacks/hooks/useFeedback";
import { useAuth } from "@/context/AuthContext";
import { Calendar, MapPin, X } from "lucide-react";
import dayjs from "dayjs";
import Image from "next/image";
import { FeedbackForm } from "../sections/FeedbackForm";

export default function PendingFeedbackModal() {
  const { isAuth, isReady } = useAuth();
  const router = useRouter();
  const { data, isLoading } = usePendingFeedbacks();

  const [isVisible, setIsVisible] = useState(false);
  const [isFilloutFeedback, setisFilloutFeedback] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);

  useEffect(() => {
    if (!isReady || !isAuth || isLoading) return;

    if (data && data.items && data.items.length > 0) {
      // Check localStorage for skip cooldown
      const skipUntil = localStorage.getItem("skipFeedbackUntil");
      if (skipUntil && parseInt(skipUntil, 10) > Date.now()) {
        return; // Still in cooldown
      }
      setIsVisible(true);
      if (!selectedFeedback) {
        setSelectedFeedback(data.items[0]);
      }
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [data, isLoading, isReady, isAuth]);

  const handleSkip = () => {
    // 3 days cooldown
    const cooldownTime = Date.now() + 3 * 24 * 60 * 60 * 1000;
    localStorage.setItem("skipFeedbackUntil", cooldownTime.toString());
    closeModal();
  };

  const closeModal = () => {
    setIsVisible(false);
    setisFilloutFeedback(false);
    setSelectedFeedback(null);
    document.body.style.overflow = "";
  };

  const handleGoToFeedback = (bookingId: number) => {
    // setIsVisible(false);
    // document.body.style.overflow = "";
    // router.push(`/booking/${bookingId}/feedback`);
    setisFilloutFeedback(true);
  };

  // Use locked selectedFeedback if available, otherwise fallback to first item
  const feedbackTarget = selectedFeedback || data?.items[0];

  if (!isVisible || !feedbackTarget) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        className={`bg-white ${isFilloutFeedback ? "max-w-4xl overflow-auto max-h-[90vh]" : "max-w-lg overflow-hidden"} w-full rounded-2xl shadow-2xl relative animate-in fade-in zoom-in duration-300`}
      >
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {isFilloutFeedback ? (
          <div className="p-6 md:p-8">
            <FeedbackForm
              id={feedbackTarget.bookingId}
              handleClose={closeModal}
            />
          </div>
        ) : (
          <div className="p-6 md:p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">📝</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Gimana Trip Kamu Kemarin?
              </h2>
              <p className="text-gray-600 text-sm md:text-base">
                Kasih tau pengalamanmu supaya Travel Buddies bisa jadi lebih
                baik lagi!
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 shadow-sm flex items-center gap-4">
              <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden shrink-0 relative">
                {feedbackTarget.trip.image ? (
                  <Image
                    src={feedbackTarget.trip.image}
                    alt={feedbackTarget.trip.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="text-slate-400 w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {feedbackTarget.trip.title}
                </h3>
                <div className="flex items-center text-sm text-gray-500 mt-1 gap-1">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>
                    {dayjs(feedbackTarget.tripDate.date).format("DD MMM YYYY")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleGoToFeedback(feedbackTarget.bookingId)}
                className="w-full bg-[#1B75BC] hover:bg-[#135080] text-white font-semibold py-3.5 px-4 rounded-xl transition-colors shadow-md cursor-pointer"
              >
                Isi Sekarang & Dapatkan Dokumentasi
              </button>
              <button
                onClick={handleSkip}
                className="w-full text-gray-500 hover:text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
