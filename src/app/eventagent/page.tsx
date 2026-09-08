"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { httpClient } from "@/lib/api/http-client";

interface RegisteredData {
  id: number;
  registrationNumber: string;
  name: string;
  travel: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  agentStatus: string;
}

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error" | "info";
}

export default function EventAgentFormPage() {
  const [formData, setFormData] = useState({
    name: "",
    travel: "",
    phone: "",
    email: "",
    city: "",
    agentStatus: "Sudah Menjadi Agent Travel Buddies",
  });

  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<RegisteredData | null>(null);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "success",
  });

  const showToastNotification = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanVal = e.target.value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({ ...prev, phone: cleanVal }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.travel.trim() || !formData.phone.trim()) {
      showToastNotification("Mohon lengkapi data wajib (*)", "error");
      return;
    }

    if (formData.phone.trim().length < 9) {
      showToastNotification("Nomor WhatsApp tidak valid", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await httpClient.post<{
        message: string;
        isExisting: boolean;
        data: RegisteredData;
      }>("/event-agent", {
        name: formData.name.trim(),
        travel: formData.travel.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        city: formData.city.trim() || null,
        agentStatus: formData.agentStatus,
      });

      setSubmittedData(res.data);
      setIsExistingUser(res.isExisting);

      if (res.isExisting) {
        showToastNotification("Nomor Anda sudah terdaftar", "info");
      } else {
        showToastNotification("Registrasi Berhasil!", "success");
      }
    } catch (err: any) {
      console.error(err);
      const errMessage =
        err?.response?.data?.error || "Gagal melakukan registrasi. Silakan coba lagi.";
      showToastNotification(errMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!submittedData) return;
    window.open(`/eventagent/${submittedData.registrationNumber}/download`, "_blank");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      travel: "",
      phone: "",
      email: "",
      city: "",
      agentStatus: "Sudah Menjadi Agent Travel Buddies",
    });
    setSubmittedData(null);
    setIsExistingUser(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 w-full text-gray-800 selection:bg-sky-100 selection:text-sky-900 font-sans">
      {/* Header */}
      <header className="bg-[#0c4a6e] pt-8 pb-32 relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid2" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid2)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10 flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/images/eventagent/tb-logo.png"
              alt="Travel Buddies Logo"
              width={160}
              height={40}
              className="h-8 md:h-10 w-auto object-contain"
              priority
            />
          </div>
          {/* Button Back to QR Display */}
          {/* <Link
            href="/eventagent/qr"
            className="text-white/80 hover:text-white text-sm flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Halaman QR
          </Link> */}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow container mx-auto px-4 md:px-8 relative z-20 -mt-24 mb-20">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden transition-all duration-500">
          {!submittedData ? (
            /* FORM SECTION */
            <div className="p-6 md:p-10 animate-fade-in">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Form Registrasi</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Silakan lengkapi data diri Anda untuk menghadiri event.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nama Lengkap */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                    placeholder="Contoh: Budi Santoso"
                  />
                </div>

                {/* Nama Travel / Perusahaan */}
                <div>
                  <label htmlFor="travel" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Nama Travel / Perusahaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="travel"
                    required
                    value={formData.travel}
                    onChange={(e) => setFormData({ ...formData, travel: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                    placeholder="Contoh: Budi Travel Tour"
                  />
                </div>

                {/* Nomor WhatsApp */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Nomor WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                    placeholder="Contoh: 081234567890"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                    placeholder="budi@example.com"
                  />
                </div>

                {/* Kota */}
                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Kota
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                    placeholder="Contoh: Jakarta"
                  />
                </div>

                {/* Status Agent */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Status Agent
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className={`relative flex items-start p-4 cursor-pointer rounded-xl border transition-colors shadow-sm ${formData.agentStatus === "Sudah Menjadi Agent Travel Buddies"
                      ? "border-sky-500 bg-sky-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}>
                      <div className="flex items-center h-5">
                        <input
                          type="radio"
                          name="agentStatus"
                          value="Sudah Menjadi Agent Travel Buddies"
                          checked={formData.agentStatus === "Sudah Menjadi Agent Travel Buddies"}
                          onChange={(e) => setFormData({ ...formData, agentStatus: e.target.value })}
                          className="w-4 h-4 text-sky-600 border-gray-300 focus:ring-sky-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <span className="font-medium text-gray-900 block">Sudah Menjadi Agent</span>
                        <span className="text-gray-500 text-xs">Terdaftar di Travel Buddies</span>
                      </div>
                    </label>

                    <label className={`relative flex items-start p-4 cursor-pointer rounded-xl border transition-colors shadow-sm ${formData.agentStatus === "Belum Menjadi Agent"
                      ? "border-sky-500 bg-sky-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}>
                      <div className="flex items-center h-5">
                        <input
                          type="radio"
                          name="agentStatus"
                          value="Belum Menjadi Agent"
                          checked={formData.agentStatus === "Belum Menjadi Agent"}
                          onChange={(e) => setFormData({ ...formData, agentStatus: e.target.value })}
                          className="w-4 h-4 text-sky-600 border-gray-300 focus:ring-sky-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <span className="font-medium text-gray-900 block">Belum Menjadi Agent</span>
                        <span className="text-gray-500 text-xs">Peserta umum / baru</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer w-full bg-[#0c4a6e] hover:bg-sky-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Memproses...
                      </span>
                    ) : (
                      <>
                        Daftar Sekarang
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* SUCCESS / ALREADY REGISTERED SECTION */
            <div className="p-8 md:p-10 flex flex-col items-center text-center animate-slideUp">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2
                className={`text-3xl font-extrabold mb-3 ${isExistingUser ? "text-sky-700" : "text-gray-900"
                  }`}
              >
                {isExistingUser ? "Anda Sudah Terdaftar" : "Registrasi Berhasil"}
              </h2>

              <p className="text-gray-600 max-w-md mx-auto mb-8 text-sm md:text-base leading-relaxed">
                {isExistingUser
                  ? "Data Anda sudah tersimpan sebelumnya. Silakan tunjukkan halaman ini kepada panitia sebagai bukti kehadiran Anda."
                  : "Terima kasih telah melakukan registrasi. Silakan tunjukkan halaman ini kepada panitia sebagai bukti kehadiran Anda."}
              </p>

              {/* Ticket Card */}
              <div className="w-full bg-gradient-to-br from-sky-50 via-white to-sky-50/50 border border-sky-100 rounded-2xl p-6 shadow-sm relative overflow-hidden text-left">
                {/* Visual accents */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-sky-100 rounded-full opacity-50 blur-xl"></div>
                <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-amber-500/20 rounded-full opacity-30 blur-xl"></div>

                <div className="relative z-10 space-y-5">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-xs text-sky-600 uppercase tracking-wider font-bold mb-1">
                        Nama Peserta
                      </p>
                      <p className="text-xl font-bold text-gray-900 break-words">
                        {submittedData.name}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-sky-600 uppercase tracking-wider font-bold mb-1">
                        No. Registrasi
                      </p>
                      <p className="text-xl font-black text-[#0c4a6e] font-mono tracking-tight">
                        {submittedData.registrationNumber}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-sky-600 uppercase tracking-wider font-bold mb-1">
                      Nama Travel / Perusahaan
                    </p>
                    <p className="text-lg font-medium text-gray-800 break-words">
                      {submittedData.travel}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-sky-200/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
                        Status
                      </p>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        Berhasil Terdaftar
                      </span>
                    </div>

                    {/* Dummy Barcode */}
                    <div className="flex gap-1 h-8 items-center opacity-40">
                      <div className="w-1 h-full bg-black"></div>
                      <div className="w-2 h-full bg-black"></div>
                      <div className="w-1 h-full bg-black"></div>
                      <div className="w-3 h-full bg-black"></div>
                      <div className="w-1 h-full bg-black"></div>
                      <div className="w-2 h-full bg-black"></div>
                      <div className="w-1 h-full bg-black"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                <button
                  onClick={handleDownloadPdf}
                  className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Unduh Bukti Registrasi (PDF)
                </button>
              </div>

              <button
                onClick={resetForm}
                className="mt-6 text-sky-600 hover:text-sky-800 font-medium text-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke Form Registrasi
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">&copy; 2026 Travel Buddies. All rights reserved.</p>
        </div>
      </footer>

      {/* Toast Notification */}
      <div
        className={`fixed bottom-6 right-6 transform transition-all duration-300 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl z-50 pointer-events-none ${toast.show ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
          } ${toast.type === "error"
            ? "bg-red-600 text-white"
            : toast.type === "info"
              ? "bg-sky-600 text-white"
              : "bg-gray-900 text-white"
          }`}
      >
        <div>
          {toast.type === "error" ? (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : toast.type === "info" ? (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <span className="font-medium text-sm">{toast.message}</span>
      </div>
    </div>
  );
}
