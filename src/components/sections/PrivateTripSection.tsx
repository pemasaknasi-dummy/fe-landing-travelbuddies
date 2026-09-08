"use client";

import { Plane, Heart, Users, Building2, ArrowRight, Sparkles, MapPin, Calendar, MapPinned, MessageSquareText } from "lucide-react";
import Link from "next/link";

export default function PrivateTripSection() {
  const tripTypes = [
    { icon: Building2, label: "Company Gathering/Outing", color: "bg-blue-500" },
    { icon: Users, label: "Family Trip", color: "bg-green-500" },
    { icon: Heart, label: "Wedding/Honeymoon Trip", color: "bg-pink-500" },
    { icon: Plane, label: "Komunitas/Group Trip", color: "bg-purple-500" },
  ];

  return (
    <div className="relative xl:overflow-visible py-10 xl:max-w-[1024px] 2xl:max-w-[1440px] mx-auto">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96  rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>

      <div className="relative xl:max-w-[1024px] 2xl:max-w-[1440px] mx-auto px-5 xl:px-0">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl 2xl:text-5xl font-bold text-gray-900 leading-tight">
                Private Trip untuk setiap
                <span className="block text-transparent bg-clip-text bg-linear-to-r from-cyan-500 via-blue-600 to-purple-600">Momen Spesial</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Program perjalanan eksklusif yang dirancang khusus sesuai kebutuhan Anda, mulai dari keluarga, perusahaan, hingga komunitas. Lebih
                fleksibel, lebih personal, dan bebas menentukan destinasi, itinerary, serta pengalaman yang diinginkan
              </p>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <MessageSquareText className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700">Konsultasi gratis, respon cepat</span>
              </div>
            </div>

            {/* Trip Types */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Cocok untuk:</p>
              <div className="grid grid-cols-2 gap-3">
                {tripTypes.map((type, index) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 min-w-0"
                    >
                      <div className={`${type.color} p-2 rounded-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="flex-1 min-w-0 font-medium text-gray-700 whitespace-normal break-words">{type.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link
                href="/private-trip"
                className="group cursor-pointer relative inline-flex items-center gap-3 bg-linear-to-r from-cyan-500 to-blue-600  text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <span className="absolute inset-0 bg-linear-to-r  from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative">Rencanakan Trip Sekarang</span>
                <ArrowRight className="relative w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            {/* Main Image Card */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <img src="/images/private-trip/karimun-jawa-trip.jpeg" alt="Private Trip" className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
            </div>

            {/* Floating Stats Cards */}
            {/* <div className="absolute -top-6 left-0 lg:-left-6 bg-white rounded-2xl shadow-xl p-4 animate-float">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <Sparkles className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">2000+</p>
                  <p className="text-sm text-gray-500">Happy Travelers</p>
                </div>
              </div>
            </div> */}

            <div className="absolute -bottom-6 right-0 lg:-right-6 bg-white rounded-2xl shadow-xl p-4 animate-float delay-300">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-xl">
                  <MapPinned className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">100+</p>
                  <p className="text-sm text-gray-500">Destinasi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        .delay-700 {
          animation-delay: 0.7s;
        }
      `}</style>
    </div>
  );
}
