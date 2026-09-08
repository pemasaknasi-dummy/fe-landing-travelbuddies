"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { usePendingFeedbacks } from "@/features/feedbacks/hooks/useFeedback";

export default function PendingFeedbackBanner() {
  const { isAuth, isReady } = useAuth();
  const router = useRouter();
  const { data, isLoading } = usePendingFeedbacks();

  if (!isReady || !isAuth || isLoading) return null;

  if (!data || !data.items || data.items.length === 0) {
    return null;
  }

  // Pick the first one
  const feedbackTarget = data.items[0];

  return (
    <div className="max-w-[1024px] 2xl:max-w-[1440px] mx-auto">
      <div className="bg-blue-50 border-x-4 border-blue-500 rounded-lg p-4 mx-5 xl:mx-0 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full shrink-0">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm md:text-base">
              Isi Feedback Trip Kamu!
            </h4>
            <p className="text-sm text-gray-600">
              Kamu belum mengisi feedback untuk {feedbackTarget.trip.title}.
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/booking/${feedbackTarget.bookingId}/feedback`)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-sm text-sm cursor-pointer"
        >
          Isi Sekarang
        </button>
      </div>
    </div>
  );
}
