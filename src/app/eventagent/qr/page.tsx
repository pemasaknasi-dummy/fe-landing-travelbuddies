"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function EventAgentQrPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const copyLink = () => {
    const linkText = typeof window !== "undefined"
      ? `${window.location.origin}/eventagent`
      : "https://travelbuddies.co.id/eventagent";

    navigator.clipboard
      .writeText(linkText)
      .then(() => {
        showToast("Link berhasil disalin!");
      })
      .catch(() => {
        showToast("Gagal menyalin link.");
      });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="w-full min-h-screen lg:h-screen flex overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-white text-gray-800 font-sans selection:bg-sky-100 selection:text-sky-900">
      <div className="flex flex-col lg:flex-row w-full h-full min-h-screen">
        {/* Left Panel: Event Information */}
        <div className="lg:w-1/2 text-white flex flex-col justify-between px-8 py-10 lg:px-16 lg:py-12 xl:px-24 xl:py-16 relative overflow-hidden h-full min-h-[500px] lg:min-h-0">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/eventagent/bg-left.jpg"
              alt="Background Event"
              fill
              className="object-cover object-center brightness-105 contrast-105"
              priority
            />
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between max-w-xl mx-auto lg:mx-0">
            {/* Header Logo */}
            <div className="flex items-center">
              <Image
                src="/images/eventagent/tb-logo.png"
                alt="Travel Buddies Logo"
                width={180}
                height={50}
                className="h-10 lg:h-14 w-auto object-contain drop-shadow-[0_2px_12px_rgba(12,74,110,0.6)]"
                priority
              />
            </div>

            {/* Event Title Glassmorphism Card Frame */}
            <div className="bg-[#0c4a6e]/50 backdrop-blur-xl border border-white/25 rounded-3xl p-6 lg:p-8 shadow-2xl shadow-[#0c4a6e]/40 space-y-4 lg:space-y-5 my-auto max-w-xl">
              <div className="inline-block px-3.5 py-1 rounded-full bg-[#0c4a6e]/60 border border-sky-500/40 text-cyan-300 font-bold text-xs lg:text-sm tracking-wider uppercase backdrop-blur-md self-start">
                Registrasi Event
              </div>
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-tight">
                Beyond Travel <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-cyan-300">
                  Digital Transformation
                </span>
              </h1>
              <p className="text-base lg:text-lg text-sky-100 font-medium leading-relaxed">
                for Sustainable Growth
              </p>
            </div>

            {/* Footer Event Info */}
            <div className="space-y-3 lg:space-y-4 mt-6 lg:mt-0">
              <div className="flex items-center gap-3.5 text-white text-base lg:text-lg font-semibold bg-[#0c4a6e]/45 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 w-fit shadow-md shadow-[#0c4a6e]/20">
                <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-sky-900/80 flex items-center justify-center flex-shrink-0 shadow">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span>Kamis, 30 Juli 2026</span>
              </div>
              <div className="flex items-center gap-3.5 text-white text-base lg:text-lg font-semibold bg-[#0c4a6e]/45 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 w-fit shadow-md shadow-[#0c4a6e]/20">
                <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-sky-900/80 flex items-center justify-center flex-shrink-0 shadow">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span>Luwe&apos;s Coffee & Eatery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: QR Code & Link */}
        <div className="lg:w-1/2 bg-gray-50 flex flex-col items-center justify-between px-6 py-8 lg:px-12 lg:py-8 xl:px-16 xl:py-10 relative overflow-hidden h-full">
          <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-between h-full my-auto py-2">
            {/* Top Header Text */}
            <div className="text-center mb-4 lg:mb-6">
              <h2 className="text-2xl lg:text-3xl xl:text-4xl font-extrabold text-gray-900 mb-1">
                Scan untuk presensi kehadiran & Undian
              </h2>
              <p className="text-gray-500 text-sm lg:text-base">
                Gunakan kamera HP Anda untuk scan QR Code
              </p>
            </div>

            {/* Large QR Code Display Box (Links to Form) */}
            <Link
              href="/eventagent"
              title="Klik untuk simulasi buka form registrasi"
              className="bg-white p-6 lg:p-8 rounded-[2rem] border border-gray-200 my-auto group relative transform transition-transform hover:scale-105 duration-500 flex items-center justify-center cursor-pointer block shadow-sm hover:shadow-md"
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${window.location.origin}/eventagent&margin=0`}
                alt="QR Code Registrasi"
                className="w-60 h-60 lg:w-80 lg:h-80 xl:w-96 xl:h-96 max-h-[45vh] max-w-[45vh] object-contain"
              />
            </Link>

            {/* Alternative Link Section */}
            <div className="w-full mt-4 lg:mt-6">
              <div className="flex items-center mb-3">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink-0 mx-3 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Atau akses link berikut
                </span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <button
                onClick={copyLink}
                className="w-full group bg-white border border-sky-200 hover:border-sky-500 rounded-xl py-3 px-4 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center cursor-pointer"
              >
                <p className="text-sm sm:text-base lg:text-lg font-bold text-[#0c4a6e] tracking-normal group-hover:text-sky-600 transition-colors text-center break-all">
                  {window.location.origin}/eventagent
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <div
        className={`fixed bottom-6 left-6 transform transition-all duration-300 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl z-50 pointer-events-none bg-gray-900 ${toastMessage ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
          }`}
      >
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium text-sm text-white">{toastMessage}</span>
      </div>
    </div>
  );
}
