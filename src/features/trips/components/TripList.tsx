"use client";

import TripCard from "@/features/trips/components/TripCard";
import { useTrips } from "../hooks/useTrips";
import TripListSkeleton from "./skeleton/TripListSkeleton";

interface TripListProps {
  section?: ("popular" | "recommended")[];
  itemCount?: number;
  days?: string | null;
  category?: string | null,
  minPrice?: number | null;
  maxPrice?: number | null;
  q?: string;
  pageSize?: number;
  page?: number;
  total?: number;
}

export const TripList = ({
  section,
  itemCount,
  days,
  category,
  minPrice,
  maxPrice,
  q,
  pageSize,
  total,
  page,
}: TripListProps) => {
  const {
    data: trips,
    isLoading,
    error,
  } = useTrips({
    ...(section ? { section } : {}),
    pageSize: itemCount ?? 10,
    section,
    days,
    category,
    minPrice,
    maxPrice,
    q,
    page,
    total,
  });

  if (isLoading) {
    return (
      <>
        {Array.from({ length: itemCount || 8 }).map((_, index) => (
          <TripListSkeleton key={index} />
        ))}
      </>
    );
  }

  if (error) {
    return <div>Error loading trips: {error.message}</div>;
  }

  return (
    <>
      {trips?.items?.length === 0 ? (
        <p className="text-center font-semibold text-slate-500 tracking-wider">
          Trip tidak ditemukan
        </p>
      ) : (
        trips?.items.map((trip) => <TripCard key={trip.id} trip={trip} />)
      )}
    </>
  );
};
