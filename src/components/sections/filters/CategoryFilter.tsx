import { useCategories } from "@/features/categories/hooks/useCategory";

interface Props {
  value?: string | null;
  onToggle: (value: string) => void;
}

export const CategoryFilter = ({ value, onToggle }: Props) => {
  const { data: categories } = useCategories();
  const selectedCategory = value ? value.split(",") : [];

  return (
    <div className="px-5 py-3 ring-1 ring-slate-300 rounded-lg mt-5">
      <h3 className="font-semibold">Berdasarkan Kategori</h3>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {categories?.items.map((category) => (
          <label key={category.id} className="space-x-2 flex items-center cursor-pointer">
            <input
              type="checkbox"
              id={category.name}
              name={category.name}
              className="size-4 cursor-pointer accent-blue-600 transition-all duration-500 ease-in-out scale-100 hover:scale-110 active:scale-95"
              onChange={() => onToggle(category.slug)}
              checked={selectedCategory.includes(category.slug)}
            />
            <span>{category.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
