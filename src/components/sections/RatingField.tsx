import { useState } from "react";
import { Angry, Frown, Annoyed, Smile, Laugh, LucideIcon } from "lucide-react";
import { Rating } from "@/features/feedbacks/components/FeedbackPage";

interface EmojiRatingOption {
  value: number;
  icon: LucideIcon;
  color: string;
  bg: string;
}

const emojiRatings: EmojiRatingOption[] = [
  { value: 1, icon: Angry, color: "#ef4444", bg: "#fef2f2" },
  { value: 2, icon: Frown, color: "#f97316", bg: "#fff7ed" },
  { value: 3, icon: Annoyed, color: "#eab308", bg: "#fefce8" },
  { value: 4, icon: Smile, color: "#22c55e", bg: "#f0fdf4" },
  { value: 5, icon: Laugh, color: "#3b82f6", bg: "#eff6ff" },
];

interface EmojiRatingProps {
  rating: number;
  onRatingChange: (value: number) => void;
  isFeedbackFilled: boolean;
}

function EmojiRating({
  rating,
  onRatingChange,
  isFeedbackFilled,
}: EmojiRatingProps) {
  const [hovered, setHovered] = useState<number>(0);
  const active = hovered || rating;

  return (
    <div className="space-y-2">
      {/* Row emoji — lebar tetap, tidak bergeser */}
      <div className="flex items-center justify-between md:justify-normal md:gap-x-3">
        {emojiRatings.map(({ value, icon: Icon, color, bg }) => {
          const isActive = active === value;
          return (
            <button
              key={value}
              type="button"
              disabled={isFeedbackFilled}
              onMouseEnter={() => setHovered(value)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => onRatingChange(value)}
              style={{
                backgroundColor: isActive ? bg : "#f3f4f6",
                transition: "all 0.2s ease",
                transform: isActive ? "scale(1.15)" : "scale(1)",
              }}
              className="p-2 rounded-lg cursor-pointer disabled:cursor-not-allowed"
            >
              <Icon size={34} color={isActive ? color : "#9ca3af"} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface RatingField {
  key: keyof Rating;
  label: string;
}

const ratingFields: RatingField[] = [
  { key: "tourLeaderRating", label: "Skor Penampilan Tour Leader" },
  { key: "tourLeaderServiceRating", label: "Skor Pelayanan Tour Leader" },
  { key: "facilityRating", label: "Skor Fasilitas" },
  { key: "itineraryRating", label: "Skor Itinerary" },
  { key: "documentationRating", label: "Skor Pengalaman Dokumentasi" },
];

export function RatingFields({
  ratings,
  onRatingChange,
  isFeedbackFilled,
  isPage,
}: {
  ratings: Rating;
  onRatingChange: (field: keyof Rating, value: number) => void;
  isFeedbackFilled: boolean;
  isPage: boolean;
}) {
  return (
    <div className="space-y-8 p-6">
      <div
        className={`grid gap-5 grid-cols-1 md:grid-cols-2  ${isPage ? "lg:grid-cols-3" : ""}`}
      >
        {ratingFields.map(({ key, label }) => (
          <div key={key} className="space-y-3">
            <label className="block text-sm sm:text-base font-semibold text-gray-800">
              {label}
            </label>
            <EmojiRating
              rating={ratings[key]}
              onRatingChange={(value) => onRatingChange(key, value)}
              isFeedbackFilled={isFeedbackFilled}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
