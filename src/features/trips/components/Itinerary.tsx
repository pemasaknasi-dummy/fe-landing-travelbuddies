"use client";
import React, { useState } from "react";
import type { Itinerary } from "../api/trip-api";

interface ItineraryProps {
  data: Itinerary[];
}

const Itinerary: React.FC<ItineraryProps> = ({ data }: ItineraryProps) => {
  const [activeDay, setActiveDay] = useState<number>(0);

  return (
    <div className="w-full bg-white">
      {/* Header Tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-none w-full mb-6">
        {data?.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveDay(index)}
            className={`cursor-pointer px-6 py-3 font-semibold text-[15px] border-b-2 transition-all duration-300 flex-shrink-0 ${
              activeDay === index
                ? "text-blue-600 border-blue-600"
                : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            Hari {index + 1}
          </button>
        ))}
      </div>

      {/* Itinerary Items */}
      <div className="relative pl-1">
        {data[activeDay]?.activities?.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === data[activeDay]?.activities.length - 1;
          const hasLine = data[activeDay]?.activities.length > 1;

          return (
            <div key={index} className="flex gap-4 relative pb-6 last:pb-0">
              {/* Line */}
              {hasLine && (
                <div
                  className={`absolute w-px bg-gray-200 left-2 -translate-x-1/2 ${
                    isFirst
                      ? "top-[11px] bottom-0"
                      : isLast
                      ? "top-0 h-[11px]"
                      : "top-0 bottom-0"
                  }`}
                ></div>
              )}

              {/* Left bullet column */}
              <div className="relative flex flex-col items-center flex-shrink-0 w-4">
                {/* Bullet */}
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white ring-1 ring-blue-500/20 z-10 mt-1.5"></div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1 -mt-0.5 pb-2 flex-1">
                <p className="text-sm font-bold text-gray-800">
                  {item.time}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed max-w-full break-words">
                  {item.activity}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Itinerary;
