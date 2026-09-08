"use client";
import BookingPageSection from "@/features/bookings/components/BookingPageSection";

export default function BookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <BookingPageSection tripType="private" params={params} />;
}
