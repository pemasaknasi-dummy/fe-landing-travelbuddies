import { payments } from "@/data/payment";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ChatAdmin } from "../sections/ChatAdmin";
import { SocialMediaBadge } from "../sections/SocialMediaBadge";

// SVG helper icons for premium native app store buttons
const GooglePlayIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor">
    <path d="M17.52 14.37L14.7 11.55l2.82-2.82 3.44 1.98c.8.46.8 1.22 0 1.68l-3.44 1.98zM3.44 1.97C3.16 2.27 3 2.72 3 3.29v17.42c0 .57.16 1.02.44 1.32L13.3 12.01 3.44 1.97zm10.74 8.78L4.67 2.65c.34-.14.75-.1 1.11.11l10.77 6.19-2.37 1.8zm0 2.52l2.37 1.8-10.77 6.19c-.36.21-.77.25-1.11.11l9.51-8.1z"/>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z"/>
  </svg>
);

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  // const adminPhone = "+6282258401785";
  const adminPhone = "+6281382471642";
  const waUrl = `https://wa.me/${adminPhone}`;

  return (
    <footer className="relative w-full bg-[#1B75BC] text-white pt-10 md:pt-12 pb-24 md:pb-10">
      <div className="max-w-[1024px] 2xl:max-w-[1440px] mx-auto px-5 xl:px-0">
        
        {/* Top Section: Links & Info */}
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-y-8 gap-x-4 md:gap-x-6 mb-8 md:mb-10">
          
          {/* Kolom 1: Brand, Address, Socials */}
          <div className="col-span-2 lg:col-span-4 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <Image 
                src={"/images/logo/travelbuddies-footer.png"} 
                alt="tb-logo" 
                height={100} 
                width={170} 
                className="object-contain" 
              />
            </div>
            
            <div>
              <h3 className="font-semibold text-[15px] md:text-lg mb-1.5 md:mb-2">Head Office</h3>
              <p className="text-[13px] md:text-sm text-blue-50 leading-relaxed max-w-sm">
                Travel Buddies, Jl. Pahlawan Revolusi No.8,<br />
                RT.9/RW.7, Pd. Bambu, Kec. Duren Sawit,<br />
                Kota Jakarta Timur, DKI Jakarta,<br />
                Kode Pos: 13440
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-[15px] md:text-lg mb-2.5 md:mb-3">Follow us on</h3>
              <div className="flex items-center gap-x-3 -ml-1">
                {/* Instagram */}
                <SocialMediaBadge
                  width={34}
                  height={34}
                  image="instagram"
                  link="https://www.instagram.com/travelbuddies_id"
                />

                {/* Tiktok */}
                <SocialMediaBadge width={28} height={28} image="tiktok" link="https://www.tiktok.com/@travelbuddiesid" />

                {/* Youtube */}
                <SocialMediaBadge
                  width={38}
                  height={38}
                  image="youtube"
                  link="https://www.youtube.com/@TravelBuddiesID"
                />

                {/* Facebook */}
                <SocialMediaBadge
                  width={30}
                  height={30}
                  image="facebook"
                  link="https://www.facebook.com/travelbuddiesindonesia"
                />
              </div>
            </div>
          </div>

          {/* Kolom 2: Layanan Kami */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="font-semibold text-[15px] md:text-lg mb-3 md:mb-4">Layanan Kami</h3>
            <ul className="space-y-2.5 md:space-y-3 text-[13px] md:text-sm text-blue-50">
              <li>
                <Link href={"/private-trip"} className="hover:text-white hover:underline transition block">
                  Private Trip
                </Link>
              </li>
              <li>
                <Link href={"/open-trip"} className="hover:text-white hover:underline transition block">
                  Open Trip
                </Link>
              </li>
              <li>
                <Link href={"/bisnis-trip"} className="hover:text-white hover:underline transition block">
                  Bisnis Trip
                </Link>
              </li>
              <li>
                <Link href={"/promo"} className="hover:text-white hover:underline transition block">
                  Promo
                </Link>
              </li>
              <li>
                <Link href={"/daftar-agent-b2b"} className="hover:text-white hover:underline transition block">
                  Daftar Agent
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Perusahaan */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="font-semibold text-[15px] md:text-lg mb-3 md:mb-4">Perusahaan</h3>
            <ul className="space-y-2.5 md:space-y-3 text-[13px] md:text-sm text-blue-50">
              <li>
                <Link href={"/tentang-kami"} className="hover:text-white hover:underline transition block">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href={"/blog"} className="hover:text-white hover:underline transition block">
                  Artikel
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Legal & Apps */}
          <div className="col-span-2 lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-6 md:gap-8 justify-between mt-2 md:mt-0">
            <div className="w-full sm:w-1/2 lg:w-full">
              <h3 className="font-semibold text-[15px] md:text-lg mb-3 md:mb-4">Bantuan & Legal</h3>
              <ul className="space-y-2.5 md:space-y-3 text-[13px] md:text-sm text-blue-50">
                <li>
                  <Link href={"/syarat-ketentuan"} className="hover:text-white hover:underline transition block">
                    Syarat & Ketentuan
                  </Link>
                </li>
                <li>
                  <Link href={"/kebijakan-privasi"} className="hover:text-white hover:underline transition block">
                    Kebijakan Privasi
                  </Link>
                </li>
                <li>
                  <Link href={"/account-deletion"} className="hover:text-white hover:underline transition block">
                    Kebijakan Hapus Akun
                  </Link>
                </li>
              </ul>
            </div>

            {/* App Download */}
            <div className="w-full sm:w-1/2 lg:w-full">
              <h3 className="font-semibold text-[15px] md:text-lg mb-3">Download App</h3>
              <div className="flex flex-row lg:flex-col gap-2 md:gap-3 w-full max-w-[320px] lg:max-w-[150px]">
                <Link
                  href={"https://play.google.com/store/apps/details?id=id.travelbuddies.app&hl=id"}
                  target="_blank"
                  className="flex-1 bg-black text-white px-2.5 py-2 md:px-3 md:py-2.5 rounded-lg flex items-center justify-center lg:justify-start gap-2 hover:bg-gray-800 transition shadow-md cursor-pointer"
                >
                  <GooglePlayIcon />
                  <div className="text-left leading-none">
                    <span className="text-[8px] md:text-[9px] block mb-0.5 text-gray-300">GET IT ON</span>
                    <span className="text-[11px] md:text-sm font-semibold block tracking-tight">Google Play</span>
                  </div>
                </Link>
                <Link
                  href={"https://apps.apple.com/id/app/travel-buddies/id6757420967"}
                  target="_blank"
                  className="flex-1 bg-black text-white px-2.5 py-2 md:px-3 md:py-2.5 rounded-lg flex items-center justify-center lg:justify-start gap-2 hover:bg-gray-800 transition shadow-md cursor-pointer"
                >
                  <AppleIcon />
                  <div className="text-left leading-none">
                    <span className="text-[8px] md:text-[9px] block mb-0.5 text-gray-300">Download on the</span>
                    <span className="text-[11px] md:text-sm font-semibold block tracking-tight">App Store</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Divider */}
        <hr className="border-blue-400 mb-6 md:mb-8 opacity-40" />

        {/* Bottom Section: Partners & Payments */}
        <div className="flex flex-col lg:flex-row justify-between gap-6 md:gap-8 mb-4">
          
          {/* Partners */}
          <div className="lg:w-1/3">
            <h3 className="font-semibold text-[13px] md:text-sm mb-2.5 md:mb-3">Official Partner</h3>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white rounded-md p-2 w-[100px] h-9 md:h-10 flex items-center justify-center shadow-sm">
                <Image 
                  src={"/wonderful-indonesia.png"} 
                  alt="wonderful-indonesia" 
                  width={100} 
                  height={50} 
                  className="max-h-full object-contain" 
                />
              </div>
              <div className="bg-white rounded-md p-2 w-[145px] h-9 md:h-10 flex items-center justify-center shadow-sm">
                <Image 
                  src={"/kemberin-row.png"} 
                  alt="kemberin" 
                  width={160} 
                  height={80} 
                  className="max-h-full object-contain" 
                />
              </div>
            </div>
          </div>

          {/* Payments */}
          <div className="lg:w-2/3">
            <h3 className="font-semibold text-[13px] md:text-sm mb-2.5 md:mb-3">Partner Pembayaran</h3>
            <div className="flex flex-wrap gap-1.5 md:gap-2 lg:max-w-[65%]">
              {payments.map((p, index) => (
                <div 
                  key={index} 
                  className="w-[45px] h-7 md:w-[52px] md:h-8 bg-white rounded-md flex items-center justify-center p-1 shadow-sm hover:scale-105 transition-transform duration-200"
                >
                  <Image
                    src={`/images/payment-method/${p}.png`}
                    alt={p}
                    width={40}
                    height={24}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="text-center text-[11px] md:text-xs text-blue-200 mt-6 md:mt-8 pt-5 md:pt-6 border-t border-blue-400 border-opacity-40">
          &copy; {year} Travel Buddies. All rights reserved.
        </div>

      </div>

      {/* CHAT ADMIN */}
      <ChatAdmin waUrl={waUrl} />
    </footer>
  );
};

export default Footer;
