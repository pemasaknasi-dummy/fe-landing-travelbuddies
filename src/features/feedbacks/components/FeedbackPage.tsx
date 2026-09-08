/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Camera, Check, ExternalLink, Heart, Smartphone, User, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  useCreateFeedback,
  useCreatePublicFeedback,
  useDetailFeedback,
  usePublicDetailFeedback,
  useVerifyParticipant,
} from "@/features/feedbacks/hooks/useFeedback";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { RatingFields } from "@/components/sections/RatingField";
import { SpinnerLoading } from "@/components/sections/SpinnerLoading";
import NotFoundCard from "@/components/sections/NotFoundCard";
import { useAuth } from "@/context/AuthContext";
import { VerifyParticipantResponse } from "@/features/feedbacks/api/feedback-api";

export interface Rating {
  tourLeaderRating: number;
  tourLeaderServiceRating: number;
  facilityRating: number;
  itineraryRating: number;
  documentationRating: number;
}

export interface FeedbackPageProps {
  mode: "booking" | "participant";
}

export default function FeedbackPage({ mode }: FeedbackPageProps) {
  const router = useRouter();
  const params = useParams();
  const { isAuth, isReady: authReady } = useAuth();

  const [verifiedBookingId, setVerifiedBookingId] = useState<number | null>(
    null,
  );
  const [selectedParticipantId, setSelectedParticipantId] = useState<
    number | null
  >(null);
  const [phoneSuffix, setPhoneSuffix] = useState("");
  const [matches, setMatches] = useState<VerifyParticipantResponse[]>([]);
  const [selectedParticipant, setSelectedParticipant] =
    useState<VerifyParticipantResponse | null>(null);
  const [showSelection, setShowSelection] = useState(false);

  // Authenticated flow uses params.id as bookingId (if mode is booking)
  // Public flow uses verifiedBookingId
  const currentBookingId =
    mode === "booking" && isAuth ? Number(params?.id) : verifiedBookingId;

  const {
    data: authFeedbackData,
    isLoading: loadingAuth,
    isError: isErrorAuth,
  } = useDetailFeedback(
    mode === "booking" && isAuth ? Number(params?.id) : undefined,
  );
  const {
    data: publicFeedbackData,
    isLoading: loadingPublic,
    isError: isErrorPublic,
  } = usePublicDetailFeedback(
    mode === "participant" || !isAuth
      ? (verifiedBookingId ?? undefined)
      : undefined,
    selectedParticipantId ?? undefined,
  );
  
  const verifyMutation = useVerifyParticipant();
  const createFeedbackMutation = useCreateFeedback();
  const createPublicFeedbackMutation = useCreatePublicFeedback();

  const feedbackData =
    mode === "booking" && isAuth ? authFeedbackData : publicFeedbackData;
  const isLoading = mode === "booking" && isAuth ? loadingAuth : loadingPublic;
  const isError = mode === "booking" && isAuth ? isErrorAuth : isErrorPublic;

  const isFeedbackFilled = !!feedbackData?.feedback;

  const [finishSubmit, setFinishSubmit] = useState<boolean>(false);

  const [draftRatings, setDraftRatings] = useState<Rating | null>(null);
  const ratings = draftRatings ?? {
    tourLeaderRating: Number(feedbackData?.feedback?.tourLeaderRating ?? 0),
    tourLeaderServiceRating: Number(
      feedbackData?.feedback?.tourLeaderServiceRating ?? 0,
    ),
    facilityRating: Number(feedbackData?.feedback?.facilityRating ?? 0),
    itineraryRating: Number(feedbackData?.feedback?.itineraryRating ?? 0),
    documentationRating: Number(
      feedbackData?.feedback?.documentationRating ?? 0,
    ),
  };

  const [comment, setComment] = useState("");

  const isFilledAll =
    Object.values(ratings).every((rating) => rating > 0) &&
    comment.trim() !== "";

  const handleRatingChange = (field: any, value: number) => {
    setDraftRatings((prev) => ({
      ...(prev ?? ratings),
      [field]: value,
    }));
  };

  const handleVerify = async () => {
    if (phoneSuffix.length < 5) {
      toast.error("Masukan minimal 5 digit terakhir nomor HP");
      return;
    }

    try {
      const results = await verifyMutation.mutateAsync({
        tripDateId: Number(params.id), // In participant mode, params.id is tripDateId
        phone: phoneSuffix,
      });

      setMatches(results);
      setShowSelection(true);
    } catch (error: any) {
      toast.error(error?.message || "Gagal melakukan verifikasi");
    }
  };

  const handleSelectParticipant = (match: VerifyParticipantResponse) => {
    if (match.isFeedbackFilled) {
      // Don't block — the UI will show documentation links instead
      return;
    }
    setVerifiedBookingId(match.bookingId);
    setSelectedParticipantId(match.participantId);
    setSelectedParticipant(match);
    setShowSelection(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("submitted");
    if (!isFilledAll) {
      toast.error("Semua fields wajib diisi");
      return;
    }

    const payload = {
      ...ratings,
      comment,
      bookingId: currentBookingId!,
      participantId: selectedParticipantId ?? undefined,
      type: "website",
    };

    const mutation =
      mode === "booking" && isAuth
        ? createFeedbackMutation
        : createPublicFeedbackMutation;

    mutation.mutateAsync(payload, {
      onSuccess: () => {
        setFinishSubmit(true);
      },
      onError: (err: any) => {
        console.log(err, "log: error");
        console.error("Error create feedback: ", err);
        toast.error(err?.response?.data?.error || "Gagal membuat feedback");
      },
    });
  };

  useEffect(() => {
    if (finishSubmit) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [finishSubmit]);

  if (!authReady) return <SpinnerLoading />;

  if (mode === "booking" && isAuth && isLoading) return <SpinnerLoading />;

  // If not authenticated and not verified, show verification form
  // OR if in participant mode and not verified yet
  if ((mode === "participant" || !isAuth) && !verifiedBookingId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 space-y-6">
          {/* Blue Info Box */}
          <div className="bg-blue-50/70 border border-blue-100 p-5 rounded-2xl space-y-2">
            <h2 className="text-blue-900 font-bold text-lg">
              Masukan nomor handphone untuk verifikasi
            </h2>
            <p className="text-blue-700/80 text-sm leading-relaxed">
              Gunakan nomor handphone yang kamu daftarkan sebagai peserta di
              Travel Buddies.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block text-gray-800 font-bold">
              Masukan 5 digit terakhir no HP mu
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 transition-transform group-focus-within:scale-110">
                <Smartphone className="w-5 h-5" />
              </div>
              <input
                type="text"
                maxLength={5}
                value={phoneSuffix}
                onChange={(e) =>
                  setPhoneSuffix(e.target.value.replace(/\D/g, ""))
                }
                placeholder="12345"
                className="w-full h-14 pl-12 pr-4 bg-white border-2 border-gray-100 rounded-2xl text-lg font-semibold
                  focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-300"
              />
            </div>
            <p className="text-xs text-gray-400 pl-1 italic">
              *Hanya angka, contoh: 12345
            </p>
          </div>

          <button
            onClick={handleVerify}
            disabled={phoneSuffix.length < 5 || verifyMutation.isPending}
            className="cursor-pointer w-full h-14 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {verifyMutation.isPending ? "Verifikasi..." : "Verifikasi Sekarang"}
          </button>
        </main>

        {/* Selection Modal */}
        {showSelection && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Periksa data berikut ini
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Pastikan data tersebut benar untuk keperluan pengisian
                    feedback.
                  </p>
                </div>
                <button
                  onClick={() => setShowSelection(false)}
                  className="cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {matches?.map((match) => (
                  <div
                    key={match?.participantId}
                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-blue-500 transition-colors group"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                        <User className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-blue-900">
                        Data Peserta
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                      <div>
                        <p className="text-gray-400 font-medium mb-1 uppercase tracking-wider text-[10px]">
                          Nama
                        </p>
                        <p className="font-bold text-gray-900 truncate">
                          {match?.participantName}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-medium mb-1 uppercase tracking-wider text-[10px]">
                          Destinasi
                        </p>
                        <p className="font-bold text-gray-900 truncate">
                          {match?.tripTitle}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-medium mb-1 uppercase tracking-wider text-[10px]">
                          Tanggal Trip
                        </p>
                        <p className="font-bold text-gray-900">
                          {dayjs(match?.tripDate).format("DD MMMM YYYY")}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-medium mb-1 uppercase tracking-wider text-[10px]">
                          No Hp
                        </p>
                        <p className="font-bold text-gray-900">
                          {match?.phoneMasked}
                        </p>
                      </div>
                    </div>

                    {match?.isFeedbackFilled ? (
                      <div className="mt-6 space-y-3">
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg px-3 py-2">
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-semibold">Feedback Sudah Diisi</span>
                        </div>
                        {match?.documentationLink && match?.documentationLink.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-500 font-medium">📸 Link Dokumentasi:</p>
                            {match?.documentationLink?.map((doc, idx) => {
                              const link = doc.startsWith("http") ? doc : `https://${doc}`;
                              return (
                                <a
                                  key={idx}
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 hover:border-blue-400 transition-all group"
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Camera className="w-4 h-4 text-blue-500 shrink-0" />
                                    <span className="font-semibold text-blue-700 text-sm truncate">
                                      Dokumentasi {idx + 1}
                                    </span>
                                  </div>
                                  <ExternalLink className="w-4 h-4 text-blue-400 group-hover:text-blue-600 shrink-0 ml-2" />
                                </a>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">
                            Link dokumentasi belum tersedia
                          </p>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSelectParticipant(match)}
                        className="cursor-pointer w-full mt-6 h-11 rounded-xl font-bold transition-all border-2 bg-white border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                      >
                        Pilih Data ini
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isError) {
    return (
      <NotFoundCard
        mainHeading="Feedback Tidak Ditemukan"
        subHeading="Maaf, feedback form tidak dapat ditemukan"
        redirect="/profile"
        redirectButtonText="Lihat riwayat booking"
      />
    );
  }

  if (isLoading) return <SpinnerLoading />;

  return (
    <div>
      {/* Header: full-bleed sticky bar */}
      <header className="bg-white sticky top-0 z-50 py-3 px-5 sm:px-5 lg:px-0 border-b border-gray-100 shadow-sm">
        <div className="flex items-center max-w-[1028px] 2xl:max-w-[1440px] mx-auto">
          <Link href={"/"}>
            <Image
              src={"/images/logo/logo.png"}
              alt="tb-logo"
              width={130}
              height={50}
              className="w-[90px] h-auto sm:w-[110px] md:w-[130px] md:h-[50px]"
            />
          </Link>
        </div>
      </header>

      <div className="w-full max-w-[1028px] 2xl:max-w-[1440px] mx-auto px-0">
        {/* Hero / intro section */}
        <div className="px-4 sm:px-5 lg:px-0 py-4 sm:py-5">
          {/* Back link */}
          <Link
            href={
              mode === "booking" && isAuth
                ? `/booking/${currentBookingId}`
                : "/"
            }
            className="inline-flex mb-3 items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold">
              {mode === "booking" && isAuth
                ? "Kembali ke detail booking"
                : "Kembali ke Beranda"}
            </span>
          </Link>

          {/* Blue banner */}
          <div className="p-4 sm:p-5 bg-blue-50 rounded-xl space-y-2 sm:space-y-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              Bantu kami jadi lebih baik
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Hai Buddies! 🌴 <br />
              Liburannya seru kan? Yuk, bantu Travel Buddies berkembang dengan
              kasih review singkat tentang trip kamu kemarin. Setelah isi
              review, kamu bakal dapat link foto liburanmu! ✨
            </p>
          </div>
        </div>

        {/* Participant Data Card - Participant Mode Only */}
        {mode === "participant" && selectedParticipant && (
          <div className="px-4 sm:px-5 lg:px-0 mb-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                  <User className="w-5 h-5" />
                </div>
                <span className="font-bold text-blue-900">Data Peserta</span>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div>
                  <p className="text-gray-400 font-medium mb-1 uppercase tracking-wider text-[10px]">
                    Nama
                  </p>
                  <p className="font-bold text-gray-900 truncate">
                    {selectedParticipant?.participantName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium mb-1 uppercase tracking-wider text-[10px]">
                    Destinasi
                  </p>
                  <p className="font-bold text-gray-900 truncate">
                    {selectedParticipant?.tripTitle}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium mb-1 uppercase tracking-wider text-[10px]">
                    Tanggal Trip
                  </p>
                  <p className="font-bold text-gray-900">
                    {dayjs(selectedParticipant?.tripDate).format("DD MMMM YYYY")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium mb-1 uppercase tracking-wider text-[10px]">
                    No Hp
                  </p>
                  <p className="font-bold text-gray-900">
                    {selectedParticipant?.phoneMasked}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trip detail fields */}
        <div className="px-4 sm:px-5 lg:px-0 space-y-5 pb-2">
          {/* Trip type */}
          <div className="space-y-2">
            <h2 className="font-bold text-base sm:text-lg">Jenis Trip</h2>
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Open Trip */}
              <div
                className={`flex items-center gap-x-2 py-2.5 sm:py-3 px-4 sm:px-5 rounded-md w-full
                  ${feedbackData?.trip?.type === "open" ? "bg-white ring-1 ring-gray-400" : "bg-gray-200 opacity-65 text-gray-500"}`}
              >
                <label className="order-1 font-bold text-sm sm:text-base">
                  Open Trip
                </label>
                <input
                  type="radio"
                  checked={feedbackData?.trip?.type === "open"}
                  readOnly
                  className="size-4 sm:size-5"
                />
              </div>

              {/* Private Trip */}
              <div
                className={`flex items-center gap-x-2 py-2.5 sm:py-3 px-4 sm:px-5 rounded-md w-full
                  ${feedbackData?.trip?.type === "private" ? "bg-white ring-1 ring-gray-500" : "bg-gray-200 opacity-65 text-gray-500"}`}
              >
                <label className="order-1 font-bold text-sm sm:text-base">
                  Private Trip
                </label>
                <input
                  type="radio"
                  checked={feedbackData?.trip?.type === "private"}
                  readOnly
                  className="size-4 sm:size-5"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="font-bold text-base sm:text-lg block mb-2"
            >
              Lokasi Trip
            </label>
            <input
              type="text"
              name="location"
              id="location"
              value={feedbackData?.trip?.title ?? "-"}
              disabled
              className="w-full h-11 sm:h-12 px-4 sm:px-5 bg-gray-200 rounded-lg font-semibold text-gray-600 text-sm sm:text-base"
            />
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="font-bold text-base sm:text-lg block mb-2"
            >
              Tanggal Trip
            </label>
            <input
              type="text"
              name="date"
              id="date"
              disabled
              value={dayjs(feedbackData?.tripDate?.date).format("DD MMM YYYY")}
              className="w-full h-11 sm:h-12 px-4 sm:px-5 bg-gray-200 rounded-lg font-semibold text-gray-600 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="pb-10">
          {/* Rating fields — RatingFields handles its own internal padding */}
          <div className="mt-2">
            <RatingFields
              ratings={ratings}
              onRatingChange={handleRatingChange}
              isFeedbackFilled={isFeedbackFilled}
              isPage={true}
            />
          </div>

          {/* Comment */}
          <div className="space-y-2 mb-6 sm:mb-8 px-4 sm:px-5 lg:px-0">
            <label
              htmlFor="comment"
              className="block text-sm sm:text-base font-semibold text-gray-800"
            >
              Kritik dan Saran
            </label>
            <textarea
              id="comment"
              rows={5}
              value={feedbackData?.feedback?.comment ?? comment}
              readOnly={isFeedbackFilled}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Saran isi disini"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all
                resize-none text-sm sm:text-base text-gray-700 placeholder:text-gray-400 read-only:cursor-not-allowed read-only:outline-none read-only:ring-0 read-only:focus:ring-0 read-only:bg-gray-200/70"
            />
          </div>

          {/* Submit button */}
          {!isFeedbackFilled && (
            <div className="px-4 sm:px-5 lg:px-0">
              <button
                type="submit"
                disabled={
                  !isFilledAll ||
                  isLoading ||
                  createFeedbackMutation.isPending ||
                  createPublicFeedbackMutation.isPending
                }
                className="w-full sm:w-auto sm:min-w-[260px] bg-blue-500 text-white font-semibold
                py-3.5 sm:py-4 px-6 rounded-xl shadow-lg hover:shadow-xl
                transform hover:-translate-y-0.5 transition-all duration-200
                text-sm sm:text-base lg:text-lg cursor-pointer
                disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
              >
                {createFeedbackMutation.isPending ||
                  createPublicFeedbackMutation.isPending
                  ? "Mengirim..."
                  : "Kirim Jawaban"}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Success modal */}
      {finishSubmit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999] px-4">
          <div className="bg-white w-full max-w-[340px] sm:max-w-md mx-auto rounded-3xl py-8 sm:py-10 overflow-hidden">
            <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 text-center px-6">
              <Heart
                size={72}
                className="sm:w-[90px] sm:h-[90px]"
                fill="#FF52A1"
                stroke="#FF52A1"
              />
              <h4 className="font-bold text-gray-600 text-2xl sm:text-3xl">
                Makasih Ya
              </h4>
            </div>

            <div className="px-6 sm:px-10 mt-3 text-center">
              <p className="font-semibold text-gray-500 text-base sm:text-xl">
                Masukan kamu bantu Travel Buddies jadi lebih baik
              </p>
            </div>

            {/* Documentation Links */}
            {(() => {
              const docLinks: string[] =
                feedbackData?.tripDate?.documentationLink && feedbackData.tripDate.documentationLink.length > 0
                  ? feedbackData.tripDate.documentationLink
                  : selectedParticipant?.documentationLink && selectedParticipant.documentationLink.length > 0
                    ? selectedParticipant.documentationLink
                    : [];

              if (docLinks.length > 0) {
                return (
                  <div className="px-5 mt-5 space-y-2">
                    <p className="text-sm font-semibold text-gray-600 text-center">
                      📸 Yuk lihat dokumentasi trip kamu!
                    </p>
                    {docLinks.map((doc: string, idx: number) => {
                      const link = doc.startsWith("http") ? doc : `https://${doc}`;
                      return (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 hover:border-blue-400 transition-all group"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Camera className="w-5 h-5 text-blue-500 shrink-0" />
                            <span className="font-semibold text-blue-700 text-sm truncate">
                              Dokumentasi {idx + 1}
                            </span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-blue-400 group-hover:text-blue-600 shrink-0 ml-2" />
                        </a>
                      );
                    })}
                  </div>
                );
              }

              return (
                <div className="px-5 mt-5 text-center">
                  <p className="text-xs text-gray-400 italic">
                    Link dokumentasi belum tersedia
                  </p>
                </div>
              );
            })()}

            <div className="px-5 mt-5">
              <Link
                href={
                  mode === "booking" && isAuth
                    ? `/booking/${currentBookingId}`
                    : "/"
                }
                className="block text-center w-full py-3 rounded-lg shadow-lg shadow-gray-200
                  bg-[#FE5E00] text-white font-bold text-sm sm:text-base hover:bg-orange-600 transition-colors"
              >
                Kembali
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}