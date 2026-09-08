"use client";
import { Star } from "lucide-react";
import { useState } from "react";

interface RatingProps {
  value?: number;
  onChange?: (value: number) => void;
  totalStars?: number;
  size?: number;
  readonly?: boolean;
  allowHalf?: boolean;
  spacing?: number;
  activeColor?: string;
  inactiveColor?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value = 0,
  onChange,
  totalStars = 5,
  size = 24,
  readonly = false,
  allowHalf = false,
  spacing = 4,
  activeColor = "#fbbf24",
  inactiveColor = "#d1d5db",
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const handleClick = (idx: number): void => {
    if (readonly || !onChange) return;
    onChange(idx);
  };

  const handleMouseMove = (
    idx: number,
    e: React.MouseEvent<HTMLDivElement>
  ): void => {
    if (readonly) return;

    if (allowHalf) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const isHalf = x < rect.width / 2;
      setHoverValue(isHalf ? idx - 0.5 : idx);
    } else {
      setHoverValue(idx);
    }
  };

  const handleMouseLeave = (): void => {
    setHoverValue(null);
  };

  const getFillPercentage = (idx: number): number => {
    const currentValue = hoverValue !== null ? hoverValue : value;

    if (currentValue >= idx) return 100;
    if (currentValue >= idx - 0.5 && currentValue < idx) return 50;
    return 0;
  };

  return (
    <div
      className="inline-flex items-center"
      style={{ gap: `${spacing}px` }}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: totalStars }, (_, i) => {
        const idx = i + 1;
        const fillPct = getFillPercentage(idx);

        return (
          <div
            key={i}
            onClick={() => handleClick(idx)}
            onMouseMove={(e) => handleMouseMove(idx, e)}
            style={{
              cursor: readonly ? "default" : "pointer",
              position: "relative",
              width: size,
              height: size,
            }}
          >
            <Star
              size={size}
              fill={inactiveColor}
              stroke={inactiveColor}
              strokeWidth={1}
              style={{ position: "absolute" }}
            />
            <div
              style={{
                position: "absolute",
                overflow: "hidden",
                width: `${fillPct}%`,
                height: "100%",
              }}
            >
              <Star
                size={size}
                fill={activeColor}
                stroke={activeColor}
                strokeWidth={1}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
