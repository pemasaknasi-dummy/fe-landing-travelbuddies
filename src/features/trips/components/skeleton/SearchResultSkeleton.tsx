import AppPromotion from "@/components/sections/AppPromotion";
import FilterTripSkeleton from "./FIlterTripSkeleton";
import TripListSkeleton from "./TripListSkeleton";

export default function SearchResultSkeleton() {
  return (
    <>
    <div className="max-w-[1024px] 2xl:max-w-[1440px]  mx-auto my-10 grid grid-cols-12 gap-10">
        <div className="hidden md:block col-span-4">
          <FilterTripSkeleton />
        </div>
        <div className="col-span-12 md:col-span-8 grid grid-cols-2 md:grid-cols-3 w-full gap-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <TripListSkeleton key={index} />
          ))}
        </div>
      </div>

      <div className="my-12">
        <AppPromotion />
      </div>
    </>
  );
}
