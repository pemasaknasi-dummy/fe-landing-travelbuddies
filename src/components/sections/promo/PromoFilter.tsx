import { Search } from "lucide-react";

export type FilterCategory = "all" | "open-trip" | "private-trip" | "voucher" | "limited";

interface PromoFilterProps {
  activeFilter: FilterCategory;
  onFilterChange: (filter: FilterCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const filters: { id: FilterCategory; label: string }[] = [
  { id: "all", label: "Semua Promo" },
  { id: "open-trip", label: "Open Trip" },
  { id: "private-trip", label: "Private Trip" },
  { id: "voucher", label: "Voucher" },
  { id: "limited", label: "Limited Time" },
];

export function PromoFilter({ activeFilter, onFilterChange, searchQuery, onSearchChange }: PromoFilterProps) {
  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari promo..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`filter-pill ${activeFilter === filter.id ? "filter-pill-active" : ""}`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
