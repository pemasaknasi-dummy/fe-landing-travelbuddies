"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X, RotateCcw } from "lucide-react";

export default function ServerErrorBanner() {
  const [isVisible, setIsVisible] = useState(false);

  // Deactivated as requested
  const DEACTIVATED = true;

  useEffect(() => {
    if (typeof window === "undefined" || DEACTIVATED) return;

    const handleTriggerBanner = () => {
      setIsVisible(true);
    };

    window.addEventListener("trigger-server-error-banner", handleTriggerBanner);

    return () => {
      window.removeEventListener("trigger-server-error-banner", handleTriggerBanner);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (DEACTIVATED || !isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9998] w-[90%] max-w-2xl animate-in slide-in-from-top duration-300">
      <div className="bg-red-950/80 border border-red-500/20 backdrop-blur-md px-6 py-4 rounded-2xl shadow-[0_8px_32px_0_rgba(220,38,38,0.15)] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 shrink-0 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <AlertTriangle className="size-5" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold text-white leading-tight">
              Server Dalam Gangguan
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Gagal terhubung ke server. Beberapa konten mungkin gagal dimuat.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold whitespace-nowrap"
            title="Muat Ulang Halaman"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="size-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
