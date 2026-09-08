"use client";

type PaginationProps = {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ currentPage, totalItems, pageSize, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const getVisiblePages = (current: number, total: number, range = 5) => {
    const half = Math.floor(range / 2);

    let start = Math.max(current - half, 1);
    let end = Math.min(start + range - 1, total);

    // adjust if not enough pages at end
    if (end - start + 1 < range) {
      start = Math.max(end - range + 1, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-x-2 md:gap-x-3 mt-8">
      {/* First */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="px-2 py-1 text-sm rounded-md transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 cursor-pointer"
      >
        ⏮
      </button>

      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 py-1 text-sm rounded-md transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-slate-200 md:flex md:gap-x-2"
      >
        {"<"} <span className="hidden md:block md:font-semibold">Previous</span>
      </button>

      {/* Left Ellipsis */}
      {visiblePages[0] > 1 && <span className="hidden md:block px-2 text-gray-400">...</span>}

      {/* Pages */}
      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-lg text-sm transition cursor-pointer ${
            page === currentPage ? "bg-slate-900 text-white shadow" : "hover:bg-slate-200"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Right Ellipsis */}
      {visiblePages[visiblePages.length - 1] < totalPages && <span className="hidden md:block px-2 text-gray-400">...</span>}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 py-1 text-sm rounded-md transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-slate-200 md:flex md:gap-x-1"
      >
        <span className="hidden md:block font-semibold">Next</span> {">"}
      </button>

      {/* Last */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="px-2 py-1 text-sm rounded-md transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-slate-200"
      >
        ⏭
      </button>
    </nav>
  );
}
