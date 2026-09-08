export type PriceRangeKey = "first" | "second" | "third" | null;

interface PriceFilterProps {
  minPrice?: number | null;
  maxPrice?: number | null;
  selectedPriceRange: string | null;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  onSelectRange: (range: PriceRangeKey) => void;
}

export const PriceFilter = ({ minPrice, maxPrice, selectedPriceRange, onMinChange, onMaxChange, onSelectRange }: PriceFilterProps) => {
  const formatNumber = (value: string) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return (
    <div className="px-5 py-3 mt-5 ring-1 ring-slate-300 rounded-lg">
      <h3 className="font-semibold">Berdasarkan Harga</h3>

      {/* INPUT PRICE */}
      <div className="flex gap-5 my-5">
        <div className="w-1/2">
          <label className="text-sm text-slate-500 font-semibold">Minimal</label>
          <input
            type="text"
            value={minPrice ? formatNumber(String(minPrice)) : ""}
            onChange={(e) => onMinChange(String(e.target.value))}
            placeholder="Harga Minimal"
            className="ring-1 ring-slate-300 h-10 px-3 w-full rounded-md text-sm"
          />
        </div>

        <div className="w-1/2">
          <label className="text-sm text-slate-500 font-semibold">Maximal</label>
          <input
            type="text"
            value={maxPrice ? formatNumber(String(maxPrice)) : ""}
            onChange={(e) => onMaxChange(String(e.target.value))}
            placeholder="Harga Maximal"
            className="ring-1 ring-slate-300 h-10 px-3 w-full rounded-md text-sm"
          />
        </div>
      </div>

      {/* RADIO */}
      <div className="space-y-4">
        <label className="flex gap-2 cursor-pointer">
          <input type="radio" checked={selectedPriceRange === "first"} onChange={() => onSelectRange("first")} />
          Rp. 100.000 - Rp. 500.000
        </label>

        <label className="flex gap-2 cursor-pointer">
          <input type="radio" checked={selectedPriceRange === "second"} onChange={() => onSelectRange("second")} />
          Rp. 500.000 - Rp. 1.000.000
        </label>

        <label className="flex gap-2 cursor-pointer">
          <input type="radio" checked={selectedPriceRange === "third"} onChange={() => onSelectRange("third")} />
          {">"} Rp. 1.000.000
        </label>
      </div>
    </div>
  );
};
