"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  ChevronDown,
  Search,
  Check,
  X,
  Loader2,
  AlertCircle,
  RotateCw,
} from "lucide-react";

export interface OptionItem {
  id: string;
  name: string;
}

interface SearchableSelectProps {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  options?: OptionItem[];
  value?: OptionItem | null;
  onChange: (item: OptionItem | null) => void;
  disabled?: boolean;
  disabledPlaceholder?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  errorMessage?: string;
  required?: boolean;
  className?: string;
  helperText?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  placeholder = "-- Pilih --",
  searchPlaceholder = "Cari pilihan...",
  options = [],
  value = null,
  onChange,
  disabled = false,
  disabledPlaceholder,
  isLoading = false,
  isError = false,
  onRetry,
  errorMessage,
  required = false,
  className = "",
  helperText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Filter options
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase().trim();
    return options.filter((item) => item.name.toLowerCase().includes(query));
  }, [options, searchQuery]);

  const handleSelect = (item: OptionItem) => {
    onChange(item);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setSearchQuery("");
  };

  const displayPlaceholder = disabled && disabledPlaceholder
    ? disabledPlaceholder
    : placeholder;

  return (
    <div className={`space-y-1.5 ${className}`} ref={containerRef}>
      {/* Label Row */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-gray-700">
            {label} {required && <span className="text-blue-600 ml-0.5">*</span>}
          </label>
          {isLoading && (
            <span className="text-[11px] text-blue-600 flex items-center gap-1 font-medium">
              <Loader2 className="h-3 w-3 animate-spin" /> Memuat...
            </span>
          )}
          {isError && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-[11px] text-red-600 hover:text-red-700 font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCw className="h-3 w-3" /> Coba Lagi
            </button>
          )}
        </div>
      )}

      {/* Trigger Button */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled || isLoading}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`
            w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg border text-sm text-left
            transition-all duration-200
            ${
              disabled
                ? "bg-gray-100/80 border-gray-200 text-gray-400 cursor-not-allowed"
                : errorMessage
                ? "bg-red-50/50 border-red-400 text-gray-900 focus:ring-2 focus:ring-red-300"
                : isOpen
                ? "bg-white border-blue-500 ring-2 ring-blue-500/20 text-gray-900 shadow-xs"
                : "bg-white border-gray-200 text-gray-900 hover:border-blue-400 hover:shadow-xs cursor-pointer"
            }
          `}
        >
          <span
            className={`truncate block ${
              value ? "font-medium text-gray-900" : "text-gray-400 font-normal"
            }`}
          >
            {value ? value.name : displayPlaceholder}
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            ) : (
              <>
                {value && !disabled && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={handleClear}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleClear(e as unknown as React.MouseEvent);
                      }
                    }}
                    className="p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                    title="Hapus pilihan"
                  >
                    <X className="h-3.5 w-3.5" />
                  </span>
                )}
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-blue-600" : ""
                  }`}
                />
              </>
            )}
          </div>
        </button>

        {/* Dropdown Popover */}
        {isOpen && !disabled && (
          <div
            className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-gray-200/90 shadow-xl shadow-gray-900/10 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
            style={{ maxHeight: "320px" }}
          >
            {/* Search Input Box */}
            <div className="p-2 border-b border-gray-100 bg-gray-50/50">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-7 py-1.5 bg-white border border-gray-200 rounded-md text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-56 overflow-y-auto divide-y divide-gray-50/60 py-1 focus:outline-none">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((item) => {
                  const isSelected = value?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={`
                        w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors cursor-pointer
                        ${
                          isSelected
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }
                      `}
                    >
                      <span className="truncate">{item.name}</span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-blue-600 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-6 text-center text-xs text-gray-500">
                  <p className="font-medium text-gray-600">Tidak ada data ditemukan</p>
                  {searchQuery && (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Coba kata kunci lain untuk &quot;{searchQuery}&quot;
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Helper text or Error Message */}
      {errorMessage ? (
        <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-gray-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};
