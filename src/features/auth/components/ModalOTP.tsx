/* eslint-disable @typescript-eslint/no-explicit-any */
import { Shield, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface ModalOTPProps {
  length?: number;
  email: string;
  registrationToken?: string;
  submissionToken?: string;
  onClose: () => void;
  onVerify: (payload: any) => Promise<unknown>;
  onResend?: (payload: { email: string; registrationToken?: string; submissionToken?: string }) => Promise<{ message: string; registrationToken: string; submissionToken: string }>;
  isVerifying?: boolean;
  isResending?: boolean;
  mode: string;
  successRedirect?: string;
  setIsSubmissionAgentSuccess?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ModalOTP = ({ length = 6, registrationToken, submissionToken, email, onClose, onVerify, onResend, isVerifying, isResending, mode, successRedirect, setIsSubmissionAgentSuccess }: ModalOTPProps) => {
  const router = useRouter();
  const [pin, setPin] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [finalRegisToken, setFinalRegisToken] = useState<string>(registrationToken!);
  const [finalSubmissionAgentToken, setFinalSubmissionAgentToken] = useState<string>(submissionToken!);

  const [otpStartTime, setOtpStartTime] = useState<number | null>(() => {
    const saved = localStorage.getItem("otpStartTime");
    return saved ? Number(saved) : null;
  });

  const COUNTDOWN_DURATION = 60;
  const formatTime = (seconds: number) => `00:${String(seconds).padStart(2, "0")}`;

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const saved = localStorage.getItem("otpStartTime");
    if (!saved) return 0;

    const elapsed = Math.floor((Date.now() - Number(saved)) / 1000);
    return Math.max(0, COUNTDOWN_DURATION - elapsed);
  });

  useEffect(() => {
    if (!otpStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - otpStartTime) / 1000);

      const remaining = Math.max(0, COUNTDOWN_DURATION - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        localStorage.removeItem("otpStartTime");
        setOtpStartTime(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpStartTime]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return; // Only allow a single digit (0-9)
    setOtpError("");

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Move focus to next input if a number is entered
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("Text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newPin = [...pin];
    for (let i = 0; i < pin.length; i++) {
      newPin[i] = pasted[i] || "";
    }
    setPin(newPin);

    const lastIndex = Math.min(pasted.length - 1, pin.length - 1);
    inputRefs.current[lastIndex]?.focus();
    e.preventDefault();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.every((num) => num !== "")) {
      if (mode === "registration") {
        const payload = {
          otp: pin.join(""),
          registrationToken: finalRegisToken,
        };

        try {
          await onVerify(payload);
          toast.success("Verifikasi berhasil");
          localStorage.clear();
          router.push(successRedirect ?? "/login");
        } catch (err: any) {
          console.log("verify register error: ", err);
          setOtpError(err.message);
        }
      } else if (mode === "forgot-password") {
        const payload = {
          otp: pin.join(""),
          email: email,
          mode: mode,
        };

        try {
          await onVerify(payload);
          toast.success("Verifikasi berhasil");
          localStorage.clear();
          localStorage.setItem("resetPasswordModal", "true");
        } catch (err: any) {
          console.log("verify forgotPassword error: ", err);
          setOtpError(err.message);
        }
      } else if (mode === "submission-agent") {
        const payload = {
          otp: pin.join(""),
          mode: mode,
          submissionToken: finalSubmissionAgentToken,
        };

        try {
          await onVerify(payload);
          toast.success("Verifikasi berhasil");
          setIsSubmissionAgentSuccess?.(true);
        } catch (err: any) {
          console.log("verify submission agent error: ", err);
          setOtpError(err.message);
        }
      }
    }
  };

  const handleResendOtp = async () => {
    if (mode === "registration") {
      const payload = {
        email: email,
        registrationToken: registrationToken,
        mode: mode,
      };

      try {
        if (!onResend) return;
        const data = await onResend(payload);
        toast.success("Kode OTP berhasil dikirim");
        setFinalRegisToken(data.registrationToken);
        setOtpError(null);
        setPin(new Array(length).fill(""));

        // Set Timeleft
        const now = Date.now();
        localStorage.setItem("otpStartTime", String(now));
        setOtpStartTime(now);
        setTimeLeft(60);
      } catch (err: any) {
        console.log("resend otp error: ", err);
        setOtpError(err.message);
      }
    } else if (mode === "submission-agent") {
      const payload = {
        email: email,
        mode: mode,
        submissionToken: submissionToken,
      };

      try {
        if (!onResend) return;
        const data = await onResend(payload);
        toast.success("Kode OTP berhasil dikirim");
        setFinalSubmissionAgentToken(data.submissionToken);
        setOtpError(null);
        setPin(new Array(length).fill(""));

        // Set Timeleft
        const now = Date.now();
        localStorage.setItem("otpStartTime", String(now));
        setOtpStartTime(now);
        setTimeLeft(60);
      } catch (err: any) {
        console.log("resend otp error: ", err);
        setOtpError(err.message);
      }
    } else if (mode === "forgot-password") {
      const payload = {
        email: email,
        mode: mode,
      };

      try {
        if (!onResend) return;
        const data = await onResend(payload);
        toast.success("Kode OTP berhasil dikirim");
        setFinalRegisToken(data.registrationToken);
        setOtpError(null);
        setPin(new Array(length).fill(""));

        // Set Timeleft
        const now = Date.now();
        localStorage.setItem("otpStartTime", String(now));
        setOtpStartTime(now);
        setTimeLeft(60);
      } catch (err: any) {
        console.log("resend otp error: ", err);
        setOtpError(err.message);
      }
    }
  };

  return (
    <div className="fixed z-99 inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white w-[370px] mx-5 rounded-2xl shadow-xl p-8 relative">
        {/* Close Button */}
        <button onClick={onClose} disabled={isVerifying || isResending} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:cursor-not-allowed">
          <X size={24} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#1B75BC] rounded-full flex items-center justify-center shadow-lg">
            <Shield className="text-white" size={32} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-2">
          <h2 className="text-2xl font-bold text-gray-800">Masukkan kode OTP</h2>
        </div>

        {/* Description */}
        <p className="text-center text-gray-500 text-sm mb-8">
          Kami telah mengirim kode 6 digit ke email :
          <br />
          <span className="font-semibold text-gray-700">{email ?? "-"}</span>
        </p>

        {/* OTP Input */}
        <form onSubmit={handleVerifyOtp}>
          <div className="flex justify-center gap-3 mb-6">
            {pin.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                className={`size-10 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200 ${digit && !otpError ? "border-blue-500 bg-blue-50 text-blue-600" : otpError ? "border-red-500 bg-red-50 text-red-600" : "border-gray-200 bg-gray-50 text-gray-800"} focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white`}
              />
            ))}
          </div>

          {/* Error Message */}
          {otpError && <p className="text-center text-red-500 text-sm mb-4">{otpError}</p>}

          {/* Verify Button */}
          <button
            type="submit"
            // onClick={handleVerifyOtp}
            // onKeyDown={(e) => {
            //   if (e.key === "Enter") {
            //     handleVerifyOtp();
            //   }
            // }}
            disabled={isVerifying || isResending || pin.join("").length < 6}
            className="w-full bg-[#1B75BC] text-white font-semibold py-3 rounded-xl hover:bg-[#145b91] transition-colors cursor-pointer duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
          >
            {isVerifying ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying...
              </span>
            ) : isResending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Mengirim ulang Kode OTP ...
              </span>
            ) : (
              "Verifikasi"
            )}
          </button>
        </form>

        {/* Resend Link */}
        <div className="flex flex-col items-center gap-y-1">
          {timeLeft === 0 && (
            <div className="flex items-center justify-center gap-x-2">
              <p className="text-sm text-gray-500">Tidak menerima kode?</p>
              <button onClick={handleResendOtp} disabled={isResending} className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors hover:underline cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed">
                Kirim ulang
              </button>
            </div>
          )}
          {timeLeft > 0 ? <p className="text-sm mt-0.5 text-blue-600 font-semibold">{formatTime(timeLeft)}</p> : <p className="text-sm mt-0.5 text-red-600 font-semibold">Waktu habis</p>}
        </div>
      </div>
    </div>
  );
};
