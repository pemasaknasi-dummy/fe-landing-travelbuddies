import Link from "next/link";

interface Props {
  mainHeading: string;
  subHeading: string;
  redirect: string;
  redirectButtonText: string;
}

export default function NotFoundCard({ mainHeading, subHeading, redirect, redirectButtonText }: Props) {
  return (
    <div className="flex items-center justify-center p-4 sm:p-6 overflow-hidden min-h-screen">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main content */}
      <div className={`relative max-w-2xl w-full transition-all duration-1000 transform`}>
        {/* Card container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden border-2 border-indigo-400">
          {/* Top accent line */}
          <div className="h-1.5 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

          <div className="p-8 sm:p-12 md:p-16 text-center">
            {/* Icon container */}
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-6 sm:mb-8 relative">
              <div className="absolute inset-0 bg-linear-to-br from-blue-100 to-indigo-100 rounded-3xl rotate-6 animate-pulse"></div>
              <div className="absolute inset-0 bg-linear-to-br from-indigo-100 to-purple-100 rounded-3xl -rotate-6 animate-pulse delay-500"></div>
              <div className="relative bg-white rounded-2xl p-4 sm:p-5 shadow-lg">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Main heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-slate-800 via-indigo-900 to-slate-800 bg-clip-text text-transparent leading-tight">
              {mainHeading}
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 mb-8 sm:mb-10 max-w-md mx-auto leading-relaxed">
              {subHeading}
            </p>

            {/* Divider */}
            <div className="w-16 h-1 bg-linear-to-r from-transparent via-indigo-300 to-transparent mx-auto mb-8 sm:mb-10"></div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Link
                href={redirect}
                className="group relative w-full sm:w-auto px-8 py-3.5 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-300/50 hover:scale-105 active:scale-95"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>

                  {redirectButtonText}
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-purple-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </Link>

              <Link
                href={"/"}
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Kembali ke Beranda
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-indigo-400/20 rounded-full blur-sm animate-bounce delay-300"></div>
        <div className="absolute -bottom-6 -right-6 w-10 h-10 bg-purple-400/20 rounded-full blur-sm animate-bounce delay-700"></div>
      </div>
    </div>
  );
}
