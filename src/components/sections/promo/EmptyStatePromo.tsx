import { SearchX, Inbox, ShoppingBag, Tag } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  type?: "search" | "promo" | "general";
}

export function EmptyState({
  title = "Tidak ada promo ditemukan",
  description = "Coba ubah filter atau kata kunci pencarian Anda",
  type = "promo",
}: EmptyStateProps) {
  const iconConfig = {
    search: SearchX,
    promo: Tag,
    general: Inbox,
  };

  const Icon = iconConfig[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 md:py-24 px-4 text-center">
      {/* Icon Container */}
      <div className="relative mb-6 sm:mb-8">
        {/* Animated Background Circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-blue-100 rounded-full animate-ping opacity-20" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-200/50 rounded-full animate-pulse" />
        </div>

        {/* Main Icon */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" strokeWidth={2.5} />
        </div>
      </div>

      {/* Text Content */}
      <div className="max-w-md">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{description}</p>
      </div>

      {/* Decorative Dots */}
      <div className="flex gap-2 mt-8">
        <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
