/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useDocumentationLink } from "@/features/feedbacks/hooks/useFeedback";
import { useEffect, useState } from "react";

export interface FeedbackData {
  tourLeaderRating: number;
  tourLeaderServiceRating: number;
  facilityRating: number;
  itineraryRating: number;
  documentationRating: number;
  comment: string;
}

interface FeedbackProps {
  bookingId: number;
  feedback?: FeedbackData;
}

export default function FeedbackSection({ bookingId, feedback }: FeedbackProps) {
  const { data, isLoading } = useDocumentationLink(bookingId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!feedback) return null;
  // Calculate average rating
  const averageRating = (
    (feedback.tourLeaderRating +
      feedback.tourLeaderServiceRating +
      feedback.facilityRating +
      feedback.itineraryRating +
      feedback.documentationRating) /
    5
  ).toFixed(1);

  // Render stars
  const Stars = ({ rating }: { rating: number }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-amber-400 fill-current" : "text-gray-200 fill-current"}`}
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <div className="w-1 h-5 bg-linear-to-b from-blue-600 to-blue-400 rounded-full"></div>
            Feedback Anda
          </h2>
        </div>

        {/* Average Rating */}
        <div className="bg-linear-to-br from-amber-50 to-amber-100 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">{averageRating}</div>
              <Stars rating={Math.round(parseFloat(averageRating))} />
              <p className="text-xs text-gray-600 mt-1">Rating Rata-rata</p>
            </div>
            <div className="flex-1 space-y-1.5 text-sm">
              <div className="flex flex-col justify-between">
                <span className="text-gray-600">Penampilan Tour Leader</span>
                <div className="flex items-center gap-2">
                  <Stars rating={feedback.tourLeaderRating} />
                </div>
              </div>
              <div className="flex flex-col justify-between">
                <span className="text-gray-600">Pelayanan Tour Leader</span>
                <div className="flex items-center gap-2">
                  <Stars rating={feedback.tourLeaderServiceRating} />
                </div>
              </div>
              <div className="flex flex-col justify-between">
                <span className="text-gray-600">Fasilitas</span>
                <div className="flex items-center gap-2">
                  <Stars rating={feedback.facilityRating} />
                </div>
              </div>
              <div className="flex flex-col justify-between">
                <span className="text-gray-600">Itinerary</span>
                <div className="flex items-center gap-2">
                  <Stars rating={feedback.tourLeaderRating} />
                </div>
              </div>
              <div className="flex flex-col justify-between">
                <span className="text-gray-600">Pengalaman Dokumentasi</span>
                <div className="flex items-center gap-2">
                  <Stars rating={feedback.tourLeaderRating} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comment */}
        {feedback.comment && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-700 italic">&quot;{feedback.comment.trim()}&quot;</p>
          </div>
        )}

        {/* Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-linear-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Lihat Dokumentasi
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 px-5 flex items-center justify-center h-full bg-black/50 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-linear-to-r from-blue-600 to-blue-500 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Dokumentasi Trip</h3>
                <p className="text-blue-100 text-sm">link dokumentasi</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - List of Links */}
            <div className="p-5">
              <div className="space-y-2">
                {data?.documentationLinks.map((doc, index) => {
                  const link = doc.startsWith("http") ? doc : `https://${doc}`;
                  return (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{`Dokumentasi ${index + 1}`}</p>
                          <p className="text-xs text-gray-500 truncate">{link}</p>
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors shrink-0 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-gray-50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
