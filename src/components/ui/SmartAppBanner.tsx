"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Image from "next/image";

const APP_SCHEME = "travelbuddies://";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=id.travelbuddies.app&hl=id";
const APP_STORE_URL =
  "https://apps.apple.com/id/app/travel-buddies/id6757420967";

function getPlatform(): "android" | "ios" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return "android";
  if (/iPad|iPhone|iPod/.test(ua)) return "desktop"; // treat as iOS
  return "desktop";
}

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /android|iphone|ipad|ipod/i.test(ua);
}

export default function SmartAppBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    //* Only show on mobile devices
    if (!isMobile()) return;

    //* Check if user previously dismissed the banner
    const wasDismissed = sessionStorage.getItem("app_banner_dismissed");
    if (wasDismissed) return;

    setVisible(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("app_banner_dismissed", "1");
    setTimeout(() => setVisible(false), 300);
  };

  const handleOpen = () => {
    const platform = getPlatform();

    //* Try opening the app via custom scheme
    window.location.href = APP_SCHEME;

    //* Fallback: redirect to store after a short delay
    setTimeout(() => {
      if (platform === "android") {
        window.location.href = PLAY_STORE_URL;
      } else {
        window.location.href = APP_STORE_URL;
      }
    }, 1500);
  };

  if (!visible) return null;

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-99 md:hidden
        transition-all duration-300 ease-in-out
        ${dismissed ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"}
      `}
    >
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e3a5f] to-[#0f172a] px-3 py-4 flex items-center gap-3 text-white">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-white hover:text-white transition-colors"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        {/* App icon */}
        <div className="flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden shadow-sm">
          <Image
            src="/images/logo/logo-white.png"
            alt="Travel Buddies"
            width={32}
            height={32}
            className="w-full h-full object-contain"
          />
        </div>

        {/* App info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">
            Travel Buddies
          </p>
          <p className="text-xs text-white">Buka di Aplikasi</p>
        </div>

        {/* Open button */}
        <button
          onClick={handleOpen}
          className="flex-shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-colors"
        >
          Buka
        </button>
      </div>
    </div>
  );
}
