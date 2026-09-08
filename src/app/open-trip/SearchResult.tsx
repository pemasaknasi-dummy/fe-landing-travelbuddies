"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDebounce } from "@/lib/useDebounce";
import { GetTripsParams } from "@/features/trips/api/trip-api";
import { CircleX, Search, SlidersHorizontal, X } from "lucide-react";
import { FilterPanel } from "@/components/sections/filters/FilterPanel";
import { PriceRangeKey } from "@/components/sections/filters/PriceFilter";
import { useInfiniteTrips } from "@/features/trips/hooks/useInfiniteTrips";
import TripCard from "@/features/trips/components/TripCard";
import TripListSkeleton from "@/features/trips/components/skeleton/TripListSkeleton";
import DatePickerPopover from "@/components/ui/DatePickerPopover";

export default function SearchResult() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [showMobileFilter, setShowMobileFilter] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState(false);
  const [mobileSearch, setMobileSearch] = useState<string>("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [inputPrice, setInputPrice] = useState<{ min: number | null; max: number | null }>({
    min: null,
    max: null,
  });
  const [mobilePrice, setMobilePrice] = useState<{ min: number | null; max: number | null }>({
    min: null,
    max: null,
  });

  const [filters, setFilters] = useState<GetTripsParams>({
    q: "",
    section: [],
    days: null,
    category: null,
    minPrice: null,
    maxPrice: null,
    date: null,
    page: 1,
  });

  const [draftFilters, setDraftFilters] = useState<GetTripsParams>(filters);
  const debouncedMinPrice = useDebounce(inputPrice.min, 500);
  const debouncedMaxPrice = useDebounce(inputPrice.max, 500);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteTrips({
    q: filters.q,
    section: filters.section,
    days: filters.days,
    category: filters.category,
    minPrice: debouncedMinPrice,
    maxPrice: debouncedMaxPrice,
    date: filters.date,
    take: 12,
  });
  const trips = data?.pages.flatMap((page) => page.items) ?? [];

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        fetchNextPage();
      }
    });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const prevFiltersRef = useRef<GetTripsParams>({
    q: filters.q,
    section: filters.section,
    days: filters.days,
    category: filters.category,
    minPrice: debouncedMinPrice,
    maxPrice: debouncedMaxPrice,
  });

  const isFilterActive = Object.entries(filters).some(([key, value]) => {
    if (key === "page" || key === "q") return false; // skip page & q

    if (Array.isArray(value)) return value.length > 0;
    if (value === null || value === "") return false;

    return true;
  });

  // DEBOUNCE Price
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      minPrice: debouncedMinPrice,
      maxPrice: debouncedMaxPrice,
    }));
  }, [debouncedMinPrice, debouncedMaxPrice]);

  // HANDLE UI If user check but not apply filters on mobile
  useEffect(() => {
    if (showMobileFilter) {
      setDraftFilters(filters);
    }
  }, [showMobileFilter, filters]);

  // START HANDLER
  const checkDays = (prevDays?: string | null, value?: string) => {
    if (!value) return prevDays ?? null;

    const current = prevDays ? prevDays.split(",") : [];

    // Toggle logic (works for both numbers & >5)
    const updated = current.includes(value) ? current.filter((d) => d !== value) : [...current, value];

    return updated.length > 0 ? updated.join(",") : null;
  };

  const checkSection = (prevSection: ("popular" | "recommended")[] = [], section: "popular" | "recommended") => {
    return prevSection.includes(section) ? prevSection.filter((s) => s !== section) : [...prevSection, section];
  };

  const checkCategory = (prevCategory?: string | null, slug?: string) => {
    if (!slug) return;

    const hasCategory = prevCategory ?? "";

    // convert ke array string
    let categoryArr = hasCategory
      ? hasCategory
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
      : [];

    // toggle slug
    if (categoryArr.includes(slug)) {
      categoryArr = categoryArr.filter((c) => c !== slug);
    } else {
      categoryArr.push(slug);
    }

    // convert kembali ke string
    return categoryArr.join(",");
  };

  const parseInputPrice = (value: string) => {
    const raw = value.replace(/\./g, "");
    if (!/^\d*$/.test(raw)) return null;
    setSelectedPriceRange(null);
    return raw === "" ? null : Number(raw);
  };

  // END HANDLER

  // START DESKTOP FILTER
  const checkDaysDesktop = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      days: checkDays(prev.days, value),
    }));
  };

  const checkSectionDesktop = (section: "popular" | "recommended") => {
    setFilters((prev) => ({
      ...prev,
      section: checkSection(prev.section, section),
    }));
  };

  const checkCategoryDesktop = (slug: string) => {
    setFilters((prev) => ({
      ...prev,
      category: checkCategory(prev.category, slug),
    }));
  };

  const handleMinPriceInputDesktop = (value: string) => {
    setSelectedPriceRange(null);
    setInputPrice((prev) => ({ ...prev, min: parseInputPrice(value) }));
  };

  const handleMaxPriceInputDesktop = (value: string) => {
    setSelectedPriceRange(null);
    setInputPrice((prev) => ({ ...prev, max: parseInputPrice(value) }));
  };

  const radioPriceRangeDesktop = (range: PriceRangeKey) => {
    if (!range) return;
    setSelectedPriceRange(range);

    const map = {
      first: { minPrice: 100000, maxPrice: 500000 },
      second: { minPrice: 500000, maxPrice: 1000000 },
      third: { minPrice: 1000000, maxPrice: null },
    } as const;

    const selectedRange = map[range];

    // Update INPUT state (untuk ditampilkan di input field)
    setInputPrice({
      min: selectedRange.minPrice,
      max: selectedRange.maxPrice,
    });

    // Update FILTERS (untuk fetch data langsung, tanpa debounce)
    setFilters((prev) => ({
      ...prev,
      minPrice: selectedRange.minPrice,
      maxPrice: selectedRange.maxPrice,
    }));
  };
  // END DESKTOP FILTER

  // START MOBILE FILTER
  const checkDaysMobile = (value: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      days: checkDays(prev.days, value),
    }));
  };

  const checkSectionMobile = (section: "popular" | "recommended") => {
    setDraftFilters((prev) => ({
      ...prev,
      section: checkSection(prev.section, section),
    }));
  };

  const checkCategoryMobile = (slug: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      category: checkCategory(prev.category, slug),
    }));
  };

  const handleMinPriceInputMobile = (value: string) => {
    setSelectedPriceRange(null);
    const parsed = parseInputPrice(value);

    setMobilePrice((prev) => ({ ...prev, min: parsed }));
    setDraftFilters((prev) => ({ ...prev, minPrice: parsed }));
  };

  const handleMaxPriceInputMobile = (value: string) => {
    setSelectedPriceRange(null);
    const parsed = parseInputPrice(value);

    setMobilePrice((prev) => ({ ...prev, max: parsed }));
    setDraftFilters((prev) => ({ ...prev, maxPrice: parsed }));
  };

  const radioPriceRangeMobile = (range: PriceRangeKey) => {
    if (!range) return;
    setSelectedPriceRange(range);

    const map = {
      first: { minPrice: 100000, maxPrice: 500000 },
      second: { minPrice: 500000, maxPrice: 1000000 },
      third: { minPrice: 1000000, maxPrice: null },
    } as const;

    const selectedRange = map[range];

    // Update INPUT state (untuk ditampilkan di input field)
    setMobilePrice({
      min: selectedRange.minPrice,
      max: selectedRange.maxPrice,
    });

    // Update FILTERS (untuk fetch data langsung, tanpa debounce)
    setDraftFilters((prev) => ({
      ...prev,
      minPrice: selectedRange.minPrice,
      maxPrice: selectedRange.maxPrice,
    }));
  };

  const handleMobileSearch = () => {
    setFilters((prev) => ({
      ...prev,
      q: mobileSearch,
      page: 1,
    }));
  };

  const handleApplyMobileFilters = () => {
    setInputPrice({
      min: mobilePrice.min,
      max: mobilePrice.max,
    });
    setFilters({
      ...draftFilters,
      page: 1,
    });
    handleCloseFilter();
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (!mobileSearch.trim()) {
        router.push(`/open-trip`);
        searchRef.current?.blur();
        // setInputSearchFocus(false);
        return;
      }

      router.push(`/open-trip?q=${encodeURIComponent(mobileSearch)}`);
      searchRef.current?.blur();

      // setInputSearchFocus(false);
    }
  };
  // END MOBILE FILTER

  // SET QUERY PARAMS
  const updateQueryParams = () => {
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;

    const setOrDelete = (key: string, value: string | null) => {
      if (value && value.length > 0) {
        if (params.get(key) !== value) changed = true;
        params.set(key, value);
      } else {
        if (params.has(key)) changed = true;
        params.delete(key);
      }
    };

    // QUERY
    setOrDelete("q", filters.q || null);

    // SECTION (array)
    setOrDelete("section", filters.section?.length ? filters.section.join(",") : null);

    // DAYS
    setOrDelete("days", filters.days || null);

    // CATEGORY (array)
    setOrDelete("category", filters.category || null);

    // DATE
    setOrDelete("date", filters.date || null);

    // MIN PRICE
    setOrDelete("minPrice", filters.minPrice !== null ? String(filters.minPrice) : null);

    // MAX PRICE
    setOrDelete("maxPrice", filters.maxPrice !== null ? String(filters.maxPrice) : null);

    // PAGE
    setOrDelete("page", filters.page && filters.page !== 1 ? String(filters.page) : null);

    // APPLY CHANGE
    if (changed) {
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  // SET Filters based Params
  useEffect(() => {
    if (isResetting) {
      setIsResetting(false);
      return;
    }

    const q = searchParams.get("q") || "";
    setMobileSearch(q);
    // SECTION
    const rawSections = searchParams.get("section") ? searchParams.get("section")!.split(",") : [];
    const allowedSections = ["popular", "recommended"] as const;
    const section = rawSections.filter((s): s is "popular" | "recommended" => allowedSections.includes(s as any));
    // END SECTION

    // DAYS
    const rawDays = searchParams.get("days");
    const days = rawDays ?? null;

    // CATEGORY
    const rawCategory = searchParams.get("category");
    const category = rawCategory ?? null;

    // DATE
    const date = searchParams.get("date") || null;

    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

    setInputPrice({ min: minPrice, max: maxPrice });
    setMobilePrice({ min: minPrice, max: maxPrice });
    setFilters({ q, section, days, category, minPrice, maxPrice, date, page });

    prevFiltersRef.current = {
      q,
      section,
      days,
      category,
      minPrice,
      maxPrice,
      date,
    };

    setIsReady(true);
  }, [searchParams]);

  // Update Query Params
  useEffect(() => {
    if (!isReady) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    updateQueryParams();
  }, [filters.q, filters.section, filters.days, filters.category, filters.maxPrice, filters.minPrice, filters.date, filters.page, isReady]);

  // FOR Reset Page, if Page > 1 and user add new filters
  useEffect(() => {
    if (!isReady || isFirstRender.current) return;

    const prev = prevFiltersRef.current;

    const filterChanged =
      prev.q !== filters.q ||
      JSON.stringify(prev.section) !== JSON.stringify(filters.section) ||
      prev.days !== filters.days ||
      prev.category !== filters.category ||
      prev.minPrice !== filters.minPrice ||
      prev.maxPrice !== filters.maxPrice ||
      prev.date !== filters.date;

    // 🔥 UPDATE REF SELALU
    prevFiltersRef.current = {
      q: filters.q,
      section: filters.section,
      days: filters.days,
      category: filters.category,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      date: filters.date,
    };

    // 🔥 RESET PAGE HANYA JIKA FILTER BERUBAH
    if (filterChanged && filters.page !== 1) {
      setFilters((prev) => ({ ...prev, page: 1 }));
    }
  }, [filters.q, filters.section, filters.days, filters.category, filters.minPrice, filters.maxPrice, filters.date, isReady]);

  // HANDLE SCROLL IF FILTER ON Mobile open
  useEffect(() => {
    if (showMobileFilter) {
      // Disable scroll
      document.body.style.overflow = "hidden";
    } else {
      // Enable scroll
      document.body.style.overflow = "";
    }

    // Cleanup ketika komponen unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMobileFilter]);

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleCloseFilter = () => {
    setIsClosing(true);

    setTimeout(() => {
      setShowMobileFilter(false);
      setIsClosing(false);
    }, 500);
  };

  const handleResetFilter = () => {
    setIsResetting(true);
    setSelectedPriceRange(null);

    const resetValue = {
      q: "",
      section: [],
      days: null,
      category: null,
      minPrice: null,
      maxPrice: null,
      date: null,
    };

    setInputPrice({ min: null, max: null });
    setMobilePrice({ min: null, max: null });
    setMobileSearch("");
    setFilters(resetValue);
    setDraftFilters(resetValue);

    prevFiltersRef.current = {
      q: "",
      section: [],
      days: null,
      category: null,
      minPrice: null,
      maxPrice: null,
      date: null,
    };

    if (showMobileFilter) {
      handleCloseFilter();
    }

    router.replace(pathname);
  };

  return (
    <>
      <div className="min-h-screen my-10 md:px-10 ">
        {/* CONTAINER */}
        <div className="xl:max-w-[1024px] 2xl:max-w-[1440px] mx-auto grid grid-cols-12 md:gap-10">
          {/* WRAPPER LEFT FILTER */}

          <div className="hidden md:block col-span-4 2xl:col-span-3 sticky top-24 h-fit">
            {/* Date Filter */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-3 shadow-sm">
              <label className="text-xs font-bold text-slate-600 mb-2 block">Tanggal Keberangkatan</label>
              <DatePickerPopover
                value={filters.date || null}
                onChange={(date) => setFilters((prev) => ({ ...prev, date }))}
                placeholder="Pilih tanggal"
                className="w-full [&>button]:w-full [&>button]:justify-start"
              />
            </div>

            <FilterPanel
              mode="desktop"
              filters={filters}
              inputMinPrice={inputPrice.min}
              inputMaxPrice={inputPrice.max}
              onToggleDay={checkDaysDesktop}
              onToggleSection={checkSectionDesktop}
              onToggleCategory={checkCategoryDesktop}
              onMinPriceChange={handleMinPriceInputDesktop}
              onMaxPriceChange={handleMaxPriceInputDesktop}
              onSelectPriceRange={radioPriceRangeDesktop}
              selectedPriceRange={selectedPriceRange}
            />

            <button
              onClick={handleResetFilter}
              className="bg-blue-500 mt-3 text-white text-center w-full rounded-md py-2 tracking-wide font-semibold text-sm hover:outline-none hover:ring-2 hover:ring-blue-500 hover:bg-white hover:text-blue-500 trasition-all duration-300 shadow-lg cursor-pointer"
            >
              Reset Filter
            </button>
          </div>

          {/* WRAPPER RIGHT TRIP LIST */}
          <div className="col-span-12 mx-3 md:mx-0 md:col-span-8 2xl:col-span-9">
            {/* MOBILE SEARCH - STICKY FULL WIDTH */}
            <div className="md:hidden sticky top-[72px]  z-30 -mx-3 transition-all duration-300">
              <div className="bg-white/95 backdrop-blur-md mb-5 -mt-10 border-b border-slate-200 shadow-md">
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {/* Search Input */}
                    <div className="relative flex items-center flex-1">
                      <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Cari tempat liburanmu"
                        value={mobileSearch}
                        onKeyDown={handleEnter}
                        onChange={(e) => setMobileSearch(e.target.value)}
                        className="w-full pl-11 pr-10 py-3 text-md bg-white border border-slate-300 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 text-sm shadow-sm"
                      />
                    </div>

                    {/* Filter Button */}
                    <button
                      onClick={() => setShowMobileFilter(true)}
                      className="relative shrink-0 flex items-center gap-2 px-4 py-3 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg active:scale-95 transition-all"
                    >
                      <SlidersHorizontal size={18} />
                      <span className="text-sm font-semibold">Filter</span>
                      {isFilterActive && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 border-2 border-white items-center justify-center"></span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* LIST TRIPS PAGINATION */}
            {/* <div className="grid grid-cols-2 mx-1 lg:mx-0 lg:grid-cols-3 gap-3 md:gap-5">
              <TripList
                q={filters.q}
                section={filters.section}
                days={filters.days}
                category={filters.category}
                minPrice={debouncedMinPrice}
                maxPrice={debouncedMaxPrice}
                page={filters.page}
                itemCount={12}
              />
            </div> */}

            {/* LIST TRIPS */}
            <div className="grid grid-cols-2 mx-1 lg:mx-0 lg:grid-cols-3 gap-3 md:gap-5">
              {trips.length === 0 && !isLoading && <p className="col-span-full text-center text-slate-500">Trip tidak ditemukan</p>}

              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} selectedDate={filters.date} />
              ))}

              {isLoading && Array.from({ length: 6 }).map((_, i) => <TripListSkeleton key={i} />)}
            </div>

            {/* SENTINEL */}
            <div ref={loadMoreRef} className="h-10" />

            {isFetchingNextPage && (
              <span className="flex justify-center items-center gap-3 mt-4">
                <div className="w-6 h-6 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                <p className="font-semibold text-gray-500">Memuat trips lainnya...</p>
              </span>
            )}

            {!isFetchingNextPage && !hasNextPage && <p className="text-center mt-4 text-gray-400">Semua trips sudah ditampilkan</p>}

            {/* PAGINATION */}
            {/* <div className="mt-10 flex items-center justify-center">
              <Pagination
                currentPage={filters.page ?? 1}
                totalItems={trips?.total ?? 0}
                pageSize={trips?.pageSize ?? 0}
                onPageChange={handlePageChange}
              />
            </div> */}
          </div>
        </div>

        {/* MOBILE */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setShowMobileFilter(false)}>
            {/* BOTTOM SHEET */}
            <div
              className={`
              absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl
              max-h-[80vh] overflow-y-auto
              ${isClosing ? "animate-slideDown" : "animate-slideUp"}
            `}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5">
                <h2 className="text-lg font-bold">Filter</h2>
                <button onClick={handleCloseFilter}>
                  <CircleX size={30} />
                </button>
              </div>

              {/* MOBILE FILTER */}
              <div className="mx-5">
                {/* Date Filter - Mobile */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-slate-600 mb-2 block">Tanggal Keberangkatan</label>
                  <DatePickerPopover
                    value={draftFilters.date || null}
                    onChange={(date) => setDraftFilters((prev) => ({ ...prev, date }))}
                    placeholder="Pilih tanggal"
                    className="w-full [&>button]:w-full [&>button]:justify-start"
                  />
                </div>

                <FilterPanel
                  mode="mobile"
                  filters={draftFilters}
                  inputMinPrice={mobilePrice.min}
                  inputMaxPrice={mobilePrice.max}
                  onToggleDay={checkDaysMobile}
                  onToggleSection={checkSectionMobile}
                  onToggleCategory={checkCategoryMobile}
                  onMinPriceChange={handleMinPriceInputMobile}
                  onMaxPriceChange={handleMaxPriceInputMobile}
                  onSelectPriceRange={radioPriceRangeMobile}
                  selectedPriceRange={selectedPriceRange}
                />
              </div>
              {/* Button Filter */}
              <div className="sticky bottom-0 flex items-center gap-3 bg-white border-t-2 border-slate-300 z-2 p-3 w-full">
                <button
                  onClick={handleResetFilter}
                  className="bg-[#FE5E00] text-white text-center w-full rounded-md py-2 tracking-wide font-semibold text-sm hover:outline-none hover:ring-2 hover:ring-[#FE5E00] hover:bg-white hover:text-[#FE5E00] trasition-all duration-300 shadow-lg cursor-pointer"
                >
                  Reset Filter
                </button>
                <button
                  onClick={handleApplyMobileFilters}
                  className="bg-[#1B75BC] text-white text-center w-full rounded-md py-2 tracking-wide font-semibold text-sm hover:outline-none hover:ring-2 hover:ring-[#1B75BC] hover:bg-white hover:text-[#1B75BC] trasition-all duration-300 shadow-lg cursor-pointer"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
