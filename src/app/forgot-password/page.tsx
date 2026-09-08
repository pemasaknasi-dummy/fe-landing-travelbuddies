"use client";

import { useEffect, useState } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuthMutation } from "@/features/auth/hooks/useAuth";
import { ModalOTP } from "@/features/auth/components/ModalOTP";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { ResetPasswordModal } from "@/features/auth/components/ResetPasswordModal";

export default function Page() {
  const { isAuth } = useAuth();
  const { forgotPasswordMutation, verifyOtpMutation, resendOtpMutation } = useAuthMutation();
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [otpResetPassword, setOtpForgotPassword] = useState<string>("");
  const [isForgotPasswordModal, setIsForgotPasswordModal] = useState<boolean>(() => {
    return localStorage.getItem("forgotPasswordModal") === "true";
  });

  const [isResetPasswordModal, setIsResetPasswordModal] = useState<boolean>(() => {
    return localStorage.getItem("resetPasswordModal") === "true";
  });

  const handleSubmit = async () => {
    try {
      await forgotPasswordMutation.mutateAsync(email);
      // Modal
      setIsForgotPasswordModal(true);
      localStorage.setItem("forgotPasswordModal", "true");
      localStorage.setItem("otpStartTime", String(Date.now()));
    } catch (error: any) {
      console.log("submit forgot password error: ", error.message);
      toast.error(error.message);

      // Remove Modal local storage
      localStorage.removeItem("forgotPasswordModal");
      localStorage.removeItem("otpStartTime");
    }
  };

  const handleVerifyOtpForgotPassword = async (payload: any) => {
    await verifyOtpMutation.mutateAsync(payload, {
      onSuccess: () => {
        setOtpForgotPassword(payload.otp);
        setIsForgotPasswordModal(false);
        localStorage.removeItem("forgotPasswordModal");
        setIsResetPasswordModal(true);
        localStorage.setItem("resetPasswordModal", "true");
      },
      onError: (err) => {
        console.log("handleVerifyOtpForgotPassword error: ", err.message);
      },
    });
  };

  const handleCloseForgotPasswordModal = () => {
    localStorage.removeItem("forgotPasswordModal");
    localStorage.removeItem("otpStartTime");
    setIsForgotPasswordModal(false);
  };

  const handleCloseResetPasswordModal = () => {
    localStorage.removeItem("resetPasswordModal");
    setIsResetPasswordModal(false);
  };

  useEffect(() => {
    return () => {
      localStorage.removeItem("forgotPasswordModal");
      localStorage.removeItem("otpStartTime");
      localStorage.removeItem("resetPasswordModal");
      setIsForgotPasswordModal(false);
    };
  }, []);

  useEffect(() => {
    if (isAuth) {
      router.push("/");
    }
  }, [isAuth, router]);

  return (
    <section className="my-20 flex items-center justify-center px-4 ">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl ring-2 ring-gray-200 shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4">
              <Mail className="w-7 h-7 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Lupa password?</h1>
            <p className="text-slate-600">Masukkan email anda, kami akan kirim link untuk mengatur ulang password</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Alamat Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 pl-11 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all border-slate-300 bg-white"
                />
                <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
              </div>
            </div>

            <button
              disabled={forgotPasswordMutation.isPending}
              onClick={handleSubmit}
              className="w-full bg-[#1B75BC] hover:bg-[#16619b] text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {forgotPasswordMutation.isPending ? (
                <span className="flex items-center justify-center cursor-not-allowed">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Mengirim kode OTP...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link href="/login" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      {isForgotPasswordModal && (
        <ModalOTP
          length={6}
          mode="forgot-password"
          email={email}
          onClose={handleCloseForgotPasswordModal}
          isVerifying={verifyOtpMutation.isPending}
          isResending={resendOtpMutation.isPending}
          onVerify={(payload) => handleVerifyOtpForgotPassword(payload)}
          onResend={(payload) => resendOtpMutation.mutateAsync(payload)}
        />
      )}

      {isResetPasswordModal && <ResetPasswordModal onClose={handleCloseResetPasswordModal} otp={otpResetPassword} email={email} />}
    </section>
  );
}
