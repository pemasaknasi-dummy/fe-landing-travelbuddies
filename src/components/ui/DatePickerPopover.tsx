"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

interface DatePickerPopoverProps {
  value: string | null; // YYYY-MM-DD
  onChange: (date: string | null) => void;
  placeholder?: string;
  className?: string;
}

const DAYS_OF_WEEK = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const DatePickerPopover: React.FC<DatePickerPopoverProps> = ({
  value,
  onChange,
  placeholder = "Kapan?",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    value ? dayjs(value) : dayjs()
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const startOfMonth = currentMonth.startOf("month");
  const daysInMonth = currentMonth.daysInMonth();
  const startDay = startOfMonth.day(); // 0=Sun

  const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));

  const handleSelectDate = (day: number) => {
    const selected = currentMonth.date(day).format("YYYY-MM-DD");
    onChange(selected);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setIsOpen(false);
  };

  const today = dayjs().format("YYYY-MM-DD");
  const selectedFormatted = value
    ? dayjs(value).format("ddd, DD MMM YYYY")
    : "";

  // Generate calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-xl
          bg-white/90 border border-slate-200 text-sm
          hover:border-blue-400 hover:bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500/30
          transition-all duration-200 cursor-pointer
          ${value ? "text-slate-800 font-medium" : "text-slate-400"}
        `}
      >
        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
        <span className="truncate">
          {value ? selectedFormatted : placeholder}
        </span>
        {value && (
          <X
            className="w-3.5 h-3.5 text-slate-400 hover:text-red-500 shrink-0 transition-colors"
            onClick={handleClear}
          />
        )}
      </button>

      {/* Popover Calendar */}
      {isOpen && (
        <div
          className="
            absolute top-full left-0 mt-2 z-50
            bg-white rounded-2xl shadow-2xl border border-slate-200
            p-4 w-[300px]
            animate-in fade-in slide-in-from-top-2 duration-200
          "
        >
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-slate-800 capitalize">
              {currentMonth.format("MMMM YYYY")}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} />;
              }

              const dateStr = currentMonth.date(day).format("YYYY-MM-DD");
              const isSelected = dateStr === value;
              const isToday = dateStr === today;
              const isPast = dayjs(dateStr).isBefore(dayjs(), "day");

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleSelectDate(day)}
                  className={`
                    w-full aspect-square rounded-lg text-xs font-semibold
                    flex items-center justify-center
                    transition-all duration-150 cursor-pointer
                    ${
                      isSelected
                        ? "bg-blue-500 text-white shadow-md shadow-blue-200 scale-110"
                        : isToday
                          ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200"
                          : isPast
                            ? "text-slate-300 cursor-not-allowed"
                            : "text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePickerPopover;
