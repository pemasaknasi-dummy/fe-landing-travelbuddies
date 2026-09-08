"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";
import SmartAppBanner from "@/components/ui/SmartAppBanner";
import PendingFeedbackModal from "@/components/ui/PendingFeedbackModal";
import OfflineDetector from "@/components/ui/OfflineDetector";
import ServerErrorBanner from "@/components/ui/ServerErrorBanner";
import ImpersonationBanner from "@/components/ui/ImpersonationBanner";
import DevModeBanner from "@/components/ui/DevModeBanner";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isBookingPage =
    pathname.startsWith("/open-trip/") && pathname.endsWith("/booking");
  const isBookingGuaranteePage =
    pathname.startsWith("/private-trip/") && pathname.endsWith("/booking");
  const isBookingSuccessPage = pathname === "/booking/success";
  const isFeedbackPage =
    pathname.startsWith("/booking/") && pathname.endsWith("/feedback");
  const isFeedbackParticipantPage = pathname.startsWith("/feedback/");
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password");
  const isProfilePage = pathname.startsWith("/profile");
  const isInvoicePage =
    pathname.startsWith("/booking/") && pathname.endsWith("/invoice");
  const isEventAgentPage = pathname.startsWith("/eventagent");
  const isHideLayout =
    isBookingPage ||
    isBookingGuaranteePage ||
    isBookingSuccessPage ||
    isFeedbackPage ||
    isFeedbackParticipantPage ||
    isInvoicePage ||
    isEventAgentPage;
  const isHideModal = isHideLayout || isAuthPage;

  const isTripDetailPage =
    pathname.startsWith("/open-trip/") &&
    pathname !== "/open-trip" &&
    !isBookingPage;
  const isPrivateTripDetailPage =
    pathname.startsWith("/private-trip/") &&
    !isBookingGuaranteePage;

  return (
    <>
      <DevModeBanner />
      <ImpersonationBanner />
      <OfflineDetector />
      <ServerErrorBanner />
      <SmartAppBanner />
      {!isHideLayout && (
        <Suspense fallback={null}>
          <Header />
        </Suspense>
      )}

      {!isHideModal && <PendingFeedbackModal />}

      <main className="flex-1 bg-[#F6F7F9]">{children}</main>

      {!isHideLayout && !isProfilePage && !isTripDetailPage && !isPrivateTripDetailPage && <Footer />}

      <Toaster
        toastOptions={{
          style: { 
            color: "#fff", 
            fontWeight: "bold",
            maxWidth: "600px",
            textAlign: "center",
          },
          success: { style: { background: "#16a34a", color: "#fff", fontWeight: "bold" } },
          error: { style: { background: "#dc2626", color: "#fff", fontWeight: "bold" } },
        }}
      />
    </>
  );
}
