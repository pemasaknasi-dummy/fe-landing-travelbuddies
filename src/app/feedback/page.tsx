"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function FeedbackRedirect() {
  const { isAuth, isReady } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = searchParams.get("trip_id");

  useEffect(() => {
    if (!isReady) return;

    if (!tripId) {
      // If there's no trip_id, just redirect home or somewhere safe
      router.replace("/");
      return;
    }

    if (!isAuth) {
      // Redirect to login with callbackUrl back to this exact page
      const currentUrl = `/feedback?trip_id=${tripId}`;
      router.replace(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
    } else {
      // Logged in, send them to the actual feedback page
      router.replace(`/booking/${tripId}/feedback`);
    }
  }, [isReady, isAuth, tripId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-gray-600 animate-pulse font-medium">Memproses...</span>
      </div>
    </div>
  );
}

export default function FeedbackRedirectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Memuat...</div>}>
      <FeedbackRedirect />
    </Suspense>
  );
}
