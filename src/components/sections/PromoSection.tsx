"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Tag, Gift, ChevronDown, ChevronUp, Info, Check, AlertCircle, X, Clock, OctagonAlert } from "lucide-react";
import { usePromoCode, usePromos } from "@/features/promos/hooks/usePromo";
import { ApplicablePromosResponse, PromoByCodeResponse } from "@/features/promos/api/promo-api";
import { SpinnerLoading } from "./SpinnerLoading";
import { UserVoucher } from "@/features/vouchers/api/voucher-api";
import { useUserVouchers } from "@/features/vouchers/hooks/useVouchers";
import { formatRupiah } from "@/lib/format-rupiah";
import dayjs from "dayjs";

interface PromoSectionProps {
  applicablePromos?: ApplicablePromosResponse[];
  participants: number;
  selectedPromo: ApplicablePromosResponse | null;
  selectedVoucher: UserVoucher | null;
  tripId: number;
  userId?: number;
  onSelectPromo: (promo: ApplicablePromosResponse | null) => void;
  onSelectVoucher: (voucher: UserVoucher | null) => void;
}

interface PropsPromoBookingForm {
  tripId?: number;
  date?: string;
  participantCount?: number;
  selectedPromo: ApplicablePromosResponse | null;
  selectedVoucher: UserVoucher | null;
  userId?: number;
  onSelectedPromo: (promo: ApplicablePromosResponse | null) => void;
  onSelectedVoucher: (voucher: UserVoucher | null) => void;
}

