"use client";

import { useProfileQuery } from "@/features/profile/hooks/useProfile";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Edit2, Phone, IdCard, Mars, Venus, VenusAndMars, Camera, UserCheck } from "lucide-react";
import dayjs from "dayjs";
import ModalUpdateProfile from "@/components/sections/ModalUpdateProfile";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { getUser } from "@/lib/session";

export default function ProfilPageLayout({ children }: { children: ReactNode }) {
  const authUser = getUser();
  const { data: profileData } = useProfileQuery();
  const user = profileData || authUser;

  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const [isUpdateProfileModal, setIsUpdateProfileModal] = useState<boolean>(() => {
    return typeof window !== "undefined" && localStorage.getItem("updateProfileModal") === "true";
  });

  const handleOpenUpdateProfileModal = () => {
    localStorage.setItem("updateProfileModal", "true");
    setIsUpdateProfileModal(true);
  };

  const handleCloseUpdateProfileModal = () => {
    localStorage.removeItem("updateProfileModal");
    setIsUpdateProfileModal(false);
  };

  useEffect(() => {
    localStorage.setItem("updateProfileModal", String(isUpdateProfileModal));
  }, [isUpdateProfileModal]);

  // Close modal if user move url
  useEffect(() => {
    localStorage.removeItem("updateProfileModal");
    setIsUpdateProfileModal(false);
  }, [pathname]);

  // DISABLE SCROLL isUpdateProfile true
  useEffect(() => {
    if (isUpdateProfileModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isUpdateProfileModal]);

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-6 lg:py-10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Two-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative">
          
          {/* Left Column: Sidebar Profile */}
          <aside className="w-full lg:w-[340px] lg:flex-shrink-0 lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:p-6 overflow-hidden relative w-full">
              {/* Header Gradient */}
              <div className="absolute top-0 left-0 w-full h-20 lg:h-24 bg-gradient-to-r from-[#1D79B5] to-[#155A8A]"></div>

              <div className="relative mt-6 lg:mt-8 flex flex-col items-center">
                {/* Avatar */}
                <div className="relative group cursor-pointer" onClick={handleOpenUpdateProfileModal}>
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-white p-1 shadow-md ring-2 ring-white">
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[#1D79B5] to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                      {user?.photo ? (
                        <Image
                          src={user.photo}
                          alt={user?.name || "profile"}
                          fill
                          className="object-cover rounded-full"
                        />
                      ) : (
                        <span>{user?.name?.charAt(0)?.toUpperCase() || "S"}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenUpdateProfileModal();
                    }}
                    className="absolute bottom-0 right-0 bg-white p-1.5 lg:p-2 rounded-full shadow border border-gray-100 text-gray-500 hover:text-[#1D79B5] transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Name & Email */}
                <h1 className="text-base lg:text-lg font-bold text-gray-900 mt-3 tracking-tight text-center">
                  {user?.name || "User"}
                </h1>

                <p className="text-gray-500 mt-1 text-xs lg:text-sm truncate max-w-[260px] text-center">
                  {user?.email || "-"}
                </p>

                {/* Information Grid (2 columns) */}
                <div className="w-full mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2.5 text-left">
                  {/* Phone */}
                  <div className="flex flex-col gap-1 p-2.5 bg-gray-50/80 hover:bg-gray-100 rounded-xl border border-gray-100 transition-colors">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#1D79B5]" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">No HP</span>
                    </div>
                    <p className="text-[11px] lg:text-xs font-semibold text-gray-700 truncate">
                      {user?.phone || "Belum diatur"}
                    </p>
                  </div>

                  {/* Tanggal Lahir */}
                  <div className="flex flex-col gap-1 p-2.5 bg-gray-50/80 hover:bg-gray-100 rounded-xl border border-gray-100 transition-colors">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tgl Lahir</span>
                    </div>
                    <p className="text-[11px] lg:text-xs font-semibold text-gray-700 truncate">
                      {user?.dateOfBirth ? dayjs(user.dateOfBirth).format("DD MMM YYYY") : "Belum diatur"}
                    </p>
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-1 p-2.5 bg-gray-50/80 hover:bg-gray-100 rounded-xl border border-gray-100 transition-colors">
                    <div className="flex items-center gap-1.5">
                      {user?.gender === "Male" ? (
                        <Mars className="w-3.5 h-3.5 text-blue-500" />
                      ) : user?.gender === "Female" ? (
                        <Venus className="w-3.5 h-3.5 text-pink-500" />
                      ) : (
                        <VenusAndMars className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gender</span>
                    </div>
                    <p className="text-[11px] lg:text-xs font-semibold text-gray-700 truncate">
                      {user?.gender === "Male" ? "Laki-laki" : user?.gender === "Female" ? "Perempuan" : "Belum diatur"}
                    </p>
                  </div>

                  {/* KTP */}
                  <div className="flex flex-col gap-1 p-2.5 bg-gray-50/80 hover:bg-gray-100 rounded-xl border border-gray-100 transition-colors">
                    <div className="flex items-center gap-1.5">
                      <IdCard className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">No KTP</span>
                    </div>
                    <p className="text-[11px] lg:text-xs font-semibold text-gray-700 truncate font-mono">
                      {user?.noKtp
                        ? user.noKtp.length > 4
                          ? `****${user.noKtp.slice(-4)}`
                          : user.noKtp
                        : "Belum diatur"}
                    </p>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={handleOpenUpdateProfileModal}
                  className="w-full mt-5 flex items-center justify-center gap-2 bg-[#1D79B5] hover:bg-[#155A8A] text-white px-4 py-2.5 rounded-xl text-xs lg:text-sm font-semibold transition-all shadow-sm cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profil
                </button>
              </div>
            </div>
          </aside>

          {/* Right Column: Main Content */}
          <main className="flex-1 min-w-0 w-full">
            {/* Tabs Header */}
            <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100 flex items-center gap-1 w-full sm:w-fit mb-4 lg:mb-6">
              <Link
                href="/profile"
                className={`flex-1 sm:flex-none px-6 py-2 lg:py-2.5 rounded-lg text-xs lg:text-sm font-bold transition-all text-center ${
                  isActive("/profile")
                    ? "bg-[#1D79B5] text-white shadow"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                My Trips
              </Link>
              <Link
                href="/profile/my-rewards"
                className={`flex-1 sm:flex-none px-6 py-2 lg:py-2.5 rounded-lg text-xs lg:text-sm font-bold transition-all text-center ${
                  isActive("/profile/my-rewards")
                    ? "bg-[#1D79B5] text-white shadow"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                My Rewards
              </Link>
            </div>

            {/* Page Content */}
            <ProtectedRoute>{children}</ProtectedRoute>
          </main>

        </div>
      </div>

      {isUpdateProfileModal && <ModalUpdateProfile onClose={handleCloseUpdateProfileModal} />}
    </div>
  );
}
