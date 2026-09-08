import { Loader2 } from "lucide-react";

export const SpinnerLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center my-15 gap-4">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      <p className="text-sm text-gray-600 font-medium">Memuat data...</p>
    </div>
  );
};
