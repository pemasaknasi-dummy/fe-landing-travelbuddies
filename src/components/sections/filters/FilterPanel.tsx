import { GetTripsParams } from "@/features/trips/api/trip-api";
import { CategoryFilter } from "./CategoryFilter";
import { DurationFilter } from "./DurationFilter";
import { PriceFilter, PriceRangeKey } from "./PriceFilter";
import { SectionFilter } from "./SectionFilter";

type FilterPanelProps = {
  mode: "desktop" | "mobile";
  filters: GetTripsParams;
  inputMinPrice?: number | null;
  inputMaxPrice?: number | null;
  onToggleDay: (value: string) => void;
  onToggleSection: (value: "popular" | "recommended") => void;
  onToggleCategory: (id: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onSelectPriceRange: (range: PriceRangeKey) => void;
  selectedPriceRange: string | null;
};

export function FilterPanel({
  mode,
  filters,
  inputMinPrice,
  inputMaxPrice,
  onToggleDay,
  onToggleSection,
  onToggleCategory,
  onMinPriceChange,
  onMaxPriceChange,
  onSelectPriceRange,
  selectedPriceRange,
}: FilterPanelProps) {
  return (
    <div className={`${mode === "desktop" ? "hidden md:block max-h-[65vh] overflow-y-auto p-2 rounded-xl relative" : ""}`}>
      <DurationFilter value={filters.days} onToggle={onToggleDay} />

      <SectionFilter value={filters.section} onToggle={onToggleSection} />

      <CategoryFilter value={filters.category} onToggle={onToggleCategory} />

      <PriceFilter
        minPrice={inputMinPrice}
        maxPrice={inputMaxPrice}
        selectedPriceRange={selectedPriceRange}
        onMinChange={onMinPriceChange}
        onMaxChange={onMaxPriceChange}
        onSelectRange={onSelectPriceRange}
      />
    </div>
  );
}
