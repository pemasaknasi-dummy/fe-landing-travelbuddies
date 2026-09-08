"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, Menu, X, User, LogIn, LogOut, ReceiptText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDebounce } from "@/lib/useDebounce";
import { Trip } from "@/features/trips/api/trip-api";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useProfileQuery } from "@/features/profile/hooks/useProfile";
import { getUser } from "@/lib/session";

const Header: React.FC = () => {
  const { logout, isAuth } = useAuth();
  const data = getUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (!pathname) return false;
    if (path === "/open-trip") {
      return pathname.startsWith("/open-trip");
    }
    return pathname.startsWith(path);
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tripsResult, setTripsResult] = useState<Trip[]>([]);
  const [userSearch, setUserSearch] = useState<string>("");
  const [inputSearchFocus, setInputSearchFocus] = useState<boolean>(false);
  const debouncedUserSearch = useDebounce(userSearch, 500);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (debouncedUserSearch.trim().length > 0) {
      setIsLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/suggestion?q=${debouncedUserSearch}`)
        .then((res) => res.json())
        .then((data) => {
          setTripsResult(data.items);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Fetch /trips error: ", err);
          setIsLoading(false);
        });
    } else {
      setUserSearch("");
      setTripsResult([]);
      setIsLoading(false);
    }
  }, [debouncedUserSearch]);

  useEffect(() => {
    const qParam = searchParams.get("q") || "";
    setUserSearch(qParam);
  }, [searchParams]);

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (!userSearch.trim()) {
        router.push(`/open-trip`);
        searchRef.current?.blur();
        setInputSearchFocus(false);
        return;
      }

      router.push(`/open-trip?q=${encodeURIComponent(userSearch)}`);
      searchRef.current?.blur();

      setInputSearchFocus(false);
    }
  };

  const handleSuggestClick = (slug: string) => {
    router.push(`/open-trip/${slug}`);
    setUserSearch("");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMenuClick = (action: string) => {
    setIsOpen(false);

    switch (action) {
      case "profile":
        router.push("/profile");
        setMobileMenuOpen(false);
        break;
      case "logout":
        logout();
        setMobileMenuOpen(false);
        break;
      default:
        setIsOpen(false);
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 py-1">
      <div className="container mx-auto max-w-[1024px] 2xl:max-w-[1440px]">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 xl:px-0">
          {/* Left Section - Logo and Search */}
          <div className="flex items-center flex-1">
            {/* LOGO with animation */}
            <Link href={"/"} className="group transition-transform hover:scale-105 active:scale-95">
              <Image src={"/images/logo/logo.png"} alt="tb-logo" width={130} height={50} className="w-[100px] md:w-[130px] md:h-[50px] object-contain" />
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md lg:max-w-xl ml-6 lg:ml-10">
              <div className="relative w-full">
                <Search color="gray" className="absolute left-3 z-10 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors duration-200 group-focus-within:text-blue-500" />
                <div className="relative w-full">
                  <input type="text" placeholder="Cari destinasi impianmu..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white placeholder:text-gray-400 transition-all duration-200" ref={searchRef} onChange={(e) => setUserSearch(e.target.value)} value={userSearch} onKeyDown={handleEnter} onFocus={() => setInputSearchFocus(true)} onBlur={() => setInputSearchFocus(false)} />

                  {/* NOT FOUND SUGGEST */}
                  {!isLoading && inputSearchFocus && debouncedUserSearch.length > 0 && tripsResult.length === 0 && (
                    <div className="absolute top-full mt-2 w-full animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex flex-col bg-white w-full py-3 px-4 rounded-xl ring-1 ring-gray-200 shadow-lg">
                        <h1 className="text-sm font-medium text-gray-500">✨ Tidak ditemukan trip dengan kata kunci "{debouncedUserSearch}"</h1>
                      </div>
                    </div>
                  )}

                  {/* Search Result Suggest */}
                  {!isLoading && inputSearchFocus && debouncedUserSearch.length > 0 && tripsResult.length > 0 && (
                    <div className="absolute top-full mt-2 w-full animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex flex-col bg-white w-full py-2 rounded-xl ring-1 ring-gray-200 shadow-lg max-h-64 overflow-y-auto">
                        {tripsResult.map((trip, idx) => (
                          <button key={idx} onMouseDown={() => handleSuggestClick(trip.slug)} className="group flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer w-full text-left border-b last:border-0 border-gray-100">
                            <Search className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{trip.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {/* Navigation Links with modern styling */}
            <Link
              href={"/private-trip"}
              className={`relative px-4 py-2 font-medium transition-colors duration-200 group ${
                isActive("/private-trip") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <span>Private Trip</span>
              <span
                className={`absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ${
                  isActive("/private-trip") ? "w-1/2 left-1/4" : "w-0 left-1/2 group-hover:w-1/2 group-hover:left-1/4"
                }`}
              ></span>
            </Link>

            <Link
              href={"/open-trip"}
              className={`relative px-4 py-2 font-medium transition-colors duration-200 group ${
                isActive("/open-trip") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <span>Open Trip</span>
              <span
                className={`absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ${
                  isActive("/open-trip") ? "w-1/2 left-1/4" : "w-0 left-1/2 group-hover:w-1/2 group-hover:left-1/4"
                }`}
              ></span>
            </Link>

            <Link
              href={"/bisnis-trip"}
              className={`relative px-4 py-2 font-medium transition-colors duration-200 group ${
                isActive("/bisnis-trip") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <span>Bisnis Trip</span>
              <span
                className={`absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ${
                  isActive("/bisnis-trip") ? "w-1/2 left-1/4" : "w-0 left-1/2 group-hover:w-1/2 group-hover:left-1/4"
                }`}
              ></span>
            </Link>

            <Link
              href={"/promo"}
              className={`relative px-4 py-2 font-medium transition-colors duration-200 group ${
                isActive("/promo") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <span>Promo</span>
              <span
                className={`absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ${
                  isActive("/promo") ? "w-1/2 left-1/4" : "w-0 left-1/2 group-hover:w-1/2 group-hover:left-1/4"
                }`}
              ></span>
            </Link>

            {/* Profile Section */}
            {isAuth ? (
              <div className="relative ml-2" ref={dropdownRef}>
                <button onClick={() => setIsOpen(!isOpen)} className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-blue-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <Image src={data?.photo || `/images/no-profile.png`} alt={data?.name || "profile"} fill className="object-cover" />
                </button>

                {isOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg ring-1 ring-gray-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{data?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{data?.email}</p>
                    </div>

                    <button onClick={() => handleMenuClick("profile")} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>Profil Saya</span>
                    </button>

                    <button onClick={() => handleMenuClick("profile")} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer">
                      <ReceiptText className="w-4 h-4 text-gray-500" />
                      <span>History Order</span>
                    </button>

                    <button onClick={() => handleMenuClick("logout")} className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors cursor-pointer">
                      <LogOut className="w-4 h-4" />
                      <span>Keluar</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href={"/login"} className="ml-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
                Masuk
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden relative w-10 h-10 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="text-gray-600 w-5 h-5" /> : <Menu className="text-gray-600 w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 sm:px-6 py-4 border-t border-gray-100 bg-white/95 backdrop-blur-sm animate-in slide-in-from-top duration-200">
            {/* Mobile Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" placeholder="Cari destinasi..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" onChange={(e) => setUserSearch(e.target.value)} value={userSearch} onKeyDown={handleEnter} />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Link
                href={"/private-trip"}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 font-medium rounded-xl transition-colors ${
                  isActive("/private-trip") ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Private Trip
              </Link>
              <Link
                href={"/open-trip"}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 font-medium rounded-xl transition-colors ${
                  isActive("/open-trip") ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Open Trip
              </Link>
              <Link
                href={"/bisnis-trip"}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 font-medium rounded-xl transition-colors ${
                  isActive("/bisnis-trip") ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Bisnis Trip
              </Link>
              <Link
                href={"/promo"}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 font-medium rounded-xl transition-colors ${
                  isActive("/promo") ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Promo
              </Link>

              {isAuth ? (
                <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
                  {/* Profile Info */}
                  <Link href={"/profile"} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="relative w-12 h-12 shrink-0">
                      {data?.photo ? (
                        <Image src={data.photo} fill alt={data?.name} className="rounded-xl object-cover" />
                      ) : (
                        <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{data?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{data?.email}</p>
                    </div>
                  </Link>

                  {/* Menu Actions */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        handleMenuClick("profile");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                    >
                      <ReceiptText className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">History Order</span>
                    </button>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      handleMenuClick("logout");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 active:bg-red-200 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar</span>
                  </button>
                </div>
              ) : (
                <Link href={"/login"} onClick={() => setMobileMenuOpen(false)} className="mt-3 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-center text-white font-semibold px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-md active:scale-[0.98] transition-all duration-200">
                  Masuk
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
