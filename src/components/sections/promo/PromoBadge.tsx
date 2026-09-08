export type BadgeType = "open" | "private";

interface PromoBadgeProps {
  type: BadgeType;
  className?: string;
}

const badgeConfig: Record<BadgeType, { label: string; className: string }> = {
  open: {
    label: "Open Trip",
    className:
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wide bg-[#FE5E00] shadow-lg shadow-gray-500/30 border border-white/20",
  },
  private: {
    label: "Private Trip",
    className:
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wide bg-[#25A6DD] shadow-lg shadow-gray-500/30 border border-white/20",
  },
};

export function PromoBadge({ type, className = "" }: PromoBadgeProps) {
  const config = badgeConfig[type];

  return <span className={`promo-badge font-bold ${config.className} ${className}`.trim()}>{config.label}</span>;
}
