"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { WifiOff, RefreshCw, X } from "lucide-react";

export default function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(false);
  const [isClosedByUser, setIsClosedByUser] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Deactivated as requested
  const DEACTIVATED = true;

  useEffect(() => {
    if (typeof window === "undefined" || DEACTIVATED) return;

    // Set initial status
    setIsOffline(!window.navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      setIsClosedByUser(false);
      toast.success("Koneksi internet terhubung kembali!", { id: "online-toast" });
    };

    const handleOffline = () => {
      setIsOffline(true);
      setIsClosedByUser(false);
      toast.error("Koneksi internet terputus.", { id: "offline-toast" });
    };

    const handleTriggerOfflineModal = () => {
      setIsOffline(true);
      setIsClosedByUser(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("trigger-offline-modal", handleTriggerOfflineModal);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("trigger-offline-modal", handleTriggerOfflineModal);
    };
  }, []);

  const handleRetry = async () => {
    setIsChecking(true);
    // Simulate short network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const online = window.navigator.onLine;
    setIsChecking(false);

    if (online) {
      setIsOffline(false);
      setIsClosedByUser(false);
      toast.success("Koneksi internet terhubung kembali!");
    } else {
      toast.error("Koneksi internet masih terputus. Silakan periksa jaringan Anda.");
    }
  };

  if (DEACTIVATED || !isOffline || isClosedByUser) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md px-6 text-center animate-fade-in">
      <div className="relative max-w-md bg-white/10 border border-white/20 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={() => setIsClosedByUser(true)}
          className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="size-5" />
        </button>

        {/* Animated Icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse scale-150" />
          <div className="relative size-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <WifiOff className="size-10" />
          </div>
        </div>

        {/* Text */}
        <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
          Tidak Ada Koneksi Internet
        </h2>
        <p className="text-slate-300 text-sm mb-8 leading-relaxed">
          Silakan periksa jaringan Anda dan coba lagi untuk melanjutkan penjelajahan. Anda dapat menutup pemberitahuan ini untuk melihat konten yang sudah termuat.
        </p>

        {/* Retry Button */}
        <button
          onClick={handleRetry}
          disabled={isChecking}
          id="offline-retry-btn"
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold rounded-2xl transition-all shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:shadow-[0_4px_20px_rgba(37,99,235,0.5)] active:scale-95 cursor-pointer"
        >
          <RefreshCw className={`size-4 ${isChecking ? "animate-spin" : ""}`} />
          <span>{isChecking ? "Memeriksa..." : "Coba Lagi"}</span>
        </button>
      </div>
    </div>
  );
}
