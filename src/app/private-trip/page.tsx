"use client";

import { useState } from "react";
import {
  Send,
  ShieldCheck,
  Users,
  MapPin,
  Search,
  CheckCircle2,
  ChevronDown,
  Star,
  CalendarCheck,
} from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Date as DateInput } from "@/components/ui/Date";
import { PrivateTripBody } from "@/features/private-trip/api/private-trip-api";
import { usePrivateTripMutation } from "@/features/private-trip/hooks/usePrivateTrip";
import { Turnstile } from "@marsidev/react-turnstile";
import { FamillyCommunitySubmit } from "@/components/sections/FamilyCommunitySubmit";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useTrips } from "@/features/trips/hooks/useTrips";
import PrivateTripCard from "@/features/trips/components/PrivateTripCard";
import Skeleton from "react-loading-skeleton";

import "swiper/css";
import "swiper/css/pagination";

const testimonials = [
  {
    name: "Rina Kusuma",
    role: "Family Trip Participant",
    text: "Liburan keluarga besar ke Bali jadi bebas ribet karena pakai private trip dari Travel Buddies. Itinerary-nya santai, cocok buat bawa anak kecil dan orang tua. Sangat memuaskan!",
  },
  {
    name: "Dimas Aditya",
    role: "HR Manager - Corporate Gathering",
    text: "Mengadakan gathering kantor untuk 50 karyawan sangat mudah berkat tim Travel Buddies. Penanganan dari bandara sampai acara malam keakraban di Labuan Bajo sangat profesional.",
  },
  {
    name: "Sarah & Anton",
    role: "Honeymoon Trip",
    text: "Private trip honeymoon kami ke Sumba benar-benar romantis dan private. Tim Travel Buddies mengatur semuanya, dari hotel dengan view laut sampai kejutan dinner di pantai.",
  },
  {
    name: "Grup Alumni SMAN 3",
    role: "Reunion Group Tour",
    text: "Reunian sambil explore Belitung bareng teman lama. Karena ambil paket private trip di Travel Buddies, kita bebas nyanyi-nyanyi di bus dan ubah jadwal on the spot tanpa ganggu orang lain.",
  },
  {
    name: "Kevin Pratama",
    role: "Company Reward Trip",
    text: "Tahun ini perusahaan pakai jasa Travel Buddies buat trip reward ke Raja Ampat. Layanannya bintang 5, makanan di kapal enak semua. Pasti tahun depan pakai lagi.",
  },
];

const faqs = [
  {
    question: "Apakah bisa memilih tanggal sendiri?",
    answer:
      "Tentu saja! Keunggulan utama Private Trip adalah fleksibilitas. Anda bisa menentukan sendiri tanggal keberangkatan sesuai dengan jadwal libur Anda tanpa terikat jadwal rombongan lain.",
  },
  {
    question: "Minimal berapa peserta untuk Private Trip?",
    answer:
      "Sebagian besar paket Private Trip kami bisa diberangkatkan hanya dengan minimal 2 orang. Semakin banyak peserta dalam grup Anda, harga per orangnya akan semakin terjangkau.",
  },
  {
    question: "Apakah itinerary (jadwal perjalanan) bisa diubah?",
    answer:
      "Bisa. Kami menyediakan pilihan paket standar, namun Anda bebas mengajukan penyesuaian destinasi atau kegiatan dengan berdiskusi bersama Travel Consultant kami.",
  },
  {
    question: "Apakah harga yang tertera sudah termasuk hotel dan tiket pesawat?",
    answer:
      "Harga standar biasanya sudah mencakup akomodasi hotel (sesuai pilihan), transportasi lokal, makan, tiket masuk wisata, dan guide. Tiket pesawat dari kota asal belum termasuk, namun kami bisa membantu memesankannya jika Anda butuh.",
  },
];