const PromoSection: React.FC<PromoSectionProps> = ({ applicablePromos = [], tripId, selectedPromo, selectedVoucher, userId, participants, onSelectPromo, onSelectVoucher }) => {
  const [activeTab, setActiveTab] = useState<"promo" | "voucher">("promo");
  const [expandedPromo, setExpandedPromo] = useState<number | null>(null);
  const [hasPromo, setHasPromo] = useState<any[] | null>(null);
  const [promoCode, setPromoCode] = useState<string>("");
  const [searchCode, setSearchCode] = useState<string>(""); // State terpisah untuk trigger query
  const [isApplyingCode, setIsApplyingCode] = useState<boolean>(false);
  const [codeError, setCodeError] = useState<string>("");
  const [showCodeInput, setShowCodeInput] = useState<boolean>(false);
  const [foundPromo, setFoundPromo] = useState<PromoByCodeResponse[]>([]);

  // Promo Code Search
  // const { promoByCodeQuery } = usePromo({ tripId: tripId, q: searchCode });
  const { data: promoByCode, isLoading: isLoadingPromoCode, isError, error } = usePromoCode({ tripId: tripId, q: searchCode });

  // Voucher Data
  const { data: vouchers, isLoading: isLoadingVouchers } = useUserVouchers(userId);
  const availableVouchers = useMemo(() => vouchers || [], [vouchers]);

  useEffect(() => {
    if (!applicablePromos || applicablePromos.length === 0) return;
    setHasPromo(applicablePromos);
  }, [applicablePromos]);

  useEffect(() => {
    if (!searchCode.trim()) return;

    // 1️⃣ ERROR DARI API (PALING PRIORITAS)
    if (isError) {
      const message = (error as any)?.response?.data?.message ?? error?.message ?? "Kode promo tidak valid atau sudah tidak berlaku";
      setCodeError(message);
      setFoundPromo([]);
      setIsApplyingCode(false);
      return;
    }

    // 2️⃣ MASIH LOADING
    if (isLoadingPromoCode) return;

    // 3️⃣ SUCCESS TAPI DATA KOSONG
    if (!promoByCode || promoByCode.length === 0) {
      setCodeError("Kode promo tidak ditemukan atau tidak berlaku");
      setFoundPromo([]);
      setIsApplyingCode(false);
      return;
    }

    // 4️⃣ SUCCESS & DATA ADA
    const isExisting = hasPromo?.some((p) => promoByCode.some((codePromo) => codePromo.id === p.id));

    if (isExisting) {
      setCodeError("Promo sudah ada di daftar");
      setFoundPromo([]);
    } else {
      setFoundPromo(promoByCode);
      setCodeError("");
    }

    setIsApplyingCode(false);
  }, [searchCode, promoByCode, isLoadingPromoCode, isError, error, hasPromo]);

  const handleSearchPromoCode = () => {
    if (!promoCode.trim()) {
      setCodeError("Masukkan kode promo terlebih dahulu");
      return;
    }

    setIsApplyingCode(true);
    setCodeError("");
    setFoundPromo([]);
    setSearchCode(promoCode); // Trigger query
  };

  const togglePromo = (promoId: number): void => {
    setExpandedPromo(expandedPromo === promoId ? null : promoId);
  };

  const formatDiscount = (promo: any): string => {
    if (promo.discountMode === "fix-amount" || promo.discountMode === "fixed") {
      return `Rp ${promo.discountValue.toLocaleString("id-ID")}`;
    } else if (promo.discountMode === "percentage") {
      return `${promo.discountValue}%`;
    }
    return promo.estimatedDiscount ? `Rp ${promo.estimatedDiscount.toLocaleString("id-ID")}` : "";
  };

  const stripHtml = (html: string): string => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  function mapPromoByCodeToApplicable(promo: PromoByCodeResponse): ApplicablePromosResponse {
    return {
      id: promo.id,
      code: promo.code,
      name: promo.name,
      description: promo.description,
      image: promo.image,
      discountMode: promo.discountMode,
      discountValue: promo.discountValue,
      estimatedDiscount: promo.estimatedDiscount, // hitung nanti dari total
      maximumDiscount: promo.maximumDiscount, // kalau tidak ada di promo code
      terms: promo.terms,
    };
  }

  const handleApplyFoundPromo = () => {
    if (foundPromo) {
      setHasPromo((prev) => {
        const prevPromos = prev || [];
        const mapped = foundPromo.map(mapPromoByCodeToApplicable);
        const unique = mapped.filter((p: any) => !prevPromos.some((prevP) => prevP.id === p.id));
        return [...unique, ...prevPromos];
      });

      setPromoCode("");
      setSearchCode("");
      setFoundPromo([]);
      setShowCodeInput(false);
      setCodeError("");
    }
  };

  const handleCancelFoundPromo = () => {
    setFoundPromo([]);
    setPromoCode("");
    setSearchCode("");
    setCodeError("");
  };

  const handleSelectedPromo = (promo: ApplicablePromosResponse | null) => {
    onSelectPromo(promo);
  };

  const handleSelectVoucher = (voucher: UserVoucher) => {
    if (selectedVoucher?.id === voucher.id) {
      onSelectVoucher(null);
    } else {
      onSelectVoucher(voucher);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      {/* Header - Compact */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-900">Hemat Lebih Banyak</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 p-1 bg-slate-200 rounded-lg">
        <button type="button" onClick={() => setActiveTab("promo")} className={`flex-1 py-1.5 text-sm rounded-md transition-all font-semibold cursor-pointer ${activeTab === "promo" ? "bg-blue-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          Promo
        </button>
        <button type="button" onClick={() => setActiveTab("voucher")} className={`flex-1 py-1.5 text-sm rounded-md transition-all font-semibold cursor-pointer ${activeTab === "voucher" ? "bg-blue-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          Voucher Saya
        </button>
      </div>

      {/* <div className="bg-linear-to-r from-yellow-200 to-orange-300 border border-orange-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-1">Promo Hanya Tersedia di Mobile App Travelbuddies</h3>
            <p className="text-xs md:text-sm text-slate-700 mb-3">Gunakan promo ini dengan mudah melalui aplikasi mobile. Download sekarang untuk mendapatkan penawaran terbaik!</p>
            <div className="flex flex-wrap gap-2">
              <a href="https://play.google.com/store/apps/details?id=id.travelbuddies.app&hl=id" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 bg-slate-900 text-white text-xs md:text-sm font-medium px-3 py-2 rounded-lg hover:bg-linear-to-r hover:from-teal-500 hover:via-green-500 hover:to-yellow-500 transition-colors duration-300 cursor-pointer">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                Google Play
              </a>
              <a href="https://apps.apple.com/id/app/travel-buddies/id6757420967" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 bg-slate-900 text-white text-xs ms:text-sm font-medium px-3 py-2 rounded-lg hover:bg-linear-to-br hover:from-blue-500 hover:to-cyan-400 transition-colors duration-300 cursor-pointer">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                </svg>
                App Store
              </a>
            </div>
          </div>
        </div>
      </div> */}

      {activeTab === "promo" ? (
        <>
          {/* Promo Code Input Section */}
          <div className="mb-4">
            {!showCodeInput ? (
              <button type="button" onClick={() => setShowCodeInput(true)} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-lg cursor-pointer transition-all group">
                <Tag className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-blue-700">Punya Kode Promo?</span>
              </button>
            ) : (
              <div className="border border-blue-200 rounded-lg p-3 bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
                <div className="flex items-start gap-2 mb-2">
                  <div className="flex-1">
                    <label htmlFor="promo-code" className="text-xs font-medium text-slate-700 mb-1.5 block">
                      Masukkan Kode Promo
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="promo-code"
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setCodeError("");
                        }}
                        placeholder="Contoh: DISKON50"
                        className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                        disabled={isApplyingCode}
                      />
                      <button type="button" onClick={handleSearchPromoCode} disabled={isApplyingCode || !promoCode.trim()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow">
                        {isApplyingCode ? (
                          <span className="flex items-center gap-1">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          </span>
                        ) : (
                          "Cari"
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCodeInput(false);
                      setPromoCode("");
                      setCodeError("");
                    }}
                    className="mt-6 p-1.5 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                {codeError && (
                  <div className="flex items-start gap-2 mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">{codeError}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Found Promo */}
          {foundPromo &&
            foundPromo.map((promo, index) => (
              <div key={index} className="my-3 border border-green-200 rounded-lg p-3 bg-green-50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg overflow-hidden ring-1 ring-green-300">
                      {promo.image ? (
                        <img src={promo.image} alt={promo.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-green-600 flex items-center justify-center">
                          <Gift className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">{promo.name}</h4>
                      <span className="flex-shrink-0 bg-green-600 text-white text-xs font-semibold px-2 py-0.5 rounded">{formatDiscount(promo)}</span>
                    </div>
                    {promo.description && <p className="text-xs text-slate-600 line-clamp-2">{stripHtml(promo.description)}</p>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={handleApplyFoundPromo} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-all shadow-sm">
                    ✓ Tambahkan Promo
                  </button>
                  <button type="button" onClick={handleCancelFoundPromo} className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-lg transition-all">
                    Batal
                  </button>
                </div>
              </div>
            ))}

          {/* Promo List */}
          <div className="space-y-2">
            {!hasPromo || hasPromo.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center space-y-3 py-6">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                  <Tag className="w-7 h-7 text-slate-300" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-slate-600">Tidak Ada Promo Tersedia</h3>
                  <p className="text-xs text-slate-400 max-w-xs">Belum ada promo yang berlaku untuk pesanan Anda.</p>
                </div>
              </div>
            ) : (
              hasPromo?.map((promo, index) => {
                const isSelected = selectedPromo?.id === promo.id;
                const isExpanded = expandedPromo === promo.id;

                return (
                  <div key={index} className="rounded-lg border border-slate-200 bg-slate-50/50 opacity-75">
                    {/* Main Content */}
                    <div className="p-3">
                      {/* Top Row: Image, Title, Badge */}
                      <div className="relative flex items-center gap-3 mb-3">
                        {/* Image - Small with overlay */}
                        <div className="shrink-0 relative">
                          <div className="w-14 h-14 rounded-lg overflow-hidden ring-1 ring-slate-200">
                            {promo.image ? (
                              <img src={promo.image} alt={promo.name} className="w-full h-full object-cover grayscale" />
                            ) : (
                              <div className="w-full h-full bg-slate-400 flex items-center justify-center">
                                <Gift className="w-7 h-7 text-white" />
                              </div>
                            )}
                          </div>
                          {/* Mobile icon overlay */}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-slate-700 line-clamp-1 mb-0.5">{promo.name}</h3>
                          <h3 className="text-sm font-semibold text-slate-700 line-clamp-1 mb-0.5">{promo.isApplicable ? "applicable" : "unapplicable"}</h3>
                          {promo.description && <p className="text-xs text-slate-500 line-clamp-1">{stripHtml(promo.description)}</p>}
                        </div>

                        {/* Discount Badge - Muted */}
                        <span className="shrink-0 absolute top-0 right-0 bg-slate-400 text-white text-xs font-semibold px-2.5 py-1 rounded-md">{formatDiscount(promo)}</span>
                      </div>

                      {/* Bottom Row: Info only, no apply button */}
                      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                        <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs text-blue-700 font-medium flex-1">Tersedia di Mobile App</p>

                        {/* IMPORTANT, DISABLED OR COMMENT */}
                        <button type="button" onClick={() => handleSelectedPromo(isSelected ? null : promo)} className={`flex-1 text-xs md:text-sm font-medium py-2 px-3 rounded-lg transition-all cursor-pointer ${isSelected ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700" : "bg-slate-300 text-slate-700 hover:bg-slate-200"}`}>
                          {isSelected ? "✓ Aktif" : "Pilih Promo"}
                        </button>

                        {promo.terms && (
                          <button type="button" onClick={() => togglePromo(promo.id)} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all cursor-pointer ${isExpanded ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"}`}>
                            <OctagonAlert size={16} />
                            <span className="hidden sm:inline">S&K</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Terms - Compact */}
                    {isExpanded && promo.terms && (
                      <div className="border-t border-slate-200 bg-white px-3 py-2">
                        <div className="flex gap-2">
                          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-900 mb-1">Syarat & Ketentuan</p>
                            <div className="text-xs text-slate-700 prose prose-xs max-w-none overflow-hidden [overflow-wrap:anywhere] [&_*]:max-w-full [&_ul]:pl-4" dangerouslySetInnerHTML={{ __html: promo.terms }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* VOUCHERS TAB */
        <div className="space-y-3">
          {isLoadingVouchers ? (
            <div className="flex justify-center py-6">
              <SpinnerLoading />
            </div>
          ) : availableVouchers.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center space-y-3 py-6">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                <Gift className="w-7 h-7 text-slate-300" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-slate-600">Belum Ada Voucher</h3>
                <p className="text-xs text-slate-400 max-w-xs">Anda belum memiliki voucher aktif saat ini.</p>
              </div>
            </div>
          ) : (
            // DISABLED VOUCHER CASHBACK
            availableVouchers.map((voucher) => {
              const isSelected = selectedVoucher?.id === voucher.id;

              return (
                <div key={voucher.id} onClick={() => handleSelectVoucher(voucher)} className={`relative p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected ? "border-amber-400 bg-amber-50" : "border-slate-200 hover:border-amber-300 hover:bg-amber-50/30"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? "border-amber-500 bg-amber-500" : "border-slate-300"}`}>{isSelected && <Check className="w-3 h-3 text-white" />}</div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-bold text-amber-600">{formatRupiah(voucher.voucherAmount)}</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium truncate mt-0.5">{voucher.sourceTrip ? `Cashback trip: ${voucher.promo?.name}` : voucher.promo?.name || "Voucher Diskon"}</p>
                        {voucher.expiresAt && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="text-[10px] text-slate-500">Berlaku s.d. {dayjs(voucher.expiresAt).format("DD MMM YYYY")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })

            // AVAILABLE OR CLICKABLE VOUCHER
            // availableVouchers.map((voucher) => {
            //   const isSelected = selectedVoucher?.id === voucher.id;

            //   return (
            //     <div key={voucher.id} className="relative p-3 rounded-lg border border-slate-200 bg-slate-50/50 transition-all duration-200">
            //       {/* Disabled Badge */}
            //       <div className="absolute top-2 right-2 z-10">
            //         <div className="bg-slate-700 text-white px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
            //           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            //           </svg>
            //           <span className="text-[10px] font-medium">App Only</span>
            //         </div>
            //       </div>

            //       {/* Voucher Content - Visible but grayed out */}
            //       <div className="opacity-60 pointer-events-none select-none">
            //         <div className="flex items-start justify-between gap-3">
            //           <div className="flex items-center gap-3 flex-1 min-w-0">
            //             {/* Checkbox - Disabled State */}
            //             <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-slate-100 flex items-center justify-center flex-shrink-0">
            //               <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            //               </svg>
            //             </div>

            //             {/* Content */}
            //             <div className="flex-1 min-w-0">
            //               <div className="flex items-baseline gap-2">
            //                 <span className="text-sm font-bold text-slate-600">{formatRupiah(voucher.voucherAmount)}</span>
            //               </div>
            //               <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{voucher.sourceTrip ? `Cashback trip: ${voucher.promo?.name}` : voucher.promo?.name || "Voucher Diskon"}</p>
            //               {voucher.expiresAt && (
            //                 <div className="flex items-center gap-1 mt-1.5">
            //                   <Clock className="w-3 h-3 text-slate-400" />
            //                   <span className="text-[10px] text-slate-400">Berlaku s.d. {dayjs(voucher.expiresAt).format("DD MMM YYYY")}</span>
            //                 </div>
            //               )}
            //             </div>
            //           </div>
            //         </div>
            //       </div>

            //       {/* Bottom Info Strip */}
            //       <div className="mt-2 pt-2 border-t border-slate-200">
            //         <div className="flex items-center justify-center gap-1.5 text-slate-500">
            //           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            //           </svg>
            //           <span className="text-[10px] font-medium">Gunakan di Aplikasi Mobile</span>
            //         </div>
            //       </div>
            //     </div>
            //   );
            // })
          )}
        </div>
      )}

      {/* Info Note - Compact */}
      <div className="mt-3 flex gap-2 p-2.5 bg-slate-50 rounded-lg">
        <Info className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed">{activeTab === "promo" ? "Pilih satu promo untuk mendapatkan harga spesial." : "Gunakan voucher Anda untuk potongan harga tambahan."}</p>
      </div>
    </div>
  );
};

// Example usage component showing the complete layout
const ApplicablePromo: React.FC<PropsPromoBookingForm> = ({ tripId, date, participantCount, selectedPromo, selectedVoucher, userId, onSelectedPromo, onSelectedVoucher }) => {
  const { data, isLoading } = usePromos({ tripId, date, participantCount });

  if (isLoading) return <SpinnerLoading />;

  return (
    <div className="bg-gray-50">
      <div className="grid grid-cols-1 gap-5">
        <PromoSection tripId={tripId!} userId={userId} applicablePromos={data?.promos} selectedPromo={selectedPromo} selectedVoucher={selectedVoucher} participants={participantCount!} onSelectPromo={onSelectedPromo} onSelectVoucher={onSelectedVoucher} />
      </div>
    </div>
  );
};

export default PromoSection;
export { ApplicablePromo };
