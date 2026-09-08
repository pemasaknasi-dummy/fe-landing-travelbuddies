"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Download, Loader2, CheckCircle2, Calendar, MapPin } from "lucide-react";
import dayjs from "dayjs";

interface EventAgentData {
  id: number;
  registrationNumber: string;
  name: string;
  travel: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  agentStatus: string;
  createdAt: string;
}

export default function DownloadPdfPage({
  params,
}: {
  params: Promise<{ registrationNumber: string }>;
}) {
  const resolvedParams = React.use(params);
  const registrationNumber = resolvedParams.registrationNumber;

  const [agentData, setAgentData] = useState<EventAgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAgentData = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
        const response = await fetch(`${cleanBaseUrl}/event-agent/${registrationNumber}`);

        if (!response.ok) {
          throw new Error("Data registrasi tidak ditemukan");
        }

        const data = await response.json();
        if (isMounted) {
          setAgentData(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || "Gagal memuat data registrasi");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAgentData();

    return () => {
      isMounted = false;
    };
  }, [registrationNumber]);

  const handleDownloadPdfFile = async () => {
    try {
      setDownloading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
      const response = await fetch(`${cleanBaseUrl}/event-agent/${registrationNumber}/pdf`);

      if (!response.ok) {
        throw new Error("Gagal mengunduh dokumen PDF");
      }

      const blob = await response.blob();
      const createdUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = createdUrl;
      a.download = `Registrasi-${registrationNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(createdUrl);
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Gagal mengunduh PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-800 font-sans flex flex-col selection:bg-sky-100 selection:text-sky-900">
      {/* Top Navbar */}
      <header className="bg-[#0c4a6e] text-white px-4 md:px-8 py-4 flex items-center justify-between shadow-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/eventagent"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-sm"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline font-medium">Kembali</span>
          </Link>
          <div className="border-l border-white/20 h-6 mx-1 hidden sm:block"></div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white leading-tight">
              Bukti Registrasi Event
            </h1>
            <p className="text-xs text-sky-200 font-mono tracking-tight">{registrationNumber}</p>
          </div>
        </div>

        <div>
          <button
            onClick={handleDownloadPdfFile}
            disabled={downloading || loading || Boolean(error)}
            className="bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-xl shadow transition-all duration-200 flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
          >
            {downloading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <Download size={16} />
            )}
            <span>Unduh PDF</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
            <Loader2 className="animate-spin h-8 w-8 text-sky-600" />
            <p className="text-sm font-medium">Memuat data registrasi...</p>
          </div>
        ) : error || !agentData ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center shadow-sm">
            <p className="text-lg font-bold text-red-600 mb-2">Data Tidak Ditemukan</p>
            <p className="text-sm text-gray-600 mb-6">{error || "Silakan lakukan registrasi terlebih dahulu."}</p>
            <Link
              href="/eventagent"
              className="inline-block bg-[#0c4a6e] hover:bg-sky-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              Kembali ke Form Registrasi
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Ticket Card Container */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden transition-all">
              {/* Header Banner */}
              <div className="bg-[#0c4a6e] text-white p-6 relative overflow-hidden text-center">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid-pdf" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-pdf)" />
                  </svg>
                </div>

                <div className="relative z-10 space-y-2">
                  <div className="flex justify-center mb-2">
                    <Image
                      src="/images/eventagent/tb-logo.png"
                      alt="Travel Buddies Logo"
                      width={140}
                      height={35}
                      className="h-8 w-auto object-contain"
                      priority
                    />
                  </div>
                  <h2 className="text-xl font-extrabold tracking-wide uppercase">
                    Bukti Registrasi Event
                  </h2>
                  <p className="text-xs text-sky-200 font-medium max-w-sm mx-auto">
                    Beyond Travel Digital Transformation for Sustainable Growth
                  </p>

                  <div className="pt-2">
                    <span className="inline-block bg-white/15 border border-white/30 text-white font-mono font-black text-lg px-4 py-1.5 rounded-full tracking-wider shadow-inner">
                      {agentData.registrationNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Participant Details Body */}
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-3">
                    Data Peserta
                  </h3>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center py-1 border-b border-gray-200/60 gap-1">
                      <span className="text-gray-500 text-xs uppercase font-semibold">Nama Lengkap</span>
                      <span className="font-bold text-gray-900">{agentData.name}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between sm:items-center py-1 border-b border-gray-200/60 gap-1">
                      <span className="text-gray-500 text-xs uppercase font-semibold">Travel / Perusahaan</span>
                      <span className="font-semibold text-gray-800">{agentData.travel}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between sm:items-center py-1 border-b border-gray-200/60 gap-1">
                      <span className="text-gray-500 text-xs uppercase font-semibold">Nomor WhatsApp</span>
                      <span className="font-medium text-gray-900">{agentData.phone}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between sm:items-center py-1 border-b border-gray-200/60 gap-1">
                      <span className="text-gray-500 text-xs uppercase font-semibold">Status Agent</span>
                      <span className="font-semibold text-sky-700">{agentData.agentStatus}</span>
                    </div>

                    {agentData.email && (
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center py-1 border-b border-gray-200/60 gap-1">
                        <span className="text-gray-500 text-xs uppercase font-semibold">Email</span>
                        <span className="font-medium text-gray-900">{agentData.email}</span>
                      </div>
                    )}

                    {agentData.city && (
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center py-1 gap-1">
                        <span className="text-gray-500 text-xs uppercase font-semibold">Kota</span>
                        <span className="font-medium text-gray-900">{agentData.city}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Details Card */}
                <div>
                  <h3 className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-3">
                    Detail Acara
                  </h3>
                  <div className="bg-gradient-to-br from-sky-50 to-sky-100/50 border border-sky-200 rounded-xl p-4 space-y-2 text-sm text-sky-900">
                    <h4 className="font-extrabold text-base text-[#0c4a6e]">Beyond Travel Event 2026</h4>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-sky-800">
                      <Calendar size={16} className="text-sky-600 flex-shrink-0" />
                      <span><strong>Tanggal:</strong> Kamis, 30 Juli 2026</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-sky-800">
                      <MapPin size={16} className="text-sky-600 flex-shrink-0" />
                      <span><strong>Lokasi:</strong> Luwe&apos;s Coffee & Eatery</span>
                    </div>
                  </div>
                </div>

                {/* Footer status indicator */}
                <div className="pt-2 text-center border-t border-gray-100 flex flex-col items-center gap-2">
                  <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700 gap-1.5">
                    <CheckCircle2 size={15} className="text-green-600" />
                    Terdaftar Resmi
                  </span>
                  <p className="text-xs text-gray-500">
                    Silakan tunjukkan halaman ini / No. Registrasi kepada panitia pada saat acara.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleDownloadPdfFile}
                disabled={downloading}
                className="w-full bg-[#0c4a6e] hover:bg-sky-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-base cursor-pointer"
              >
                {downloading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Memproses PDF...</span>
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    <span>Unduh File PDF</span>
                  </>
                )}
              </button>

              <Link
                href="/eventagent"
                className="block text-center text-sky-600 hover:text-sky-800 font-semibold text-sm py-2 transition-colors"
              >
                Kembali ke Halaman Utama
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
