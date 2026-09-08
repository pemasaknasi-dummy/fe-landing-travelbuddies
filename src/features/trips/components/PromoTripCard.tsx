import React from "react";
import { useLoopingCountdown } from "../hooks/useLoopingCountdown";
import { formatRupiah } from "@/lib/format-rupiah";

/* ================= TYPES ================= */

export type PromoSlug = "PROMO_PDKT" | "EMPTY_QUOTA";

interface Props {
  name: string;
  slug: PromoSlug;
  title: string;
  icon: React.ReactNode;
  quota: number | null;
  discountMode: string;
  discountValue: string;
}

type PromoTheme = {
  bg: string;
  ring: string;
  badge: string;
  title: string;
  iconBg: string;
};

/* ================= THEME CONFIG ================= */

const PROMO_THEME: Record<PromoSlug, PromoTheme> = {
  PROMO_PDKT: {
    bg: "bg-[#FFD5DD]",
    ring: "ring-[#df1f42]",
    badge: "bg-[#df1f42]",
    title: "text-[#FF2D55]",
    iconBg: "bg-white",
  },
  EMPTY_QUOTA: {
    bg: "bg-[#DADADA]",
    ring: "ring-[#8E8E93]",
    badge: "bg-[#AEAEB2]",
    title: "text-[##404040]",
    iconBg: "bg-white",
  },
};

/* ================= COMPONENT ================= */

export const PromoTripCard: React.FC<Props> = ({ name, slug, title, icon, quota, discountMode, discountValue }) => {
  const { hours, minutes, seconds } = useLoopingCountdown();
  const pad = (n: number) => String(n).padStart(2, "0");
  const isEmptyQuota = quota !== null && quota < 1;
  const effectiveSlug: PromoSlug = isEmptyQuota ? "EMPTY_QUOTA" : slug;
  const theme = PROMO_THEME[effectiveSlug];

  let subTitleText: React.ReactNode;

  if (quota === null) {
    subTitleText = (
      <>
        Kuota promo terbatas, up to{" "}
        <span className="font-bold">{discountMode === "percentage" ? `${discountValue}%` : formatRupiah(Number(discountValue))}</span>
      </>
    );
  } else if (!isEmptyQuota) {
    subTitleText = (
      <>
        Kuota promo terbatas, hanya untuk <span className="font-bold">{quota}</span> peserta pertama, up to{" "}
        <span className="font-bold">{discountMode === "percentage" ? `${discountValue}%` : formatRupiah(Number(discountValue))}</span>.
      </>
    );
  } else {
    subTitleText = "Untuk tanggal ini kuota promo sudah habis";
  }

  return (
    <div className={`ring-1 p-3 mb-5 rounded-lg text-black ${theme.bg} ${theme.ring}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-x-2">
        <div className="flex items-center gap-x-3">
          <div className={`${theme.iconBg} p-2 rounded-full`}>{icon}</div>

          <h3 className={`rounded-full inline-block px-4 py-1 font-bold text-white ${theme.badge}`}>{name}</h3>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-x-1 font-mono">
          <p className="p-1.5 font-bold bg-black text-white text-xs rounded-md">{!isEmptyQuota ? pad(hours) : pad(0)}</p>
          <span>:</span>
          <p className="p-1.5 font-bold bg-black text-white text-xs rounded-md">{!isEmptyQuota ? pad(minutes) : pad(0)}</p>
          <span>:</span>
          <p className="p-1.5 font-bold bg-black text-white text-xs rounded-md">{!isEmptyQuota ? pad(seconds) : pad(0)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mt-5">
        <h1 className={`font-bold text-lg ${theme.title}`}>{title}</h1>
        <p>{subTitleText}</p>
      </div>
    </div>
  );
};
