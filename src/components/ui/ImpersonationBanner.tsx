"use client";

import { useEffect, useState } from "react";
import * as sessionService from "@/lib/session";

export default function ImpersonationBanner() {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const checkImpersonation = () => {
      const active = window.localStorage.getItem("is_impersonating") === "true";
      setIsImpersonating(active);

      if (active) {
        try {
          const storedUser = window.localStorage.getItem("impersonating_user");
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch {
          setUser(null);
        }
      }
    };

    checkImpersonation();
    window.addEventListener("storage", checkImpersonation);
    return () => window.removeEventListener("storage", checkImpersonation);
  }, []);

  const handleExit = () => {
    sessionService.flushAll();
    window.localStorage.removeItem("is_impersonating");
    window.localStorage.removeItem("impersonating_user");
    window.location.href = "/";
  };

  if (!isImpersonating) return null;

  return (
    <div className="bg-amber-500 text-white px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between z-50 sticky top-0 shadow-md">
      <div className="flex items-center space-x-2 truncate">
        <span className="bg-amber-700 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
          IMPERSONATION MODE
        </span>
        <span className="truncate">
          Anda sedang mengakses sistem sebagai: <strong>{user?.name || "User"}</strong> {user?.email ? `(${user.email})` : ""}
        </span>
      </div>
      <button
        onClick={handleExit}
        className="ml-3 bg-white text-amber-600 hover:bg-amber-100 px-3 py-1 rounded font-bold text-xs transition shadow-sm whitespace-nowrap"
      >
        Keluar Sesi
      </button>
    </div>
  );
}
