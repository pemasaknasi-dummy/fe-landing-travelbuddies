import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useEffect } from "react";

export default function AgentSubmissionSuccessPage() {

  // Auto scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Simple Success Icon */}
        <div className="relative">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-20"></div>
        </div>

        {/* Simple Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">Pendaftaran Berhasil!</h1>
          <p className="text-gray-600">Terima kasih sudah mendaftar sebagai agent travel kami. Tim kami akan segera menghubungi kamu.</p>
        </div>

        {/* Simple Info */}
        <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-600">
          <p className="flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Cek secara berkala email kamu, untuk informasi lebih lanjut
          </p>
        </div>

        {/* Simple Button */}
        <Link href="/" className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
          Kembali ke Beranda
          <ArrowRight className="w-4 h-4" />
        </Link>

        {/* Simple Contact */}
        <p className="text-xs text-gray-400">Ada kendala? Hubungi support@travel.com</p>
      </div>
    </div>
  );
}
