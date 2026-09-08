/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  Instagram,
  ArrowRight,
  Award,
  TrendingUp,
  Globe,
  AlertCircle,
  Info,
  FileWarning,
  Trash2,
  File,
  Upload,
  BookOpenText,
  Handshake,
} from "lucide-react";
import { useAgentSubmissionMutation } from "@/features/agents/hooks/useAgent";
import { PayloadAgentSubmission } from "@/features/agents/api/agent-api";
import {
  useProvinces,
  useRegencies,
  useDistricts,
  useVillages,
} from "@/features/agents/hooks/useWilayah";
import {
  WilayahItem,
  Provinsi,
  KabupatenKota,
  Kecamatan,
  Kelurahan,
  wilayahApi,
} from "@/features/agents/api/wilayah-api";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import toast from "react-hot-toast";
import { Turnstile } from "@marsidev/react-turnstile";
import AgentSubmissionSuccessPage from "@/components/sections/AgentSubmissionSucces";
import { ModalOTP } from "@/features/auth/components/ModalOTP";
import { useAuthMutation } from "@/features/auth/hooks/useAuth";

export interface FormData {
  agentName: string;
  ownerName: string;
  noKtp: string;
  address?: string;
  addressDetail: string;
  picName: string;
  picPhone: string;
  email: string;
  instagram?: string;
  website?: string;
  reason?: string;
  ktpUrl?: File;
  nibUrl?: File;
  npwpUrl?: File;
}

