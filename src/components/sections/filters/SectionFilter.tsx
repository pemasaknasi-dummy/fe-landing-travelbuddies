interface Props {
  value?: ("recommended" | "popular")[];
  onToggle: (value: "recommended" | "popular") => void;
}

export const SectionFilter = ({ value, onToggle }: Props) => {
  return (
    <div className="px-5 py-3 ring-1 ring-slate-300 rounded-lg mt-5">
      <h3 className="font-semibold">Berdasarkan Ketertarikan</h3>

      <div className="mt-5 space-y-3">
        {["popular", "recommended"].map((section) => (
          <label key={section} className="space-x-2 flex items-center cursor-pointer">
            <input
              type="checkbox"
              id={section}
              name={section}
              className="size-4 cursor-pointer accent-blue-600 transition-all duration-500 ease-in-out scale-100 hover:scale-110 active:scale-95"
              onChange={() => onToggle(section as "popular" | "recommended")}
              checked={value?.includes(section as any) || false}
            />
            <span>{section === "popular" ? "Perjalanan Popular" : section === "recommended" ? "Rekomendasi Terbaru" : "unknown"}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
