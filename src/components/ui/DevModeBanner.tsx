"use client";

import { useEffect, useState } from "react";
import { Terminal } from "lucide-react";

export default function DevModeBanner() {
  const [isDev, setIsDev] = useState<boolean>(false);

  useEffect(() => {
    const dev =
      process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_ENV === "development" ||
      process.env.NEXT_PUBLIC_ENV === "dev" ||
      process.env.NEXT_PUBLIC_NEXT_ENV === "development" ||
      process.env.NEXT_PUBLIC_NEXT_ENV === "dev" ||
      process.env.NEXT_ENV === "development" ||
      process.env.NEXT_ENV === "dev";

    setIsDev(dev);
  }, []);

  if (!isDev) return null;

  return (
    <div className="fixed top-0 left-0 w-36 h-36 overflow-hidden z-[9999] pointer-events-none select-none">
      <div className="absolute top-6 -left-11 w-48 -rotate-45 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-md py-1 text-center text-[10px] font-black tracking-widest uppercase border-y border-amber-600/30 flex items-center justify-center space-x-1.5">
        <span>DEV MODE</span>
      </div>
    </div>
  );
}