export default function PrivateTripPage() {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
  } = useForm<PrivateTripBody>();

  const isLocal =
    process.env.NEXT_PUBLIC_API_URL === "http://localhost:3010/api";
  const { mutate: postPrivateTrip, isPending } = usePrivateTripMutation();
  const [isCaptchaDone, setIsCaptchaDone] = useState(false);

  // Fetch Private Trips (Trip Guarantee)
  const { data: privateTrips, isLoading: tripsLoading } = useTrips({
    isTripGuarantee: true,
    pageSize: 100, // Show all available private trips
  });

  const onVerify = (token: string | null) => {
    if (token !== null) {
      setIsCaptchaDone(true);
    } else {
      setIsCaptchaDone(false);
    }
  };

  const onSubmit: SubmitHandler<PrivateTripBody> = async (formData) => {
    const payload = {
      ...formData,
      totalParticipant: Number(formData?.totalParticipant),
      source: "Website",
    };

    postPrivateTrip(payload, {
      onSuccess: () => {
        setIsSubmit(true);
      },
    });
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>
      {isSubmit ? (
        <FamillyCommunitySubmit />
      ) : (
        <div className="bg-white text-gray-800 antialiased overflow-x-hidden">
          {/* Hero Section */}
          <section
            className="relative pt-32 pb-20 md:pt-40 md:pb-32 min-h-[70vh] flex items-center bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.8)), url('https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center w-full mt-4 sm:mt-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-white tracking-tight mb-4 sm:mb-6 leading-[1.2] max-w-4xl mx-auto">
                Private Trip Bebas Atur Jadwal &{" "}
                <span className="text-yellow-400">Destinasi</span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-200 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2 sm:px-4">
                Jelajahi ratusan destinasi favorit dengan jadwal fleksibel. Pilih
                paket yang tersedia atau konsultasikan kebutuhan perjalananmu
                bersama Travel Consultant kami.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 px-4 max-w-xl mx-auto">
                <a
                  href="#listing"
                  className="w-full sm:w-1/2 px-6 py-3.5 sm:py-4 bg-[#25A6DD] hover:bg-[#1e8bbd] text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-sm sm:text-base flex items-center justify-center"
                >
                  Cari Paket Trip
                </a>
                <a
                  href="#custom"
                  className="w-full sm:w-1/2 px-6 py-3.5 sm:py-4 bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 text-white font-bold rounded-full shadow-lg transition-all text-sm sm:text-base flex items-center justify-center"
                >
                  Request Custom Trip
                </a>
              </div>
            </div>
          </section>

          {/* Trip Listing Section */}
          <section id="listing" className="py-12 bg-gray-50 scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8 sm:mb-10 text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a] mb-2">
                  Private Trip Favorit Traveler
                </h2>
                <p className="text-sm sm:text-base text-gray-500">
                  Pilihan paket terbaik yang paling sering dipesan.
                </p>
              </div>

              {/* Grid for Packages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {tripsLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-gray-100 shadow-md overflow-hidden bg-white flex flex-col h-full"
                    >
                      <Skeleton height={230} className="w-full" />
                      <div className="p-5 flex flex-col flex-1 gap-3">
                        <Skeleton height={22} width="85%" />
                        <Skeleton height={14} width="55%" />
                        <div className="flex items-center gap-2 my-1">
                          <Skeleton height={16} width={40} />
                          <Skeleton height={12} width={120} />
                        </div>
                        <hr className="border-gray-100 my-1" />
                        <div className="space-y-1">
                          <Skeleton height={10} width={60} />
                          <Skeleton height={28} width={140} />
                        </div>
                        <Skeleton height={40} borderRadius={12} className="mt-2" />
                        <Skeleton height={40} borderRadius={12} className="mt-1" />
                      </div>
                    </div>
                  ))
                ) : privateTrips?.items?.length === 0 ? (
                  <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Belum ada trip tersedia
                    </h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">
                      Tenang, kamu masih bisa request custom trip melalui form
                      di bawah ini!
                    </p>
                  </div>
                ) : (
                  privateTrips?.items?.map((trip) => (
                    <PrivateTripCard
                      key={trip.id}
                      trip={trip}
                      baseUrl="/private-trip"
                    />
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Custom Inquiry Form Section */}
          <section id="custom" className="py-12 sm:py-16 md:py-24 bg-white border-t border-gray-100 scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-[#25A6DD] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
                
                {/* Left Content: Value Proposition */}
                <div className="lg:w-5/12 p-6 sm:p-8 md:p-14 text-white relative flex flex-col justify-center">
                  {/* Decor background */}
                  <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
                    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="absolute -top-20 -left-20 w-96 h-96 fill-white">
                      <path d="M42.8,-74.6C54.7,-68.1,63.2,-54.6,71.2,-41.2C79.2,-27.7,86.6,-13.9,86.9,0.2C87.2,14.2,80.3,28.4,71.5,40.9C62.7,53.4,51.9,64.2,39.1,72.1C26.3,80,11.6,85.1,-2.9,89.9C-17.4,94.7,-34.8,99.2,-48.9,93C-63,86.8,-73.8,70,-80.7,52.8C-87.6,35.6,-90.6,17.8,-88.9,1.1C-87.2,-15.6,-80.8,-31.2,-71.4,-44.6C-62,-58,-49.6,-69.2,-36.1,-74.7C-22.6,-80.2,-8.1,-80,6.1,-81.1C20.3,-82.2,30.9,-81.1,42.8,-74.6Z" transform="translate(100 100)" />
                    </svg>
                  </div>
                  
                  <div className="relative z-10">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 leading-tight">
                      Belum Menemukan Paket yang Cocok?
                    </h2>
                    <p className="text-blue-50 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 leading-relaxed">
                      Jangan khawatir. Ceritakan kebutuhan perjalananmu, tim Travel Consultant kami akan membantu menyusun itinerary terbaik sesuai budget dan preferensimu.
                    </p>
                    
                    <ul className="space-y-3 sm:space-y-4 font-medium text-sm sm:text-base">
                      <li className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-3 sm:mr-4 shrink-0" />
                        <span>Gratis Konsultasi</span>
                      </li>
                      <li className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-3 sm:mr-4 shrink-0" />
                        <span>Tanpa Biaya Tersembunyi</span>
                      </li>
                      <li className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-3 sm:mr-4 shrink-0" />
                        <span>Respon Cepat 1x24 Jam</span>
                      </li>
                      <li className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-3 sm:mr-4 shrink-0" />
                        <span>Itinerary Fleksibel Sesuai Kebutuhan</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Right Content: Form */}
                <div className="lg:w-7/12 bg-white p-6 sm:p-8 md:p-12">
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#0f172a] mb-2">
                      Rencanakan Trip Anda
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      Isi form di bawah ini dan konsultan kami akan menghubungi Anda melalui WhatsApp.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <fieldset className="space-y-4 sm:space-y-5" disabled={isPending}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 after:content-['*'] after:text-red-500">
                            Nama Lengkap
                          </label>
                          <input
                            type="text"
                            id="name"
                            className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#25A6DD] focus:border-[#25A6DD] outline-none transition-all bg-gray-50 focus:bg-white text-sm ${
                              errors?.name ? "border-red-500" : ""
                            }`}
                            placeholder="Masukkan nama Anda"
                            {...register("name", {
                              required: {
                                value: true,
                                message: "Nama wajib diisi",
                              },
                            })}
                          />
                          {errors?.name && (
                            <span className="text-red-500 text-xs mt-1 block">
                              {errors?.name?.message}
                            </span>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 after:content-['*'] after:text-red-500">
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#25A6DD] focus:border-[#25A6DD] outline-none transition-all bg-gray-50 focus:bg-white text-sm ${
                              errors?.email ? "border-red-500" : ""
                            }`}
                            placeholder="contoh@email.com"
                            {...register("email", {
                              required: {
                                value: true,
                                message: "Email wajib diisi",
                              },
                            })}
                          />
                          {errors?.email && (
                            <span className="text-red-500 text-xs mt-1 block">
                              {errors?.email?.message}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 after:content-['*'] after:text-red-500">
                            Nomor WhatsApp
                          </label>
                          <input
                            type="tel"
                            inputMode="numeric"
                            id="phone"
                            placeholder="081234567890"
                            maxLength={13}
                            className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#25A6DD] focus:border-[#25A6DD] outline-none transition-all bg-gray-50 focus:bg-white text-sm ${
                              errors?.phone ? "border-red-500" : ""
                            }`}
                            {...register("phone", {
                              required: "Nomor WhatsApp wajib diisi",
                              minLength: {
                                value: 10,
                                message: "Nomor terlalu pendek (minimal 10 digit)",
                              },
                              maxLength: {
                                value: 13,
                                message: "Nomor terlalu panjang (maksimal 13 digit)",
                              },
                              validate: (value) => {
                                const cleaned = value.replace(/\D/g, "");
                                if (!/^(08|628)/.test(cleaned)) {
                                  return "Nomor harus diawali dengan 08 atau 628";
                                }
                                const normalized = cleaned.startsWith("628")
                                  ? "0" + cleaned.slice(2)
                                  : cleaned;
                                const validPrefixes = [
                                  "0811", "0812", "0813", "0821", "0822", "0823", "0851", "0852", "0853",
                                  "0814", "0815", "0816", "0855", "0856", "0857", "0858", "0817", "0818",
                                  "0819", "0859", "0877", "0878", "0831", "0832", "0833", "0838", "0895",
                                  "0896", "0897", "0898", "0899", "0881", "0882", "0883", "0884", "0885",
                                  "0886", "0887", "0888", "0889",
                                ];
                                if (!validPrefixes.some((p) => normalized.startsWith(p))) {
                                  return "Nomor tidak dikenali sebagai provider Indonesia yang valid";
                                }
                                if (normalized.length < 10 || normalized.length > 13) {
                                  return "Panjang nomor tidak valid (10–13 digit)";
                                }
                                return true;
                              },
                              onChange: (e) => {
                                e.target.value = e.target.value.replace(/[^0-9]/g, "");
                              },
                            })}
                          />
                          {errors?.phone && (
                            <span className="text-red-500 text-xs mt-1 block">
                              {errors?.phone?.message}
                            </span>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 after:content-['*'] after:text-red-500">
                            Lokasi/Destinasi
                          </label>
                          <input
                            type="text"
                            id="destination"
                            className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#25A6DD] focus:border-[#25A6DD] outline-none transition-all bg-gray-50 focus:bg-white text-sm ${
                              errors?.destination ? "border-red-500" : ""
                            }`}
                            placeholder="Contoh: Bali, Labuan Bajo"
                            {...register("destination", {
                              required: {
                                value: true,
                                message: "Destinasi wajib diisi",
                              },
                            })}
                          />
                          {errors?.destination && (
                            <span className="text-red-500 text-xs mt-1 block">
                              {errors?.destination?.message}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 after:content-['*'] after:text-red-500">
                            Tanggal Berangkat
                          </label>
                          <DateInput
                            name="departDate"
                            placeholder="Pilih tanggal"
                            value={watch("departDate")}
                            setValue={setValue}
                            errors={errors?.departDate}
                            register={register}
                            validation={{
                              required: {
                                value: true,
                                message: "Tanggal keberangkatan wajib diisi",
                              },
                            }}
                            disabled={{ before: new Date() }}
                            fromYear={new Date().getFullYear()}
                            toYear={new Date().getFullYear() + 10}
                            className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#25A6DD] focus:border-[#25A6DD] outline-none transition-all bg-gray-50 focus:bg-white text-sm ${
                              errors?.departDate ? "border-red-500" : ""
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 after:content-['*'] after:text-red-500">
                            Durasi Trip
                          </label>
                          <select
                            id="days"
                            className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#25A6DD] focus:border-[#25A6DD] outline-none transition-all bg-gray-50 focus:bg-white text-sm text-gray-700 ${
                              errors?.days ? "border-red-500" : ""
                            }`}
                            {...register("days", {
                              valueAsNumber: true,
                              required: "Durasi trip wajib diisi",
                            })}
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Pilih durasi
                            </option>
                            <option value={1}>1 Hari (One Day)</option>
                            <option value={2}>2 Hari 1 Malam</option>
                            <option value={3}>3 Hari 2 Malam</option>
                            <option value={4}>4 Hari 3 Malam</option>
                            <option value={5}>&gt; 4 Hari</option>
                          </select>
                          {errors?.days && (
                            <span className="text-red-500 text-xs mt-1 block">
                              {errors?.days?.message}
                            </span>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                            Jumlah Peserta
                          </label>
                          <input
                            type="number"
                            id="totalParticipant"
                            min="2"
                            placeholder="Min. 2"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#25A6DD] focus:border-[#25A6DD] outline-none transition-all bg-gray-50 focus:bg-white text-sm"
                            {...register("totalParticipant")}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                          Catatan Tambahan (Opsional)
                        </label>
                        <textarea
                          id="note"
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#25A6DD] focus:border-[#25A6DD] outline-none transition-all bg-gray-50 focus:bg-white resize-none text-sm"
                          placeholder="Ceritakan destinasi spesifik, request hotel, atau preferensi lainnya..."
                          {...register("note")}
                        ></textarea>
                      </div>

                      <Turnstile
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
                        onSuccess={onVerify}
                        options={{
                          action: "submit-form",
                          theme: "light",
                          size: "normal",
                          language: "en",
                        }}
                        scriptOptions={{
                          appendTo: "body",
                        }}
                      />

                      <button
                        type="submit"
                        disabled={!isCaptchaDone && !isLocal}
                        className="w-full py-3.5 sm:py-4 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center cursor-pointer text-sm sm:text-base disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        {isPending ? "Mengirim Data..." : "Konsultasi Private Trip Sekarang"}
                      </button>
                    </fieldset>
                  </form>
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Travel Buddies / Stats Section */}
          <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#0f172a] mb-2 sm:mb-3">
                  Mengapa Memilih Travel Buddies?
                </h2>
                <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
                  Kami memberikan pengalaman liburan yang aman, nyaman, dan tak terlupakan.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto bg-[#e0f4fc] text-[#25A6DD] rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4">
                    <Users className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0f172a] mb-1">
                    12.000+
                  </h3>
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wider">
                    Traveler
                  </p>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto bg-orange-50 text-[#f97316] rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4">
                    <MapPin className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0f172a] mb-1">
                    105+
                  </h3>
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wider">
                    Destinasi
                  </p>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto bg-green-50 text-green-500 rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4">
                    <CalendarCheck className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0f172a] mb-1">
                    11+
                  </h3>
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wider">
                    Tahun Pengalaman
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Berpengalaman sejak 2015</p>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonial Section */}
          <section className="py-12 sm:py-16 md:py-24 bg-white overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#0f172a] mb-2 sm:mb-4">
                  Cerita Perjalanan Mereka
                </h2>
                <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
                  Pengalaman tak terlupakan dari para traveler yang telah mempercayakan private trip mereka kepada Travel Buddies.
                </p>
              </div>

              <Swiper
                modules={[Autoplay]}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                spaceBetween={24}
                slidesPerView={1}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
                className="pb-8 pt-4"
              >
                {testimonials.map((item, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="bg-white mb-5 mx-1 p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col transition-transform duration-300 hover:-translate-y-1">
                      <div className="flex text-yellow-400 text-[10px] sm:text-xs mb-3 sm:mb-4 gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                        <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                        <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                        <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                        <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base italic mb-4 sm:mb-6 flex-grow leading-relaxed">
                        &quot;{item.text}&quot;
                      </p>
                      <div className="pt-4 border-t border-gray-50 mt-auto">
                        <h4 className="font-bold text-[#0f172a] text-sm sm:text-base">
                          {item.name}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-[#25A6DD] font-medium mt-0.5">
                          {item.role}
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-12 sm:py-16 md:py-24 bg-gray-50 border-t border-gray-100">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#0f172a] mb-2 sm:mb-4">
                  Pertanyaan Seputar Private Trip
                </h2>
                <p className="text-sm sm:text-base text-gray-500">
                  Hal-hal yang sering ditanyakan sebelum merencanakan liburan.
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {faqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div
                      key={index}
                      className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer transition-all"
                      onClick={() => toggleFaq(index)}
                    >
                      <div className="flex justify-between items-center font-bold text-[#0f172a] text-sm sm:text-base">
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-[#25A6DD] shrink-0 transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                      {isOpen && (
                        <p className="text-gray-500 mt-4 leading-relaxed text-sm sm:text-base border-t border-gray-50 pt-3">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
