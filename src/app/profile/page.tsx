"use client";

import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import { SpinnerLoading } from "@/components/sections/SpinnerLoading";
import { Calendar, Camera, Clock, Compass, MapPin, Sparkles, TentTree, Users } from "lucide-react";
import { useEffect } from "react";
import { useUpcomingTrips } from "@/features/bookings/hooks/useBooking";
import HistoryOrderPage from "./HistoryOrderPage";

export default function Page() {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // important for mobile
    });
  }, []);

  return <HistoryOrderPage />;
}
