import { MoveRight } from "lucide-react";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";

export const SectionHeader: React.FC<{ title: string; link?: string; loading?: boolean }> = ({ title, link, loading }) => {
  if (loading) {
    return (
      <div className="mb-5 md:flex md:items-center md:justify-between">
        <div className="w-[60%] md:h-[30px] md:w-[30%]">
          <Skeleton />
        </div>

        <div className="w-[30%] md:h-[30px] md:w-[15%]">
          <Skeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start md:flex-row md:items-center justify-between mb-6">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
      {link && (
        <Link href={link} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium cursor-pointer hover:underline">
          Lihat Semua
          <MoveRight className="w-5 h-5" />
        </Link>
      )}
    </div>
  );
};
