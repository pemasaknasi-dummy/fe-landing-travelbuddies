/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";
import { RatingFields } from "./RatingField";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useCreateFeedback, useShowBookingFeedback } from "@/features/feedbacks/hooks/useFeedback";

export const FeedbackForm = ({
  isPage = false,
  id,
  handleClose,
}: {
  isPage?: boolean;
  id: number;
  handleClose?: () => void;
}) => {
  const { data: feedbackData, isLoading: loadingFeedback } = useShowBookingFeedback(id);
  const createFeedbackMutation = useCreateFeedback();
  const [finishSubmit, setFinishSubmit] = useState<boolean>(false);

  const [ratings, setRatings] = useState({
    tourLeaderRating: 0,
    tourLeaderServiceRating: 0,
    facilityRating: 0,
    itineraryRating: 0,
    documentationRating: 0,
  });

  const [comment, setComment] = useState("");

  const isFilledAll = Object.values(ratings).every((rating) => rating > 0) && comment.trim() !== "";

  const handleRatingChange = (field: any, rating: number) => {
    setRatings((prev) => ({
      ...prev,
      [field]: rating,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFilledAll) {
      toast.error("Semua fields wajib diisi");
      return;
    }

    const payload = {
      ...ratings,
      comment,
      bookingId: id,
      type: "website",
    };

    createFeedbackMutation.mutateAsync(payload, {
      onSuccess: (data) => {
        setFinishSubmit(true);
      },
      onError: (error: any) => {
        console.error("Error create feedback: ", error);
        toast.error("Gagal membuat feedback");
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
  return (
    <>
      <div className="w-full max-w-[1028px] 2xl:max-w-[1440px] mx-auto px-0">
        {/* Hero / intro section */}
        <div className="px-4 sm:px-5 lg:px-0 py-4 sm:py-5">
          {isPage && (
            <Link
              href={`/booking/${id}`}
              className="inline-flex mb-3 items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-semibold">Kembali ke detail booking</span>
            </Link>
          )}

          {/* Blue banner */}
          <div className="p-4 sm:p-5 bg-blue-50 rounded-xl space-y-2 sm:space-y-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              Bantu kami jadi lebih baik
            </h1>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Hai Buddies! 🌴 <br />
              Liburannya seru kan? Yuk, bantu Travel Buddies berkembang dengan kasih review singkat tentang trip kamu
              kemarin. Setelah isi review, kamu bakal dapat link foto liburanmu! ✨
            </p>
          </div>
        </div>

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
                <label className="order-1 font-bold text-sm sm:text-base">Open Trip</label>
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
                <label className="order-1 font-bold text-sm sm:text-base">Private Trip</label>
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
            <label htmlFor="location" className="font-bold text-base sm:text-lg block mb-2">
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
            <label htmlFor="date" className="font-bold text-base sm:text-lg block mb-2">
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
            <RatingFields ratings={ratings} onRatingChange={handleRatingChange} isPage={isPage} isFeedbackFilled={false} />
          </div>

          {/* Comment */}
          <div className="space-y-2 mb-6 sm:mb-8 px-4 sm:px-5 lg:px-0">
            <label htmlFor="comment" className="block text-sm sm:text-base font-semibold text-gray-800">
              Kritik dan Saran
            </label>
            <textarea
              id="comment"
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Saran isi disini"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all
                        resize-none text-sm sm:text-base text-gray-700 placeholder:text-gray-400"
            />
          </div>

          {/* Submit button */}
          <div className="px-4 sm:px-5 lg:px-0">
            <button
              type="submit"
              disabled={!isFilledAll || loadingFeedback}
              className="w-full sm:w-auto sm:min-w-[260px] bg-blue-500 text-white font-semibold
                        py-3.5 sm:py-4 px-6 rounded-xl shadow-lg hover:shadow-xl
                        transform hover:-translate-y-0.5 transition-all duration-200
                        text-sm sm:text-base lg:text-lg cursor-pointer
                        disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
            >
              Kirim Jawaban
            </button>
          </div>
        </form>
      </div>

      {/* Success modal */}
      {finishSubmit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999] px-4">
          <div className="bg-white w-full max-w-[340px] sm:max-w-md mx-auto rounded-3xl py-8 sm:py-10 overflow-hidden">
            <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 text-center px-6">
              <Heart size={72} className="sm:w-[90px] sm:h-[90px]" fill="#FF52A1" stroke="#FF52A1" />
              <h4 className="font-bold text-gray-600 text-2xl sm:text-3xl">Makasih Ya</h4>
            </div>

            <div className="px-6 sm:px-10 mt-3 text-center">
              <p className="font-semibold text-gray-500 text-base sm:text-xl">
                Masukan kamu bantu Travel Buddies jadi lebih baik
              </p>
            </div>

            <div className="px-5 mt-5">
              <Link
                href={`/booking/${id}`}
                onClick={handleClose}
                className="block text-center w-full py-3 rounded-lg shadow-lg shadow-gray-200
                            bg-[#FE5E00] text-white font-bold text-sm sm:text-base hover:bg-orange-600 transition-colors"
              >
                Kembali
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
