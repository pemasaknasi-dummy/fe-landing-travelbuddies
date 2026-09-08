"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  Building,
  Users,
  Briefcase,
  CreditCard,
  Headset,
  BarChart3,
  Plane,
  Hotel,
  CheckCircle2,
  X,
  Quote,
  ArrowRight,
  Menu,
  ShieldCheck,
  FileText,
  Clock,
  Settings,
  XCircle,
  Building2,
  MapPin,
  PieChart,
  Check,
  Zap,
  PhoneCall,
  MailOpen,
  MessageSquare,
  LayoutDashboard,
  Send,
  Image as ImageIcon,
} from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Date as DateInput } from "@/components/ui/Date";
import { usePerdinMutation } from "@/features/perdin/hooks/usePerdin";
import { PerdinPayload } from "@/features/perdin/api/perdin-api";
import { PerdinSubmit } from "@/components/sections/PerdinSubmit";
import toast from "react-hot-toast";

export default function PerdinPage() {
  const [isSubmit, setIsSubmit] = useState(false);
  const [isCaptchaDone, setIsCaptchaDone] = useState(false);
  const { mutate: postPerdin, isPending } = usePerdinMutation();

  const clients = [
    "amartha",
    "angkasa-pura",
    "asia-serv",
    "carlcare",
    "dkj",
    "domain-id",
    "jmtransindo",
    "master-diskon",
    "nap",
    "nss",
    "polda",
    "rexline",
    "sai",
    "titan",
  ];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PerdinPayload>();

  const selectedSegment = watch("companySegment");

  useEffect(() => {
    if (isSubmit) {
      window.scrollTo(0, 0);
    }
  }, [isSubmit]);

  const onVerify = () => {
    setIsCaptchaDone(true);
  };

  const onSubmit: SubmitHandler<PerdinPayload> = (formData) => {
    const payload = {
      ...formData,
      companySegment: formData.companySegment === "Other" ? (formData.companySegmentOther || "Other") : formData.companySegment,
    };
    delete payload.companySegmentOther;

    postPerdin(payload, {
      onSuccess: () => {
        toast.success("Form Success Terkirim", { position: "top-center" });
        setIsSubmit(true);
      },
      onError: (error) => {
        console.error("Error Submit Perdin: ", error);
        toast.error("Gagal Submit Form", { position: "top-center" });
      },
    });
  };

  return (
    <>
      {isSubmit ? (
        <PerdinSubmit />
      ) : (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-[#eaf6fc] selection:text-[#1B75BC]">
          {/* SECTION 1: HERO - FULL WIDTH IMAGE CORPORATE REDESIGN */}
          <section className="relative min-h-[90vh] lg:min-h-screen flex items-center pb-32 lg:py-0 overflow-hidden bg-slate-900">
            {/* Background Image & Overlays */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/logo-perdin/perdin-header.png"
                alt="Corporate Travel Services"
                fill
                className="object-cover object-center"
                priority
              />
              {/* Stronger gradient on the left for text readability, fading to right */}
              <div className="absolute inset-0 bg-linear-to-r from-slate-900/95 via-slate-900/80 to-slate-900/30"></div>
              {/* Subtle top/bottom vignette */}
              <div className="absolute inset-0 bg-linear-to-b from-slate-900/50 via-transparent to-slate-900/80"></div>
            </div>

            <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-0 relative z-10 w-full mt-10 lg:mt-0">
              <div className="max-w-3xl text-left">
                {/* Label */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
                  <span className="flex h-2 w-2 rounded-full bg-[#4fb0e8] animate-pulse shadow-[0_0_8px_#4fb0e8]"></span>
                  <span className="text-[11px] font-bold text-white uppercase tracking-widest">
                    Corporate Travel Support & Management
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-extrabold text-white leading-[1.15] mb-6 tracking-tight uppercase">
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-[#4fb0e8] to-[#9cd3f5]">
                    EFISIENSI PERJALANAN
                  </span>{" "}
                  BISNIS PERUSAHAAN ANDA
                </h1>

                {/* Paragraph */}
                <p className="text-lg md:text-xl text-slate-300 mb-10 font-medium leading-relaxed max-w-2xl">
                  Era baru layanan korporat untuk mendukung mobilitas pengembangan bisnis anda dengan penyediaan kredit
                  limit yang sesuai dengan kebutuhan perusahaan
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="#inquiry-form"
                    className="bg-[#1B75BC] hover:bg-[#10558a] text-white px-8 py-4 rounded-xl font-bold text-base transition-all shadow-lg shadow-[#1B75BC]/30 flex items-center justify-center gap-2 group"
                  >
                    Mulai Kerja Sama
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="#inquiry-form"
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm px-8 py-4 rounded-xl font-semibold text-base transition-all flex items-center justify-center"
                  >
                    Jadwalkan Konsultasi
                  </a>
                </div>

                {/* Trust Indicators */}
                <div className="mt-14 flex items-center gap-5 pt-8 border-t border-white/20 max-w-max">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-slate-800 overflow-hidden relative">
                      <Image
                        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                        alt="User"
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-slate-800 overflow-hidden relative">
                      <Image
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                        alt="User"
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-slate-800 overflow-hidden relative">
                      <Image
                        src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                        alt="User"
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center z-10">
                      <span className="text-[10px] font-bold text-white">+50</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-slate-300 leading-snug">
                    Telah menemani perjalanan bisnis <br />
                    <span className="font-bold text-white">50+ Perusahaan</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Bottom Bar (Desktop) */}
            <div className="absolute bottom-0 left-0 w-full z-20 border-t border-white/10 bg-slate-900/60 backdrop-blur-xl hidden lg:block">
              <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-0 py-6">
                <div className="grid grid-cols-3 gap-8 divide-x divide-white/10">
                  {/* Feature 1 */}
                  <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md">
                      <Building2 className="w-6 h-6 text-[#4fb0e8]" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-base tracking-wide">Pendekatan Eksklusif</p>
                      <p className="text-slate-400 text-sm font-medium">B2B Corporate Travel</p>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="flex items-center gap-4 pl-8">
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md">
                      <PieChart className="w-6 h-6 text-[#4fb0e8]" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-base tracking-wide">Lebih Hemat Biaya</p>
                      <p className="text-slate-400 text-sm font-medium">Jaminan harga termurah</p>
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="flex items-center gap-4 pl-8">
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md">
                      <ShieldCheck className="w-6 h-6 text-[#4fb0e8]" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-base tracking-wide">Tim Selalu Siaga</p>
                      <p className="text-slate-400 text-sm font-medium">24/7 support</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: TRUSTED BY */}
          <section className="py-12 border-y border-slate-100 bg-slate-50 overflow-hidden">
            <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-0 text-center">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">
                Telah Dipercaya oleh Berbagai Perusahaan Terkemuka
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-8 md:gap-10 lg:gap-12 opacity-100 transition-all duration-500 items-center justify-items-center">
                {clients.map((client) => (
                  <div
                    key={client}
                    className="flex items-center justify-center p-2 w-full hover:scale-110 transition-transform duration-300 cursor-pointer"
                  >
                    <Image
                      src={`/images/logo-perdin/${client}.png`}
                      alt={client}
                      width={120}
                      height={60}
                      className="object-contain h-8 sm:h-10 md:h-12 w-auto"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 3: VALUE PROPOSITION */}
          <section id="mengapa-kami" className="py-24 bg-white">
            <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-0">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                  Efisiensi dimulai dari sekarang
                </h2>
                <p className="text-lg text-slate-600 font-medium hidden">
                  Bukan sekadar mesin pemesanan, kami mendedikasikan tim ahli untuk mengawal kelancaran mobilitas bisnis
                  Anda.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    Icon: Building2,
                    title: "Jaminan harga termurah",
                    desc: "Menemukan yang lebih rendah? Kami bayar yang terendah",
                  },
                  {
                    Icon: ShieldCheck,
                    title: "Tanpa biaya terselubung",
                    desc: "Kenyamanan transparan transaksi untuk seluruh jenis reservasi",
                  },
                  {
                    Icon: Headset,
                    title: "24/7 Support",
                    desc: "Penyediaan 1 tenaga khusus untuk menjembatani kebutuhan reservasi & konsultasi rencana perjalanan bisnis anda",
                  },
                  {
                    Icon: LayoutDashboard,
                    title: "User friendly platform",
                    desc: "Memudahkan anda memantau kredit limit, penggunaan, dan detail transaksi",
                  },
                ].map((item, idx) => {
                  const IconComp = item.Icon;
                  return (
                    <div
                      key={idx}
                      className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:shadow-[#1B75BC]/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col items-center text-center sm:items-start sm:text-left"
                    >
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <IconComp className="w-7 h-7 text-[#1B75BC]" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SECTION 4: CORPORATE PARTNERSHIP */}
          <section className="py-24 bg-[#1B75BC] relative overflow-hidden text-white">
            <div className="absolute right-0 top-0 w-1/2 h-full bg-[#10558a] -z-10 rounded-l-full blur-3xl transform translate-x-1/4"></div>
            <div className="absolute left-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

            <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-0">
              <div className="max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-sm">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      SIMPLIFIKASI ADMINISTRASI
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
                    Sederhanakan alur pembayaran, dan beban administrasi bertumpuk
                  </h2>

                  <ul className="space-y-4 text-left">
                    {[
                      "Skema pembayaran tempo sesuai kesepakatan",
                      "Limit diberikan menyesuaikan kesepakatan",
                      "Tidak adanya biaya/denda yang timbul jika limit tidak digunakan",
                      "Reconcile & pengiriman invoice terjadwal mempermudah fungsi pengawasan",
                    ].map((benefit, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                      >
                        <div className="bg-amber-400 rounded-full p-1.5 shrink-0">
                          <Check className="w-5 h-5 text-slate-900" />
                        </div>
                        <span className="text-white font-medium text-lg">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: FITUR/LAYANAN */}
          <section id="layanan" className="py-24 bg-slate-50 border-t border-slate-200">
            <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-0">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Layanan Personal</h2>
                {/* <p className="text-lg text-slate-600 font-medium">
                  Lebih dari sekadar aplikasi pemesanan tiket, kami mendampingi setiap perjalanan dinas Anda layaknya
                  asisten pribadi yang cekatan.
                </p> */}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    Icon: MessageSquare,
                    title: "Pemesanan/reservasi melalui kanal yang disediakan",
                    desc: "Tak perlu aplikasi ribet. Cukup hubungi kami lewat WhatsApp atau Email khusus yang kami siapkan, tim kami langsung mereservasikan opsi terbaik untuk Anda.",
                  },
                  {
                    Icon: PieChart,
                    title: "Laporan visual & real - time atas pengeluaran reservasi",
                    desc: "Anda bisa melihat langsung detail histori perjalanan dan seberapa banyak anggaran yang sudah terpakai kapan saja melalui dasbor kami.",
                  },
                  {
                    Icon: ShieldCheck,
                    title: "Akses terbatas untuk menjaga limit dari penyalahgunaan",
                    desc: "Kami menerapkan sistem persetujuan (approval) bertahap, sehingga setiap pesanan dijamin selalu sejalan dengan aturan batas budget kantor Anda.",
                  },
                  {
                    Icon: Headset,
                    title: "Bantuan 24/7 atas kebutuhan perubahan/penyesuaian rencana perjalanan",
                    desc: "Penerbangan ditunda atau ada rapat mendadak? Beri tahu kami. Tim spesialis kami selalu siaga 24/7 mengurus perubahan tiket atau kendala lainnya.",
                  },
                ].map((feature, idx) => {
                  const IconComp = feature.Icon;
                  return (
                    <div
                      key={idx}
                      className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-[#bce2f3] shadow-sm hover:shadow-lg transition-all flex gap-6 group cursor-pointer text-left items-start"
                    >
                      <div className="w-16 h-16 bg-[#eaf6fc] text-[#1B75BC] rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#1B75BC] group-hover:text-white transition-colors shadow-sm">
                        <IconComp className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 mb-3 text-xl leading-snug">{feature.title}</h3>
                        <p className="text-slate-500 text-base leading-relaxed font-medium">{feature.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SECTION 6: HOW IT WORKS */}
          <section id="cara-kerja" className="py-24 bg-white">
            <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-0">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                  PROSES KEAGENAN RINGKAS, MENDUKUNG AKSELERASI KENYAMANAN ANDA
                </h2>
                <p className="text-lg text-slate-600 font-medium">
                  Tanpa proses berbelit yang menghabiskan waktu. Anda bisa mulai menikmati fasilitas layanan prioritas
                  kami dalam waktu singkat.
                </p>
              </div>

              <div className="relative">
                <div className="hidden lg:block absolute top-[40px] left-10 right-10 h-1 bg-slate-100 z-0"></div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-6 relative z-10">
                  {[
                    {
                      step: "1",
                      title: "Diskusi kebutuhan",
                      desc: "Kita diskusikan bersama kebutuhan budget perusahaan, cara pengajuan, dan preferensi perjalanan Anda.",
                    },
                    {
                      step: "2",
                      title: "Penandatanganan NDA & background checking",
                      desc: "Menyepakati besaran plafon bulanan yang nyaman beserta tenggat waktu pembayarannya.",
                    },
                    {
                      step: "3",
                      title: "Tinjauan draft Perjanjian Kerja Sama",
                      desc: "Kami akan segera membuatkan grup komunikasi khusus untuk melayani setiap permintaan tiket dari tim Anda.",
                    },
                    {
                      step: "4",
                      title: "Penandatanganan draft Perjanjian Kerja Sama",
                      desc: "Saat ada kebutuhan dinas, tim Anda cukup me-request. Sisanya biarkan spesialis kami yang menyelesaikan semuanya.",
                    },
                    {
                      step: "5",
                      title: "Mulai Layanan!",
                      desc: "",
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center group">
                      <div className="w-20 h-20 bg-white border-4 border-slate-100 rounded-full flex items-center justify-center text-2xl font-black text-slate-300 group-hover:border-[#1B75BC] group-hover:text-[#1B75BC] group-hover:bg-[#eaf6fc] transition-all duration-300 mb-6 shadow-sm z-10 relative">
                        {item.step}
                      </div>
                      <h3 className="font-extrabold text-slate-900 mb-2 text-lg">{item.title}</h3>
                      <p className="text-sm text-slate-500 px-2 font-medium">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 7: COST CONTROL */}
          <section className="py-24 bg-slate-50">
            <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-0">
              <div className="grid lg:grid-cols-2 gap-16 items-center text-left">
                <div className="order-2 lg:order-1 relative">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] sm:aspect-square">
                    <Image
                      src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                      alt="Laporan Transparan"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[#1B75BC]/20 mix-blend-multiply"></div>

                    <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1B75BC] uppercase tracking-wider mb-1">
                            Diserahkan Secara Berkala
                          </p>
                          <h4 className="font-extrabold text-slate-900 text-lg text-left">Ringkasan Laporan</h4>
                        </div>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-500 text-sm">TRANSAKSI TEREKAM</span>
                        <span className="font-black text-[#1B75BC] text-xl">100% Valid</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="order-1 lg:order-2">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
                    Laporan transparan, rapi, akurat, realtime
                  </h2>
                  <p className="text-lg text-slate-600 mb-8 font-medium leading-relaxed">
                    Tak ada lagi struk yang hilang atau tabel Excel yang berantakan. Kami pastikan setiap data
                    perjalanan dikelola secara rapi dan selalu siap saat Anda ingin mengeceknya.
                  </p>

                  <div className="space-y-6">
                    {[
                      { Icon: Clock, text: "Laporan konsolidasi akan dikirim di setiap hari senin" },
                      { Icon: FileText, text: "Bisa melihat rincian pengeluaran per departemen secara spesifik." },
                      {
                        Icon: ShieldCheck,
                        text: "Garansi 100% kecocokan antara nominal tagihan dengan bukti transaksi.",
                      },
                      { Icon: PieChart, text: "Sangat mempercepat kerja tim Finance saat proses tutup buku bulanan." },
                    ].map((item, idx) => {
                      const IconComp = item.Icon;
                      return (
                        <div key={idx} className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-[#eaf6fc] text-[#1B75BC] flex items-center justify-center shrink-0">
                            <IconComp className="w-6 h-6" />
                          </div>
                          <span className="text-slate-700 font-bold text-lg">{item.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 8: COMPARISON */}
          <section className="py-24 bg-white border-t border-slate-100">
            <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-0">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">KEUNGGULAN KEMITRAAN KAMI</h2>
                <p className="text-lg text-slate-600 font-medium">
                  Lihat sekilas bagaimana sentuhan layanan profesional kami mampu merapikan dan mempermudah urusan
                  perjalanan di perusahaan Anda.
                </p>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-slate-100 shadow-md">
                <table className="w-full min-w-[800px] border-collapse bg-white">
                  <thead>
                    <tr>
                      <th className="w-1/4 p-6 text-left text-lg font-bold text-slate-900 border-b border-slate-200">
                        Aktivitas
                      </th>
                      <th className="w-1/3 p-6 text-center text-lg font-bold text-slate-500 border-b border-slate-200 bg-slate-50">
                        Cara Manual
                      </th>
                      <th className="w-1/3 p-6 text-center text-xl font-black text-[#1B75BC] border-b-4 border-[#1B75BC] bg-[#eaf6fc]/50">
                        Bersama Travel Buddies
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        label: "Booking",
                        old: "Ragam Kanal",
                        new: "1 kanal memenuhi seluruh kebutuhan",
                      },
                      {
                        label: "Pembayaran",
                        old: "Real time",
                        new: "Tempo sesuai kesepakatan",
                      },
                      {
                        label: "Pengawasan akses",
                        old: "Terbuka",
                        new: "Terbatas",
                      },
                      {
                        label: "Dukungan",
                        old: "Call centre public",
                        new: "Dedicated support centre",
                      },
                      {
                        label: "Pembukuan",
                        old: "Manual",
                        new: "Konsolidasi & real time system",
                      },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-6 text-slate-900 font-bold text-left align-top">{row.label}</td>
                        <td className="p-6 bg-slate-50 align-top">
                          <div className="flex items-start gap-3 text-left max-w-[280px] mx-auto text-slate-500">
                            <X className="w-5 h-5 shrink-0 text-slate-300 mt-0.5" />
                            <span className="font-medium leading-relaxed">{row.old}</span>
                          </div>
                        </td>
                        <td className="p-6 bg-[#eaf6fc]/30 align-top">
                          <div className="flex items-start gap-3 text-left max-w-[280px] mx-auto">
                            <div className="bg-emerald-100 p-1.5 rounded-full shrink-0 mt-0.5 shadow-sm">
                              <Check className="w-4 h-4 text-emerald-600 stroke-3" />
                            </div>
                            <span className="text-slate-900 font-extrabold leading-relaxed">{row.new}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* SECTION 9: TESTIMONIAL */}
          <section className="py-24 bg-slate-50">
            <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-0">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                  Dipercaya Oleh Pemimpin Industri
                </h2>
                <p className="text-lg text-slate-600 font-medium">
                  Buktikan sendiri bagaimana pelayanan kami membantu berbagai skala perusahaan.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-3xl shadow-md border border-slate-100 relative text-left">
                  <Quote className="size-6 md:size-16 text-amber-200 md:text-amber-300 absolute top-8 right-8" />
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 bg-slate-200 rounded-full overflow-hidden shrink-0">
                      <Image
                        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                        alt="Andi"
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-lg">Andi Wirawan</h4>
                      <p className="text-sm text-slate-500 font-bold">Finance Director, PT Global Teknologi</p>
                    </div>
                  </div>
                  <p className="text-slate-700 text-lg leading-relaxed font-medium">
                    &quot;Centralized billing dan laporan bulanan dari Travel Buddies adalah penyelamat tim Finance
                    kami. Tidak ada lagi karyawan yang telat reimburse atau struk yang hilang. Semuanya rapi dan
                    ditagihkan sekaligus.&quot;
                  </p>
                </div>

                <div className="bg-white p-10 rounded-3xl shadow-md border border-slate-100 relative text-left">
                  <Quote className="size-6 md:size-16 text-gray-300 md:text-gray-200 absolute top-8 right-8" />
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 bg-slate-200 rounded-full overflow-hidden shrink-0">
                      <Image
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                        alt="Siti"
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-lg">Siti Rahma</h4>
                      <p className="text-sm text-slate-500 font-bold">VP Human Capital, Logistics Tbk</p>
                    </div>
                  </div>
                  <p className="text-slate-700 text-lg leading-relaxed font-medium">
                    &quot;Punya Dedicated PIC di grup WA itu sangat membantu. Pernah direksi kami butuh reschedule
                    mendadak di jam 1 pagi karena urusan mendesak. Tinggal chat grup, dan PIC kami langsung memproses
                    tiket baru.&quot;
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 10: FINAL CTA & FORM */}
          <section id="inquiry-form" className="py-28 bg-[#1B75BC] relative overflow-hidden">
            <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-0 relative z-10">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="text-white text-left">
                  <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                    Siap Menikmati Kemudahan Perjalanan Bisnis?
                  </h2>
                  <p className="text-xl text-[#eaf6fc] mb-8 font-medium leading-relaxed">
                    Ini adalah langkah awal menuju operasional yang lebih rapi dan bebas pusing. Yuk, luangkan waktu
                    sejenak untuk berdiskusi santai tentang bagaimana kami bisa membantu perusahaan Anda.
                  </p>
                  <ul className="space-y-5 hidden md:block">
                    <li className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0 backdrop-blur-sm">
                        <CheckCircle2 className="w-7 h-7 text-amber-400" />
                      </div>
                      <span className="text-lg font-medium">
                        Tim kami akan merespons permintaan Anda maksimal 1x24 jam.
                      </span>
                    </li>
                    <li className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0 backdrop-blur-sm">
                        <CheckCircle2 className="w-7 h-7 text-amber-400" />
                      </div>
                      <span className="text-lg font-medium">
                        Penawaran kami sangat fleksibel, menyesuaikan kemampuan budget kantor Anda.
                      </span>
                    </li>
                    <li className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0 backdrop-blur-sm">
                        <CheckCircle2 className="w-7 h-7 text-amber-400" />
                      </div>
                      <span className="text-lg font-medium">
                        Sesi ngobrol ini 100% gratis, tanpa keharusan untuk langsung berlangganan.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* FORM CARD */}
                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl relative text-left">
                  <div className="flex items-start gap-5 mb-8">
                    <div className="w-14 h-14 bg-[#eaf6fc] rounded-2xl flex items-center justify-center text-[#1B75BC] shrink-0">
                      <Briefcase className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-slate-900 mb-1.5">Jadwalkan Sesi Ngobrol</h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">
                        Tinggalkan kontak Anda, dan mari kita atur waktu luang untuk mendiskusikan solusi perjalanan
                        terbaik bagi perusahaan Anda.
                      </p>
                    </div>
                  </div>

                  <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <fieldset className="space-y-4" disabled={isPending}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5 after:content-['*'] after:text-red-500">
                            Email Kantor
                          </label>
                          <input
                            type="email"
                            className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all text-sm ${errors?.email ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-[#1B75BC]/20 focus:border-[#1B75BC]"}`}
                            placeholder="nama@perusahaan.com"
                            {...register("email", { required: "Email wajib diisi" })}
                          />
                          {errors?.email && (
                            <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5 after:content-['*'] after:text-red-500">
                            No. Telp / WhatsApp
                          </label>
                          <input
                            type="tel"
                            maxLength={13}
                            className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all text-sm ${errors?.phone ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-[#1B75BC]/20 focus:border-[#1B75BC]"}`}
                            placeholder="0812xxxxxx"
                            {...register("phone", {
                              required: "Nomor WhatsApp wajib diisi",
                              pattern: {
                                value: /^08[0-9]{8,12}$/,
                                message: "Nomor WhatsApp tidak valid",
                              },
                              onChange: (e) => {
                                e.target.value = e.target.value.replace(/[^0-9]/g, "");
                              },
                            })}
                          />
                          {errors?.phone && (
                            <span className="text-red-500 text-xs mt-1 block">{errors.phone.message}</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5 after:content-['*'] after:text-red-500">
                            Nama PIC
                          </label>
                          <input
                            type="text"
                            className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all text-sm ${errors?.name ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-[#1B75BC]/20 focus:border-[#1B75BC]"}`}
                            placeholder="Nama Anda"
                            {...register("name", { required: "Nama wajib diisi" })}
                          />
                          {errors?.name && (
                            <span className="text-red-500 text-xs mt-1 block">{errors.name.message}</span>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5 after:content-['*'] after:text-red-500">
                            Jabatan PIC
                          </label>
                          <input
                            type="text"
                            className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all text-sm ${errors?.position ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-[#1B75BC]/20 focus:border-[#1B75BC]"}`}
                            placeholder="Contoh: HR Manager"
                            {...register("position", { required: "Jabatan PIC wajib diisi" })}
                          />
                          {errors?.position && (
                            <span className="text-red-500 text-xs mt-1 block">{errors.position.message}</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5 after:content-['*'] after:text-red-500">
                            Nama Perusahaan
                          </label>
                          <input
                            type="text"
                            className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all text-sm ${errors?.companyName ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-[#1B75BC]/20 focus:border-[#1B75BC]"}`}
                            placeholder="PT. Contoh Indonesia"
                            {...register("companyName", { required: "Nama perusahaan wajib diisi" })}
                          />
                          {errors?.companyName && (
                            <span className="text-red-500 text-xs mt-1 block">{errors.companyName.message}</span>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5 after:content-['*'] after:text-red-500">
                            Segmen Perusahaan (Corporate)
                          </label>
                          <select
                            className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all text-sm bg-white ${errors?.companySegment ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-[#1B75BC]/20 focus:border-[#1B75BC]"}`}
                            {...register("companySegment", { required: "Segmen perusahaan wajib diisi" })}
                          >
                            <option value="">Pilih segmen perusahaan</option>
                            {[
                              "Travel",
                              "FMCG",
                              "Banking",
                              "Insurance",
                              "Technology",
                              "Manufacturing",
                              "Property",
                              "Education",
                              "Healthcare",
                              "Government",
                              "Startup",
                              "Retail",
                              "Other",
                            ].map((segment) => (
                              <option key={segment} value={segment}>
                                {segment}
                              </option>
                            ))}
                          </select>
                          {errors?.companySegment && (
                            <span className="text-red-500 text-xs mt-1 block">{errors.companySegment.message}</span>
                          )}
                        </div>
                      </div>

                      {selectedSegment === "Other" && (
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5 after:content-['*'] after:text-red-500">
                            Segmen Perusahaan Lainnya
                          </label>
                          <input
                            type="text"
                            className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all text-sm ${errors?.companySegmentOther ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-[#1B75BC]/20 focus:border-[#1B75BC]"}`}
                            placeholder="Sebutkan segmen perusahaan Anda"
                            {...register("companySegmentOther", { required: "Segmen perusahaan lainnya wajib diisi" })}
                          />
                          {errors?.companySegmentOther && (
                            <span className="text-red-500 text-xs mt-1 block">{errors.companySegmentOther.message}</span>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                          Website Perusahaan
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/20 focus:border-[#1B75BC] transition-all text-sm"
                          placeholder="www.perusahaan.com (opsional)"
                          {...register("companyWebsite")}
                        />
                      </div>

                      <div className="pt-2">
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
                      </div>

                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-[#1B75BC] hover:bg-[#10558a] text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg mt-4 flex justify-center items-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isPending ? "Memproses..." : "Kirim Inquiry Sekarang"} <ArrowRight className="w-5 h-5" />
                      </button>
                    </fieldset>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
