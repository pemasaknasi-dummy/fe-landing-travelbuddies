"use client";

import { Share2 } from "lucide-react";
import { httpClient } from "@/lib/api/http-client";

type ShareButtonProps = {
  title?: string;
  text?: string;
  url?: string;
  tripId?: string | number;
};

export default function ShareButton({
  title = document.title,
  text = "",
  url = typeof window !== "undefined" ? window.location.href : "",
  tripId,
}: ShareButtonProps) {
  const handleShare = async () => {
    if (tripId) {
      try {
        await httpClient.post(`/trips/${tripId}/share`);
      } catch (error) {
        console.error("Failed to track share", error);
      }
    }

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

  return (
    <button
      onClick={handleShare}
      aria-label="Share"
      className="rounded-full mt-1.5 border border-black p-2 
                 hover:bg-black hover:text-white 
                 transition-colors cursor-pointer"
    >
      <Share2 className="size-2.5 md:size-4" />
    </button>
  );
}
