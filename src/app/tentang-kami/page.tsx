import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AppPromotion from "@/components/sections/AppPromotion";
import {
  Building,
  Check,
  Eye,
  Rocket,
  Target,
  Users,
  Lock,
  Briefcase,
  ArrowRight,
  MapPin,
  Tag,
  UserCheck,
  Layers,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Kisah Kami | Travel Buddies - Biro Perjalanan Wisata Tepercaya",
  description:
    "Mengenal lebih dekat Travel Buddies, biro perjalanan wisata (Tour & Travel) tepercaya di Indonesia sejak 2015. Menyediakan layanan Open Trip, Private Trip, dan Perjalanan Dinas (Corporate Travel B2B).",
  keywords: [
    "tour and travel jakarta",
    "biro perjalanan wisata",
    "agen travel terpercaya",
    "open trip indonesia",
    "private trip",
    "perjalanan dinas B2B",
    "corporate travel management",
    "travel buddies",
  ],
};

export default function TentangKami() {
  const adminPhone = "+6282258401785";

  return (
    <main className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section
        className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-5 overflow-hidden flex items-center justify-center text-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(11, 35, 71, 0.75), rgba(11, 35, 71, 0.85)), url('https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-4xl mx-auto z-10">
          <span className="inline-block py-1.5 px-4 rounded-full bg-[#FF7A00] text-white text-xs md:text-sm font-bold tracking-widest mb-6 shadow-lg shadow-orange-500/30">
            TENTANG KAMI
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            Partner Perjalanan Tepercaya untuk Liburan & Bisnis di{" "}
            <span className="text-blue-400">Indonesia</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-10 font-light max-w-2xl mx-auto">
            Lebih dari sekadar biro perjalanan,{" "}
            <strong className="text-white">Travel Buddies</strong> hadir sebagai{" "}
            <span className="font-semibold text-blue-400">#YourBestTravelMate</span> untuk
            setiap momen yang tak terlupakan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <a
              href={`https://wa.me/${adminPhone}?text=Halo%20Travel%20Buddies,%20saya%20ingin%20tanya%20tentang%20layanan%20trip.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#FF7A00] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/50 hover:-translate-y-0.5"
            >
              Mulai Konsultasi Gratis
            </a>
            <a
              href="#produk"
              className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-[#0B2347] transition-all"
            >
              Pilih Layanan Anda
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-300 font-medium">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm">
              <Building className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/40 backdrop-blur-sm border border-white/10">
              <Check className="w-4 h-4 text-white" />
            </div>
            <p>
              Dipercaya oleh{" "}
              <strong className="text-white">50+ Instansi BUMN & Multinasional</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Kisah Kami Section */}
      <section className="py-20 bg-white" id="kisah-kami">
        <div className="max-w-[1024px] 2xl:max-w-[1440px] mx-auto px-5 xl:px-0">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 w-full">
              <div className="relative">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Tim Travel Buddies merancang paket wisata dan perjalanan dinas"
                  width={800}
                  height={450}
                  className="rounded-2xl shadow-2xl object-cover h-[450px] w-full border-b-8 border-[#FF7A00]"
                />
                <div className="absolute -bottom-6 -right-6 bg-[#FF7A00] text-white p-6 rounded-2xl shadow-xl hidden md:block">
                  <p className="text-4xl font-bold">11+</p>
                  <p className="text-sm font-medium">Tahun Pengalaman</p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 w-full">
              <span className="text-sm font-bold text-[#1B75BC] uppercase tracking-widest mb-2 block">
                Sebuah Awal Mula
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0B2347] mb-6 leading-snug">
                Berawal dari Cinta pada Pesona Nusantara
              </h2>

              <div className="space-y-4 text-slate-600 leading-relaxed text-base md:text-lg mb-8">
                <p>
                  Setiap perjalanan hebat selalu memiliki cerita di baliknya. Cerita kami
                  dimulai pada tahun 2015, lahir dari sebuah mimpi sederhana:{" "}
                  <strong className="text-slate-800">
                    ingin memperkenalkan surga-surga tersembunyi di Indonesia
                  </strong>{" "}
                  kepada dunia.
                </p>
                <p>
                  Kami menyadari bahwa pariwisata bukan sekadar tentang tiket pesawat dan
                  kamar hotel. Ini tentang memori, tawa, dan ikatan. Bernaung di bawah bendera{" "}
                  <strong className="text-slate-800">PT Mitra Langkah Buana</strong>, kami
                  bertransformasi dari sekadar biro perjalanan wisata menjadi teman setia untuk
                  setiap petualangan Anda.
                </p>

                <div className="border-l-4 border-[#FF7A00] pl-5 my-6 italic text-[#0B2347] font-medium text-lg md:text-xl bg-slate-50 py-3 pr-3 rounded-r-lg">
                  &ldquo;Kami tidak hanya menjual paket wisata, kami merancang pengalaman yang
                  akan Anda ceritakan bertahun-tahun kemudian.&rdquo;
                </div>

                <p>
                  Kini, dengan ribuan jejak langkah yang telah terukir, Travel Buddies hadir
                  secara komprehensif. Mulai dari{" "}
                  <span className="font-semibold text-slate-800">Open Trip</span> yang penuh
                  kejutan, <span className="font-semibold text-slate-800">Private Trip</span>{" "}
                  yang intim, hingga manajemen{" "}
                  <span className="font-semibold text-slate-800">
                    Perjalanan Dinas B2B (Corporate Travel)
                  </span>{" "}
                  yang profesional. Didukung ekosistem terintegrasi kami, kepuasan Anda adalah
                  destinasi utama kami.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                <div>
                  <p className="text-2xl md:text-3xl font-extrabold text-[#1B75BC] mb-1">
                    11+
                  </p>
                  <p className="text-xs md:text-sm text-slate-500 font-medium">
                    Tahun Pengalaman
                  </p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-extrabold text-[#1B75BC] mb-1">
                    50+
                  </p>
                  <p className="text-xs md:text-sm text-slate-500 font-medium">
                    Corporate Clients
                  </p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-extrabold text-[#1B75BC] mb-1">
                    100%
                  </p>
                  <p className="text-xs md:text-sm text-slate-500 font-medium">
                    Layanan Prima
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visi Misi Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-[1024px] 2xl:max-w-[1440px] mx-auto px-5 xl:px-0">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-bold text-[#1B75BC] uppercase tracking-widest mb-2 block">
              Kompas Perjalanan Kami
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B2347]">
              Tujuan & Arah Travel Buddies
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Visi */}
            <div className="lg:w-1/3 w-full bg-[#0B2347] text-white rounded-3xl p-10 shadow-xl flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Eye className="w-40 h-40 -mt-8 -mr-8 text-white" />
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-[#1B75BC] rounded-full flex items-center justify-center mb-6">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Visi</h3>
                <p className="text-xl leading-relaxed text-slate-300">
                  Menjadi Tour & Travel domestik{" "}
                  <span className="text-[#1B75BC] font-bold text-2xl block mt-2">
                    Nomor 1 di Indonesia
                  </span>
                </p>
              </div>
            </div>

            {/* Misi */}
            <div className="lg:w-2/3 w-full bg-white p-10 rounded-3xl shadow-xl border border-slate-100 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 text-[#1B75BC] rounded-xl flex items-center justify-center text-2xl">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-[#0B2347]">Misi</h3>
              </div>
              <ul className="space-y-5 text-slate-600 text-base md:text-lg">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#1B75BC] mt-1 shrink-0" />
                  <span>
                    Memberikan kualitas pelayanan & pengalaman yang terbaik kepada seluruh
                    konsumen
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#1B75BC] mt-1 shrink-0" />
                  <span>Menyediakan perencanaan perjalanan yang efektif & efisien</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#1B75BC] mt-1 shrink-0" />
                  <span>Membuat perjalanan-perjalanan yang variatif & kreatif</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#1B75BC] mt-1 shrink-0" />
                  <span>Mempromosikan keindahan-keindahan wisata Indonesia</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Layanan Kami Section */}
      <section className="py-20 bg-white" id="produk">
        <div className="max-w-[1024px] 2xl:max-w-[1440px] mx-auto px-5 xl:px-0">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-bold text-[#1B75BC] uppercase tracking-widest mb-2 block">
              Layanan Kami
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B2347]">
              Produk Travel Buddies
            </h2>
            <p className="mt-4 text-slate-600">
              Setiap produk dirancang khusus untuk menjawab berbagai kebutuhan perjalanan Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Open Trip */}
            <div className="bg-slate-50 p-8 md:p-10 rounded-3xl hover:-translate-y-2 transition-transform duration-300 border border-slate-100 group flex flex-col h-full">
              <div className="flex-grow">
                <div className="w-20 h-20 mx-auto bg-white rounded-full shadow-md flex items-center justify-center text-3xl text-[#1B75BC] mb-6 group-hover:bg-[#FF7A00] group-hover:text-white transition-colors duration-300">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#0B2347] text-center mb-4">
                  Open Trip
                </h3>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8 text-center">
                  Paket Wisata yang telah disediakan oleh Travel Buddies, mulai dari
                  destinasi, jadwal, harga, fasilitas & program yang sifatnya digabung dengan
                  peserta lainnya.
                </p>
              </div>
              <Link
                href="/open-trip"
                className="inline-flex items-center justify-center w-full py-3 px-6 bg-white border-2 border-[#1B75BC] text-[#1B75BC] font-bold rounded-xl hover:bg-[#FF7A00] hover:border-[#FF7A00] hover:text-white transition-colors mt-auto gap-2"
              >
                Cek Jadwal Trip <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Private Trip */}
            <div className="bg-[#0B2347] p-8 md:p-10 rounded-3xl hover:-translate-y-2 transition-transform duration-300 shadow-xl relative overflow-hidden group flex flex-col h-full text-white">
              <div className="absolute inset-0 bg-[#FF7A00] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="flex-grow relative z-10">
                <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center text-3xl text-white mb-6 border border-white/20">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-4">
                  Private Trip
                </h3>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8 text-center">
                  Paket Wisata yang bisa disesuaikan dengan kebutuhan (destinasi, jadwal,
                  harga, fasilitas). Sifatnya tidak digabung. <br />
                  <span className="italic text-white/70 block mt-2 text-xs md:text-sm">
                    Contoh: Honeymoon, Family Trip, Study Tour, dll.
                  </span>
                </p>
              </div>
              <Link
                href="/private-trip"
                className="relative z-10 inline-flex items-center justify-center w-full py-3 px-6 bg-[#FF7A00] text-white font-bold rounded-xl hover:bg-[#FF7A00]/80 transition-colors mt-auto gap-2 shadow-lg shadow-orange-500/30"
              >
                Rencanakan Sekarang <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Bisnis Trip */}
            <div className="bg-slate-50 p-8 md:p-10 rounded-3xl hover:-translate-y-2 transition-transform duration-300 border border-slate-100 group flex flex-col h-full">
              <div className="flex-grow">
                <div className="w-20 h-20 mx-auto bg-white rounded-full shadow-md flex items-center justify-center text-3xl text-[#1B75BC] mb-6 group-hover:bg-[#FF7A00] group-hover:text-white transition-colors duration-300">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#0B2347] text-center mb-4">
                  Bisnis Trip
                </h3>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8 text-center">
                  Kerja sama Travel Buddies dengan perusahaan untuk mengakomodasikan kebutuhan
                  perusahaan mulai dari Tiket Pesawat, Hotel, Meeting Room dan lainnya.
                </p>
              </div>
              <Link
                href="/bisnis-trip"
                className="inline-flex items-center justify-center w-full py-3 px-6 bg-white border-2 border-[#1B75BC] text-[#1B75BC] font-bold rounded-xl hover:bg-[#FF7A00] hover:border-[#FF7A00] hover:text-white transition-colors mt-auto gap-2"
              >
                Hubungi Tim B2B <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mengapa Memilih Kami Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-[1024px] 2xl:max-w-[1440px] mx-auto px-5 xl:px-0">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-bold text-[#FF7A00] uppercase tracking-widest mb-2 block">
              Nilai Lebih Kami
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B2347] mb-4">
              Kenapa Memilih Travel Buddies?
            </h2>
            <p className="text-slate-600">
              Kami menggabungkan fleksibilitas gaya liburan masa kini dengan standar pelayanan
              profesional kelas korporasi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Value 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-350 border border-slate-100 hover:-translate-y-1">
              <div className="w-14 h-14 bg-blue-50 text-[#1B75BC] rounded-xl flex items-center justify-center text-2xl mb-6">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#0B2347] text-lg md:text-xl mb-3">
                Itinerary Fleksibel
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Bebas atur destinasi, jadwal, dan aktivitas. Kami merancang perjalanan yang
                100% menyesuaikan dengan <i>vibes</i> liburan atau agenda bisnis Anda.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-350 border border-slate-100 hover:-translate-y-1">
              <div className="w-14 h-14 bg-orange-50 text-[#FF7A00] rounded-xl flex items-center justify-center text-2xl mb-6">
                <Tag className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#0B2347] text-lg md:text-xl mb-3">
                Harga Transparan
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Tidak ada biaya tersembunyi. Dapatkan pengalaman premium dan <i>best value</i>{" "}
                yang disesuaikan secara efisien dengan anggaran Anda.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-350 border border-slate-100 hover:-translate-y-1">
              <div className="w-14 h-14 bg-blue-50 text-[#1B75BC] rounded-xl flex items-center justify-center text-2xl mb-6">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#0B2347] text-lg md:text-xl mb-3">
                Tim Profesional
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Didukung oleh <i>Travel Consultant</i> handal dan <i>Local Guide</i>{" "}
                berpengalaman yang memastikan kenyamanan serta keamanan Anda di lapangan.
              </p>
            </div>

            {/* Value 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-350 border border-slate-100 hover:-translate-y-1">
              <div className="w-14 h-14 bg-orange-50 text-[#FF7A00] rounded-xl flex items-center justify-center text-2xl mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#0B2347] text-lg md:text-xl mb-3">
                Layanan Terintegrasi
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Dari urusan tiket, akomodasi, hingga pengurusan dokumen bisnis, semua
                tertangani tuntas dalam satu atap ekosistem kami. Anti-ribet!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* App Promotion Section */}
      <div className="my-10">
        <AppPromotion />
      </div>
    </main>
  );
}
