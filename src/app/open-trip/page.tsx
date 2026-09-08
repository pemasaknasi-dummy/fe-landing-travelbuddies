import { Suspense } from "react";
import SearchResult from "./SearchResult";
import SearchResultSkeleton from "@/features/trips/components/skeleton/SearchResultSkeleton";

export default function Page() {
  return (
    <Suspense fallback={<SearchResultSkeleton />}>
      <SearchResult />
    </Suspense>
  );
}
