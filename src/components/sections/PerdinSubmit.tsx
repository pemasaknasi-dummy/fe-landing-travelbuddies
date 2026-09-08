import Link from "next/link";
import { CheckCircle, FileText, Clock, Mail, Phone, ArrowRight, Building2 } from "lucide-react";

export const PerdinSubmit = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-[1024px] 2xl:max-w-[1440px] mx-auto w-full">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header with accent */}
          <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500"></div>

          <div className="p-8 md:p-12 lg:p-16">
            {/* Success Indicator */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                {/* Animated rings */}
                <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping"></div>
                <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-4 shadow-xl">
                  <CheckCircle className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              {/* Title with corporate touch */}
              <div className="space-y-3">

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
                  Pengajuan Perjalanan Dinas
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 mt-2">
                    Berhasil Dikirim!
                  </span>
                </h1>
              </div>

              {/* Description */}
              <p className="text-lg text-slate-600 leading-relaxed">
                Terima kasih telah mempercayakan perjalanan dinas perusahaan Anda kepada kami. Tim Corporate Account
                Manager kami akan segera memproses pengajuan Anda.
              </p>

              {/* CTA Button */}
              <div className="pt-6">
                <Link
                  href="/"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl group"
                >
                  <span>Kembali ke Halaman Utama</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes ping {
          75%,
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};
