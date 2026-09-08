interface Props {
  value?: string | null;
  onToggle: (value: string) => void;
}

export const DurationFilter = ({ value, onToggle }: Props) => {
  const selectedDays = value ? value.split(",") : [];
  const dayOptions = [
    { label: "1 Hari", value: "1" },
    { label: "2 Hari", value: "2" },
    { label: "3 Hari", value: "3" },
    { label: "4 Hari", value: "4" },
    { label: "5 Hari", value: "5" },
    { label: "> 5 Hari", value: ">5" },
  ];

  return (
    <div className="px-5 py-3 ring-1 ring-slate-300 rounded-lg">
      <h3 className="font-semibold">Berdasarkan Durasi</h3>
      <div className="grid grid-cols-3 gap-5 mt-5">
        {dayOptions.map((day, index) => (
          <label key={index} className="space-x-2 flex items-center cursor-pointer group">
            <input
              type="checkbox"
              className="size-4 cursor-pointer accent-blue-600 transition-all duration-500 ease-in-out scale-100 hover:scale-110 active:scale-95"
              onChange={() => onToggle(String(day.value))}
              checked={selectedDays.includes(String(day.value))}
            />
            <span className="text-xs 2xl:text-sm select-none transition-colors duration-200 group-hover:text-blue-600">{day.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