export default function AgentSubmissionPage() {
  const [isSubmissionAgentSuccess, setIsSubmissionAgentSuccess] = useState<boolean>(false);
  const [isSubmitForm, setIsSubmitForm] = useState<boolean>(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isCaptchaDone, setIsCaptchaDone] = useState(false);

  // Wilayah selection states
  const [selectedProvince, setSelectedProvince] = useState<Provinsi | null>(null);
  const [selectedRegency, setSelectedRegency] = useState<KabupatenKota | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<Kecamatan | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<Kelurahan | null>(null);

  // Wilayah validation error states
  const [provinceError, setProvinceError] = useState<string>("");
  const [regencyError, setRegencyError] = useState<string>("");
  const [districtError, setDistrictError] = useState<string>("");
  const [villageError, setVillageError] = useState<string>("");

  // Postal code selection & options states
  const [postalCodeOptions, setPostalCodeOptions] = useState<WilayahItem[]>([]);
  const [selectedPostalCode, setSelectedPostalCode] = useState<WilayahItem | null>(null);
  const [postalCodeError, setPostalCodeError] = useState<string>("");
  const [isFetchingPostalCode, setIsFetchingPostalCode] = useState<boolean>(false);

  // Wilayah queries
  const {
    data: provinces,
    isLoading: isLoadingProvinces,
    isError: isErrorProvinces,
    refetch: refetchProvinces,
  } = useProvinces();

  const {
    data: regencies,
    isLoading: isLoadingRegencies,
    isError: isErrorRegencies,
    refetch: refetchRegencies,
  } = useRegencies(selectedProvince?.id);

  const {
    data: districts,
    isLoading: isLoadingDistricts,
    isError: isErrorDistricts,
    refetch: refetchDistricts,
  } = useDistricts(selectedRegency?.id);

  const {
    data: villages,
    isLoading: isLoadingVillages,
    isError: isErrorVillages,
    refetch: refetchVillages,
  } = useVillages(selectedDistrict?.id);

  const handleProvinceChange = (item: Provinsi | null) => {
    setSelectedProvince(item);
    setSelectedRegency(null);
    setSelectedDistrict(null);
    setSelectedVillage(null);
    setSelectedPostalCode(null);
    setPostalCodeOptions([]);
    setPostalCodeError("");
    setProvinceError("");
    setRegencyError("");
    setDistrictError("");
    setVillageError("");
  };

  const handleRegencyChange = (item: KabupatenKota | null) => {
    setSelectedRegency(item);
    setSelectedDistrict(null);
    setSelectedVillage(null);
    setSelectedPostalCode(null);
    setPostalCodeOptions([]);
    setPostalCodeError("");
    setRegencyError("");
    setDistrictError("");
    setVillageError("");
  };

  const handleDistrictChange = (item: Kecamatan | null) => {
    setSelectedDistrict(item);
    setSelectedVillage(null);
    setSelectedPostalCode(null);
    setPostalCodeOptions([]);
    setPostalCodeError("");
    setDistrictError("");
    setVillageError("");
  };

  const handleVillageChange = async (item: Kelurahan | null) => {
    setSelectedVillage(item);
    setVillageError("");
    setSelectedPostalCode(null);
    setPostalCodeOptions([]);
    setPostalCodeError("");

    if (!item) {
      return;
    }

    // Auto-lookup postal codes from API
    try {
      setIsFetchingPostalCode(true);
      const results = await wilayahApi.getPostalCodes(item.name);
      if (results && results.length > 0) {
        const distName = selectedDistrict?.name?.toLowerCase().trim();
        const cityName = selectedRegency?.name?.toLowerCase().trim();

        // Filter matched items
        const filtered = results.filter((r) => {
          const matchVillage = r.village?.toLowerCase().includes(item.name.toLowerCase().trim());
          const matchDistrict = distName ? r.district?.toLowerCase().includes(distName) : false;
          const matchCity = cityName ? r.regency?.toLowerCase().includes(cityName) : false;
          return matchVillage && (matchDistrict || matchCity);
        });

        const targetList =
          filtered.length > 0
            ? filtered
            : results.filter((r) => {
                return (
                  r.village?.toLowerCase().includes(item.name.toLowerCase().trim()) ||
                  (distName && r.district?.toLowerCase().includes(distName))
                );
              });

        const finalList = targetList.length > 0 ? targetList : results;
        const uniqueCodes = Array.from(
          new Set(
            finalList
              .map((r) => String(r.code || r.postalcode || "").trim())
              .filter(Boolean)
          )
        );

        const options: WilayahItem[] = uniqueCodes.map((code) => ({
          id: code,
          name: code,
        }));

        setPostalCodeOptions(options);

        // Auto-select if at least 1 option available!
        if (options.length > 0) {
          const matched = finalList.find((r) => {
            return distName && r.district?.toLowerCase().includes(distName);
          });
          const autoCode = String(
            matched?.code || matched?.postalcode || options[0].id
          ).trim();
          setSelectedPostalCode({ id: autoCode, name: autoCode });
          setPostalCodeError("");
        }
      }
    } catch (err) {
      console.warn("Auto lookup postal code error:", err);
    } finally {
      setIsFetchingPostalCode(false);
    }
  };

  // Separate file states
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [nibFile, setNibFile] = useState<File | null>(null);
  const [npwpFile, setNpwpFile] = useState<File | null>(null);

  const [ktpError, setKtpError] = useState<string>("");
  const [nibError, setNibError] = useState<string>("");
  const [npwpError, setNpwpError] = useState<string>("");

  const { verifyOtpMutation, resendOtpMutation } = useAuthMutation();
  const [submissionToken, setSubmissionToken] = useState<string>("");

  const { mutate: postAgentSubmission, isPending } = useAgentSubmissionMutation();
  const isLocal = process.env.NEXT_PUBLIC_API_URL === "http://localhost:3010/api";

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    clearErrors,
  } = useForm<FormData>({ mode: "onChange" });

  const email = watch("email");

  const onVerify = (token: string | null) => {
    if (token !== null) {
      setIsCaptchaDone(true);
    } else {
      setIsCaptchaDone(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: "ktp" | "nib" | "npwp") => {
    const file = event.target.files?.[0];

    if (type === "ktp") setKtpError("");
    else if (type === "nib") setNibError("");
    else if (type === "npwp") setNpwpError("");

    const setFileValue = (val: File | null) => {
      if (type === "ktp") {
        setKtpFile(val);
        setValue("ktpUrl", val || undefined);
        if (val) clearErrors("ktpUrl");
      } else if (type === "nib") {
        setNibFile(val);
        setValue("nibUrl", val || undefined);
        if (val) clearErrors("nibUrl");
      } else if (type === "npwp") {
        setNpwpFile(val);
        setValue("npwpUrl", val || undefined);
        if (val) clearErrors("npwpUrl");
      }
    };

    const setFileError = (msg: string) => {
      if (type === "ktp") setKtpError(msg);
      else if (type === "nib") setNibError(msg);
      else if (type === "npwp") setNpwpError(msg);
      setFileValue(null);
    };

    if (!file) {
      setFileValue(null);
      return;
    }

    // ✅ Validasi tipe file
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const allowedExtensions = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".webp"];
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (!allowedMimeTypes.includes(file.type) || !allowedExtensions.includes(fileExtension)) {
      setFileError("Format file harus PDF, DOC, DOCX, JPG, JPEG, PNG, atau WEBP");
      return;
    }

    // ✅ Validasi ukuran file (maksimal 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setFileError("Ukuran file maksimal 5MB");
      return;
    }

    setFileValue(file);
  };

  const handleRemoveFile = (type: "ktp" | "nib" | "npwp") => {
    if (type === "ktp") {
      setKtpFile(null);
      setValue("ktpUrl", undefined);
      setKtpError("");
    } else if (type === "nib") {
      setNibFile(null);
      setValue("nibUrl", undefined);
      setNibError("");
    } else if (type === "npwp") {
      setNpwpFile(null);
      setValue("npwpUrl", undefined);
      setNpwpError("");
    }

    const fileInput = document.getElementById(`${type}-file`) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const onSubmit: SubmitHandler<FormData> = async (formData) => {
    // Validasi file KTP wajib
    if (!ktpFile) {
      setKtpError("File KTP wajib diupload");
      return;
    }

    // Validasi wilayah cascading & kode pos
    let hasWilayahError = false;
    if (!selectedProvince) {
      setProvinceError("Provinsi wajib dipilih");
      hasWilayahError = true;
    }
    if (!selectedRegency) {
      setRegencyError("Kabupaten/Kota wajib dipilih");
      hasWilayahError = true;
    }
    if (!selectedDistrict) {
      setDistrictError("Kecamatan wajib dipilih");
      hasWilayahError = true;
    }
    if (!selectedVillage) {
      setVillageError("Kelurahan wajib dipilih");
      hasWilayahError = true;
    }
    if (!selectedPostalCode) {
      setPostalCodeError("Kode Pos wajib dipilih");
      hasWilayahError = true;
    }

    if (hasWilayahError) {
      toast.error("Silakan lengkapi pilihan wilayah alamat & kode pos");
      return;
    }

    // Buat payload dengan file dan structured address
    const payload: PayloadAgentSubmission = {
      agentName: formData.agentName,
      ownerName: formData.ownerName,
      noKtp: formData.noKtp || undefined,
      address: formData.addressDetail?.trim() || "",
      province: selectedProvince?.name || "",
      city: selectedRegency?.name || "",
      district: selectedDistrict?.name || "",
      subdistrict: selectedVillage?.name || "",
      postalCode: selectedPostalCode?.name || "",
      picName: formData.picName,
      picPhone: formData.picPhone,
      email: formData.email,
      instagram: formData.instagram || "",
      website: formData.website || "",
      reason: formData.reason || "",
      ktpUrl: ktpFile,
      nibUrl: nibFile || undefined,
      npwpUrl: npwpFile || undefined,
    };

    postAgentSubmission(payload, {
      onSuccess: (data: any) => {
        localStorage.setItem("otpStartTime", String(Date.now()));
        setSubmissionToken(data.submissionToken);
        setIsSubmitForm(true);
      },
      onError: (error: any) => {
        console.error("Error submit form agent submission: ", error);
        console.error("Error response:", error.response?.data);
        toast.error(error.response?.data?.error || error.message || "Gagal Submit Form");
      },
    });
  };

  const handleCloseOtpModal = () => {
    localStorage.removeItem("otpStartTime");
    setIsSubmitForm(false);
  };

  useEffect(() => {
    return () => {
      localStorage.removeItem("otpStartTime");
    };
  }, []);

  const benefits = [
    {
      icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
      title: "Pendapatan Menjanjikan",
      description: "Kompetitif komisi dan bonus pencapaian untuk setiap transaksi",
    },
    {
      icon: <Award className="h-6 w-6 text-blue-600" />,
      title: "Terpercaya & Berlisensi",
      description: "Berizin resmi dan telah dipercaya sejak 2015",
    },
  ];

  const faqs = [
    {
      question: "Berapa lama proses approval?",
      answer: "Proses approval biasanya memakan waktu 1-2 hari kerja setelah dokumen lengkap.",
    },
    {
      question: "Apa saja dokumen yang diperlukan?",
      answer: "KTP wajib diupload. NIB dan NPWP bersifat opsional.",
    },
    {
      question: "Apakah ada biaya pendaftaran?",
      answer: "Tidak! Pendaftaran menjadi agent travel kami GRATIS.",
    },
  ];

  return (
    <>
      {isSubmissionAgentSuccess ? (
        <AgentSubmissionSuccessPage />
      ) : (
        <>
          <main className="min-h-screen bg-linear-to-b from-white to-blue-50">
            {/* Hero Section - Modern Traveller */}
            <section className="relative bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/15 overflow-hidden border-b border-gray-100/50">
              {/* Decorative Elements */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Minimalist wave pattern */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-blue-50/80 via-indigo-50/30 to-transparent"></div>

                {/* Subtle travel pattern */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-50/50 to-transparent"></div>

                {/* Minimalist circles */}
                <div className="absolute top-20 left-10 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-80 h-80 bg-amber-100/25 rounded-full blur-3xl"></div>
              </div>

              <div className="relative max-w-[1024px] 2xl:max-w-[1440px] mx-auto px-5 lg:px-0 py-8 sm:py-16 lg:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
                  {/* Left Content */}
                  <div className="space-y-6 sm:space-y-10 order-2 lg:order-1">
                    {/* Main Heading */}
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                      <span className="text-gray-900">Mulai Karirmu sebagai</span>
                      <br />
                      <span className="relative inline-block mt-2">
                        <span className="relative z-10 text-[#1B75BC] font-black">Travel Agent</span>
                        <span className="absolute bottom-2 left-0 w-full h-3 bg-blue-200/40 rounded-full -z-0"></span>
                      </span>
                      <span className="text-gray-900"> Profesional</span>
                    </h1>

                    {/* Description */}
                    <p className="text-sm sm:text-lg text-gray-600 max-w-lg leading-relaxed font-medium">
                      Bergabung dengan jaringan travel agent terpercaya di Indonesia. Dapatkan akses ke ribuan
                      destinasi, komisi menarik, dan dukungan penuh dari tim profesional kami.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                      <button
                        onClick={() => {
                          document.getElementById("form")?.scrollIntoView({
                            behavior: "smooth",
                          });
                        }}
                        className="group relative inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-6 sm:px-9 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 hover:bg-gray-800 hover:shadow-xl hover:shadow-blue-900/10 hover:-translate-y-0.5 cursor-pointer border border-gray-800"
                      >
                        <span>Daftar Agent</span>
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1.5 transition-transform duration-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </button>

                      <button
                        onClick={() => {
                          document.getElementById("benefits")?.scrollIntoView({
                            behavior: "smooth",
                          });
                        }}
                        className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-6 sm:px-9 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base border border-gray-200 shadow-xs transition-all cursor-pointer duration-300 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5"
                      >
                        <BookOpenText className="size-5 text-gray-500" />
                        <span>Pelajari Selengkapnya</span>
                      </button>
                    </div>

                    {/* Stats & Trust Badges Row */}
                    <div className="flex flex-row items-start sm:items-center gap-5 sm:gap-6 pt-6 border-t border-gray-150">
                      {/* Stats */}
                      {[{ value: "25K+", label: "Agen Aktif", icon: "👥" }].map((stat, idx) => (
                        <div key={idx} className="flex items-center gap-4 shrink-0">
                          <div>
                            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{stat.value}</div>
                            <div className="text-xs sm:text-sm text-gray-500 font-semibold flex items-center gap-1.5 mt-0.5">
                              <span>{stat.icon}</span>
                              <span>{stat.label}</span>
                            </div>
                          </div>
                          {/* Vertical Divider */}
                          <div className="h-10 w-px bg-gray-200 hidden sm:block ml-2"></div>
                        </div>
                      ))}

                      {/* Trust Badges */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-50/80 backdrop-blur-xs border border-emerald-100/50 text-[11px] sm:text-sm font-bold text-emerald-800 transition-all hover:bg-emerald-50 hover:scale-[1.01] cursor-default">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                          <span>Terdaftar Resmi</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-50/80 backdrop-blur-xs border border-blue-100/50 text-[11px] sm:text-sm font-bold text-blue-800 transition-all hover:bg-blue-50 hover:scale-[1.01] cursor-default">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>100% Gratis</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-purple-50/80 backdrop-blur-xs border border-purple-100/50 text-[11px] sm:text-sm font-bold text-purple-800 transition-all hover:bg-purple-50 hover:scale-[1.01] cursor-default">
                          <Handshake className={"w-4.5 h-4.5 sm:w-5 sm:h-5 text-purple-500"} />
                          <span>Support 24/7</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Content - Image/Visual */}
                  <div className="relative order-1 lg:order-2 flex justify-center items-center">
                    {/* Glow behind image */}
                    <div className="absolute w-[85%] h-[85%] bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

                    <div className="relative w-full max-w-lg lg:max-w-none">
                      {/* Decorative abstract shapes */}
                      <div className="absolute -top-6 -left-6 w-24 h-24 bg-amber-400/15 rounded-full blur-xl animate-float"></div>
                      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-400/15 rounded-full blur-xl animate-float delay-1000"></div>

                      {/* Main Image Card */}
                      <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white transition-all duration-500 hover:scale-[1.01] group">
                        <img
                          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1121&q=80"
                          alt="Travel professional with clients"
                          className="w-full h-[260px] sm:h-[450px] lg:h-[500px] object-cover transition-transform duration-700 group-hover:scale-103"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/65 via-transparent to-transparent opacity-85 group-hover:opacity-90 transition-opacity duration-300"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <style jsx>{`
              @keyframes float {
                0%,
                100% {
                  transform: translateY(0px);
                }
                50% {
                  transform: translateY(-12px);
                }
              }

              .animate-float {
                animation: float 4s ease-in-out infinite;
              }

              .delay-1000 {
                animation-delay: 1000ms;
              }
            `}</style>

            {/* Benefits Section */}
            <section id="benefits" className="max-w-[1024px] 2xl:max-w-[1440px] mx-auto px-4 sm:px-5 lg:px-0 py-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900">Mengapa Memilih Kami?</h2>
                <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                  Bergabung sebagai agent travel dan nikmati berbagai keuntungan eksklusif
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                      {benefit.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Form Section */}
            <section id="form" className="max-w-[1024px] 2xl:max-w-[1440px] mx-auto px-4 sm:px-5 lg:px-0 py-5">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Agent Submission Form</h1>
                <p className="text-gray-600 mt-2">Isi formulir berikut untuk menjadi mitra agent travel kami</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <fieldset disabled={isPending}>
                  <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xl shadow-gray-100/40 p-6 sm:p-10 space-y-10 mt-6">
                    {/* Informasi Agent */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 border-b border-gray-150 pb-4">
                        <Building2 className="h-5.5 w-5.5 text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900">Informasi Agent</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nama Agent */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Nama Agent <span className="text-blue-600 ml-1">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Building2 className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              placeholder="PT. Travel Indonesia"
                              className={`
                          block w-full rounded-lg border border-gray-200 pl-10 pr-4 py-3
                          text-gray-900 placeholder-gray-400
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-200
                          ${errors.agentName ? "border-red-500 bg-red-50" : "hover:border-blue-300"}
                        `}
                              {...register("agentName", { required: "Nama Agent wajib diisi" })}
                            />
                          </div>
                          {errors.agentName && (
                            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                              <AlertCircle className="h-4 w-4" />
                              {errors.agentName.message}
                            </p>
                          )}
                        </div>

                        {/* Nama Pemilik */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Nama Pemilik <span className="text-blue-600 ml-1">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              placeholder="John Doe"
                              className={`
                          block w-full rounded-lg border border-gray-200 pl-10 pr-4 py-3
                          text-gray-900 placeholder-gray-400
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-200
                          ${errors.ownerName ? "border-red-500 bg-red-50" : "hover:border-blue-300"}
                        `}
                              {...register("ownerName", { required: "Nama Pemilik wajib diisi" })}
                            />
                          </div>
                          {errors.ownerName && (
                            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                              <AlertCircle className="h-4 w-4" />
                              {errors.ownerName.message}
                            </p>
                          )}
                        </div>

                        {/* Alamat Lengkap & Wilayah Terintegrasi */}
                        <div className="md:col-span-2 space-y-4 pt-2">
                          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                            <MapPin className="h-4.5 w-4.5 text-blue-600" />
                            <label className="block text-sm font-semibold text-gray-800">
                              Alamat Lengkap Kantor / Domisili Agent <span className="text-blue-600 ml-1">*</span>
                            </label>
                          </div>

                          {/* Cascading Dropdowns: 2x2 Grid with Custom SearchableSelect */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* 1. Provinsi */}
                            <SearchableSelect
                              label="Provinsi"
                              required
                              placeholder="-- Pilih Provinsi --"
                              searchPlaceholder="Cari nama provinsi..."
                              options={provinces || []}
                              value={selectedProvince}
                              onChange={(item) => handleProvinceChange(item as Provinsi | null)}
                              isLoading={isLoadingProvinces}
                              isError={isErrorProvinces}
                              onRetry={() => refetchProvinces()}
                              errorMessage={provinceError}
                            />

                            {/* 2. Kabupaten/Kota */}
                            <SearchableSelect
                              label="Kabupaten / Kota"
                              required
                              placeholder="-- Pilih Kabupaten/Kota --"
                              disabledPlaceholder="-- Pilih Provinsi Terlebih Dahulu --"
                              searchPlaceholder="Cari nama kabupaten/kota..."
                              options={regencies || []}
                              value={selectedRegency}
                              onChange={(item) => handleRegencyChange(item as KabupatenKota | null)}
                              disabled={!selectedProvince}
                              isLoading={isLoadingRegencies}
                              isError={isErrorRegencies}
                              onRetry={() => refetchRegencies()}
                              errorMessage={regencyError}
                            />

                            {/* 3. Kecamatan */}
                            <SearchableSelect
                              label="Kecamatan"
                              required
                              placeholder="-- Pilih Kecamatan --"
                              disabledPlaceholder="-- Pilih Kab/Kota Terlebih Dahulu --"
                              searchPlaceholder="Cari nama kecamatan..."
                              options={districts || []}
                              value={selectedDistrict}
                              onChange={(item) => handleDistrictChange(item as Kecamatan | null)}
                              disabled={!selectedRegency}
                              isLoading={isLoadingDistricts}
                              isError={isErrorDistricts}
                              onRetry={() => refetchDistricts()}
                              errorMessage={districtError}
                            />

                            {/* 4. Kelurahan & 5. Kode Pos Side-by-Side */}
                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                              {/* Kelurahan / Desa (3/5 width) */}
                              <div className="sm:col-span-3">
                                <SearchableSelect
                                  label="Kelurahan / Desa"
                                  required
                                  placeholder="-- Pilih Kelurahan/Desa --"
                                  disabledPlaceholder="-- Pilih Kecamatan Dulu --"
                                  searchPlaceholder="Cari kelurahan..."
                                  options={villages || []}
                                  value={selectedVillage}
                                  onChange={(item) => handleVillageChange(item as Kelurahan | null)}
                                  disabled={!selectedDistrict}
                                  isLoading={isLoadingVillages}
                                  isError={isErrorVillages}
                                  onRetry={() => refetchVillages()}
                                  errorMessage={villageError}
                                />
                              </div>

                              {/* Kode Pos (2/5 width) */}
                              <div className="sm:col-span-2">
                                <SearchableSelect
                                  label="Kode Pos"
                                  required
                                  placeholder={
                                    isFetchingPostalCode
                                      ? "Mencari..."
                                      : postalCodeOptions.length > 0
                                      ? "-- Pilih --"
                                      : "-- Menunggu --"
                                  }
                                  disabledPlaceholder="--"
                                  searchPlaceholder="Cari..."
                                  options={postalCodeOptions}
                                  value={selectedPostalCode}
                                  onChange={(item) => {
                                    setSelectedPostalCode(item);
                                    if (item) setPostalCodeError("");
                                  }}
                                  disabled={!selectedVillage || isFetchingPostalCode}
                                  isLoading={isFetchingPostalCode}
                                  errorMessage={postalCodeError}
                                />
                              </div>
                            </div>
                          </div>

                          {/* 6. Detail Alamat (Jalan, No, RT/RW, Patokan) - Full Width */}
                          <div className="space-y-1.5 pt-1">
                            <label className="block text-xs font-medium text-gray-700">
                              Detail Alamat (Nama Jalan, No. Bangunan, RT/RW, Patokan) <span className="text-blue-600">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                placeholder="Contoh: Jl. Sudirman No. 123, RT 01/RW 02, Gedung Graha Lt. 2"
                                className={`
                                  block w-full rounded-lg border border-gray-200 pl-9 pr-4 py-2.5 text-sm
                                  text-gray-900 placeholder-gray-400
                                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                  transition-all duration-200
                                  ${errors.addressDetail ? "border-red-500 bg-red-50" : "hover:border-blue-300"}
                                `}
                                {...register("addressDetail", { required: "Detail alamat wajib diisi" })}
                              />
                            </div>
                            {errors.addressDetail && (
                              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                                <AlertCircle className="h-3.5 w-3.5" />
                                {errors.addressDetail.message}
                              </p>
                            )}
                          </div>

                          {/* Alamat Terformat Preview */}
                          {(selectedProvince || selectedRegency || selectedDistrict || selectedVillage || selectedPostalCode || watch("addressDetail")) && (
                            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg flex items-start gap-2 text-xs text-blue-900">
                              <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold text-blue-950">Pratinjau Alamat Lengkap:</span>
                                <p className="mt-0.5 text-blue-800">
                                  {[
                                    watch("addressDetail")?.trim(),
                                    selectedVillage?.name,
                                    selectedDistrict ? `Kec. ${selectedDistrict.name}` : "",
                                    selectedRegency?.name,
                                    selectedProvince ? `Prov. ${selectedProvince.name}` : "",
                                    selectedPostalCode?.name,
                                  ]
                                    .filter(Boolean)
                                    .join(", ") || "-"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Informasi PIC */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 border-b border-gray-150 pb-4">
                        <User className="h-5.5 w-5.5 text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900">Informasi PIC (Person in Charge)</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nama PIC */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Nama PIC <span className="text-blue-600 ml-1">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              placeholder="Jane Smith"
                              className={`
                          block w-full rounded-lg border border-gray-200 pl-10 pr-4 py-3
                          text-gray-900 placeholder-gray-400
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-200
                          ${errors.picName ? "border-red-500 bg-red-50" : "hover:border-blue-300"}
                        `}
                              {...register("picName", { required: "Nama PIC wajib diisi" })}
                            />
                          </div>
                          {errors.picName && (
                            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                              <AlertCircle className="h-4 w-4" />
                              {errors.picName.message}
                            </p>
                          )}
                        </div>

                        {/* No. Telepon PIC */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            No. Telepon PIC <span className="text-blue-600 ml-1">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Phone className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              placeholder="0812xxxxxx"
                              maxLength={13}
                              inputMode="numeric"
                              className={`
                                block w-full rounded-lg border border-gray-200 pl-10 pr-4 py-3
                                text-gray-900 placeholder-gray-400
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                transition-all duration-200
                                ${errors.picPhone ? "border-red-500 bg-red-50" : "hover:border-blue-300"}
                              `}
                              onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
                              }}
                              {...register("picPhone", {
                                required: "No. Telepon PIC wajib diisi",
                                pattern: {
                                  value: /^08\d{8,11}$/,
                                  message: "Nomor HP harus diawali 08 dan 10–13 digit",
                                },
                              })}
                            />
                          </div>
                          {errors.picPhone && (
                            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                              <AlertCircle className="h-4 w-4" />
                              {errors.picPhone.message}
                            </p>
                          )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Email <span className="text-blue-600 ml-1">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="email"
                              placeholder="agent@example.com"
                              className={`
                          block w-full rounded-lg border border-gray-200 pl-10 pr-4 py-3
                          text-gray-900 placeholder-gray-400
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-200
                          ${errors.email ? "border-red-500 bg-red-50" : "hover:border-blue-300"}
                        `}
                              {...register("email", {
                                required: "Email wajib diisi",
                                pattern: {
                                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                  message: "Email tidak valid",
                                },
                              })}
                            />
                          </div>
                          {errors.email && (
                            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                              <AlertCircle className="h-4 w-4" />
                              {errors.email.message}
                            </p>
                          )}
                        </div>

                        {/* Instagram (opsional) */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Instagram <span className="text-xs text-gray-500 ml-2 font-normal">(opsional)</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Instagram className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              placeholder="@agent.travel"
                              className="block w-full rounded-lg border border-gray-200 pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                              {...register("instagram")}
                            />
                          </div>
                        </div>

                        {/* Website (opsional) */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Website <span className="text-xs text-gray-500 ml-2 font-normal">(opsional)</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Globe className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              placeholder="www.agenttravel.com"
                              className="block w-full rounded-lg border border-gray-200 pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                              {...register("website")}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Informasi Tambahan - Dokumen */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 border-b border-gray-150 pb-4">
                        <Upload className="h-5.5 w-5.5 text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900">Upload Dokumen Pendukung</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Upload KTP (Wajib) */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Foto / Scan KTP <span className="text-blue-600 ml-1">*</span>
                          </label>
                          <div className="relative group">
                            <div className="absolute -inset-0.5 bg-linear-to-r from-blue-600 to-green-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
                            <div
                              className={`relative bg-white rounded-xl border-2 transition-all duration-300 group-hover:border-blue-300 ${ktpError ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                            >
                              {!ktpFile ? (
                                <div className="p-6">
                                  <div className="flex flex-col items-center justify-center gap-3">
                                    <div className="p-3 bg-blue-50 rounded-full">
                                      <Upload className="h-6 w-6 text-blue-500" />
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs font-semibold text-gray-700">KTP (Wajib)</p>
                                      <p className="text-[10px] text-gray-500 mt-1">PDF, DOC, DOCX, Gambar (maks 5MB)</p>
                                    </div>
                                    <input
                                      type="file"
                                      id="ktp-file"
                                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                                      onChange={(e) => handleFileChange(e, "ktp")}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-50 rounded-lg">
                                      <File className="h-6 w-6 text-red-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-gray-900 truncate">{ktpFile.name}</p>
                                      <p className="text-[10px] text-gray-500">{formatFileSize(ktpFile.size)}</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFile("ktp")}
                                      className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          {ktpError && (
                            <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                              <FileWarning className="h-3.5 w-3.5" />
                              {ktpError}
                            </p>
                          )}
                        </div>

                        {/* Upload NIB (Opsional jika PT) */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            File NIB <span className="text-xs text-gray-500 ml-1">(Opsional jika PT)</span>
                          </label>
                          <div className="relative group">
                            <div className="absolute -inset-0.5 bg-linear-to-r from-blue-600 to-green-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
                            <div
                              className={`relative bg-white rounded-xl border-2 transition-all duration-300 group-hover:border-blue-300 ${nibError ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                            >
                              {!nibFile ? (
                                <div className="p-6">
                                  <div className="flex flex-col items-center justify-center gap-3">
                                    <div className="p-3 bg-blue-50 rounded-full">
                                      <Upload className="h-6 w-6 text-blue-500" />
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs font-semibold text-gray-700">NIB (Opsional)</p>
                                      <p className="text-[10px] text-gray-500 mt-1">PDF, DOC, DOCX, Gambar (maks 5MB)</p>
                                    </div>
                                    <input
                                      type="file"
                                      id="nib-file"
                                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                                      onChange={(e) => handleFileChange(e, "nib")}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-50 rounded-lg">
                                      <File className="h-6 w-6 text-red-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-gray-900 truncate">{nibFile.name}</p>
                                      <p className="text-[10px] text-gray-500">{formatFileSize(nibFile.size)}</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFile("nib")}
                                      className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          {nibError && (
                            <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                              <FileWarning className="h-3.5 w-3.5" />
                              {nibError}
                            </p>
                          )}
                        </div>

                        {/* Upload NPWP (Opsional) */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            File NPWP <span className="text-xs text-gray-500 ml-1">(Opsional)</span>
                          </label>
                          <div className="relative group">
                            <div className="absolute -inset-0.5 bg-linear-to-r from-blue-600 to-green-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
                            <div
                              className={`relative bg-white rounded-xl border-2 transition-all duration-300 group-hover:border-blue-300 ${npwpError ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                            >
                              {!npwpFile ? (
                                <div className="p-6">
                                  <div className="flex flex-col items-center justify-center gap-3">
                                    <div className="p-3 bg-blue-50 rounded-full">
                                      <Upload className="h-6 w-6 text-blue-500" />
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs font-semibold text-gray-700">NPWP (Opsional)</p>
                                      <p className="text-[10px] text-gray-500 mt-1">PDF, DOC, DOCX, Gambar (maks 5MB)</p>
                                    </div>
                                    <input
                                      type="file"
                                      id="npwp-file"
                                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                                      onChange={(e) => handleFileChange(e, "npwp")}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-50 rounded-lg">
                                      <File className="h-6 w-6 text-red-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-gray-900 truncate">{npwpFile.name}</p>
                                      <p className="text-[10px] text-gray-500">{formatFileSize(npwpFile.size)}</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFile("npwp")}
                                      className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          {npwpError && (
                            <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                              <FileWarning className="h-3.5 w-3.5" />
                              {npwpError}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Persyaratan Dokumen:
                        </h4>
                        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                          <li>KTP wajib diupload. NIB dan NPWP bersifat opsional.</li>
                          <li>Format file yang didukung: PDF, DOC, DOCX, JPG, JPEG, PNG</li>
                          <li>Ukuran maksimal masing-masing file: 5MB</li>
                        </ul>
                      </div>
                    </div>

                    {/* Divider */}
                    <hr className="border-gray-150" />

                    {/* Turnstile and Submit Button */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-7 pt-2">
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

                      <div className="w-full md:w-60">
                        <button
                          type="submit"
                          disabled={!isCaptchaDone && !isLocal}
                          className={` w-full
                        px-8 py-4 bg-linear-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg
                        shadow-lg shadow-blue-200
                        transition-all duration-200 cursor-pointer
                        ${isPending ? "opacity-50 cursor-not-allowed" : "hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"}
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      `}
                        >
                          {isPending ? (
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Mengirim...</span>
                            </div>
                          ) : (
                            "Kirim Pendaftaran"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </form>
            </section>

            {/* FAQ Section */}
            <section className="max-w-[1024px] 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Pertanyaan Umum</h2>
                  <p className="text-gray-600 mt-2">Temukan jawaban untuk pertanyaan yang sering diajukan</p>
                </div>

                <div className="max-w-2xl mx-auto space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border border-gray-100 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-blue-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        <ArrowRight
                          className={`h-5 w-5 text-blue-600 transition-transform ${activeFaq === index ? "rotate-90" : ""}`}
                        />
                      </button>
                      {activeFaq === index && <div className="px-6 py-4 bg-blue-50 text-gray-600">{faq.answer}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>

          {isSubmitForm && (
            <ModalOTP
              length={6}
              mode="submission-agent"
              email={email}
              onClose={handleCloseOtpModal}
              isVerifying={verifyOtpMutation.isPending}
              isResending={resendOtpMutation.isPending}
              onVerify={(payload) => verifyOtpMutation.mutateAsync(payload)}
              onResend={(payload) => resendOtpMutation.mutateAsync(payload)}
              submissionToken={submissionToken}
              setIsSubmissionAgentSuccess={setIsSubmissionAgentSuccess}
            />
          )}
        </>
      )}
    </>
  );
}
