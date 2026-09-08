"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/features/auth/api/auth-api";
import { COUNTRIES, CountryCode } from "@/features/auth/constants/countries";
import {
  X,
  ChevronLeft,
  Check,
  AlertCircle,
  HelpCircle,
  WifiOff,
  AlertTriangle,
  ChevronDown,
  ShieldCheck,
  Clock,
  Link2,
} from "lucide-react";
import toast from "react-hot-toast";

export type AuthFlowStep =
  | "EMAIL"
  | "OTP"
  | "OTP_EXPIRED"
  | "LOGIN_SUCCESS"
  | "VERIFIED_NEW_USER"
  | "PROFILE_FORM"
  | "REGISTER_SUCCESS";

interface PasswordlessAuthProps {
  onClose?: () => void;
  redirectTo?: string;
  isModal?: boolean;
  initialMode?: "login" | "register";
  initialSessionExpired?: boolean;
}

export const PasswordlessAuth: React.FC<PasswordlessAuthProps> = ({
  onClose,
  redirectTo = "/",
  isModal = false,
  initialSessionExpired = false,
}) => {
  const { loginGoogle, setAuthSession } = useAuth();

  // Navigation & Flow State
  const [step, setStep] = useState<AuthFlowStep>("EMAIL");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // OTP State
  const [authOtpToken, setAuthOtpToken] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(new Array(6).fill(""));
  const [otpError, setOtpError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(
    null,
  );
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showOtpHelp, setShowOtpHelp] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Profile Registration State
  const [registerToken, setRegisterToken] = useState("");
  const [fullName, setFullName] = useState("");
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    COUNTRIES[0],
  );
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isCompletingProfile, setIsCompletingProfile] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Edge Case Dialogs & Modals
  const [showNetworkError, setShowNetworkError] = useState(false);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(
    initialSessionExpired,
  );
  const [socialFailedModal, setSocialFailedModal] = useState<
    "google" | "apple" | null
  >(null);
  const [accountLinkedModal, setAccountLinkedModal] = useState<
    "google" | "apple" | null
  >(null);
  const [socialCancelledNotice, setSocialCancelledNotice] = useState<
    string | null
  >(null);

  // Rate Limiting Storage Key
  const RATE_LIMIT_KEY = "tb_auth_rate_limited_until";

  // Check if currently restricted due to rate limit
  // const isRateRestricted = () => {
  //   if (typeof window === "undefined") return false;
  //   const restrictedUntil = localStorage.getItem(RATE_LIMIT_KEY);
  //   if (!restrictedUntil) return false;
  //   const expiry = Number(restrictedUntil);
  //   if (Date.now() < expiry) {
  //     return true;
  //   } else {
  //     localStorage.removeItem(RATE_LIMIT_KEY);
  //     return false;
  //   }
  // };

  // Completed user data cache
  const [completedUserData, setCompletedUserData] = useState<{
    token: string;
    refreshToken: string;
    data: any;
  } | null>(null);

  // Masked Email Helper (e.g. budi@gmail.com -> b***@gmail.com)
  const maskEmail = (rawEmail: string) => {
    if (!rawEmail || !rawEmail.includes("@")) return rawEmail;
    const [name, domain] = rawEmail.split("@");
    if (name.length <= 2) return `${name[0]}***@${domain}`;
    return `${name[0]}${Array.from(name, () => "*")
      .join("")
      .slice(0, name.length - 2)}${name[name.length - 1]}@${domain}`;
  };

  // Click outside to close country dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setCountryDropdownOpen(false);
      }
    };
    if (countryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [countryDropdownOpen]);

  // Timer for OTP countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "OTP" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Focus first OTP box when entering OTP step
  useEffect(() => {
    if (step === "OTP") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Email Validation regex
  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  // Step 1: Submit Email to Request OTP
  const handleEmailSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setEmailError(null);

    // if (isRateRestricted()) {
    //   setShowRateLimitModal(true);
    //   return;
    // }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("Email wajib diisi");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setEmailError("Masukkan alamat email yang valid");
      return;
    }

    setIsCheckingEmail(true);
    setShowNetworkError(false);

    try {
      const res = await authApi.requestPasswordlessOtp(trimmedEmail);
      setAuthOtpToken(res.authOtpToken);
      setTimeLeft(60);
      setOtpDigits(new Array(6).fill(""));
      setOtpError(null);
      setRemainingAttempts(null);
      setStep("OTP");
    } catch (err: any) {
      console.error("requestPasswordlessOtp error:", err);
      const data = err?.response?.data || {};

      if (err?.response?.status === 429 || data?.isRateLimited) {
        setShowRateLimitModal(true);
        return;
      }

      if (
        err?.message?.includes("Network") ||
        err?.status === 0 ||
        err?.status >= 500
      ) {
        setShowNetworkError(true);
      } else {
        setEmailError(data?.error || err?.message || "Gagal mengirim OTP");
      }
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Step 2: Handle OTP Input Navigation & Auto-Submit
  const handleOtpChange = (val: string, index: number) => {
    // Only accept numeric characters
    const numericVal = val.replace(/\D/g, "");
    if (!numericVal && val !== "") return;

    setOtpError(null);
    const newDigits = [...otpDigits];
    const digit = numericVal.slice(-1);
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits are complete, trigger verification
    if (digit && index === 5 && newDigits.every((d) => d !== "")) {
      executeOtpVerification(newDigits.join(""));
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        const prevIndex = index - 1;
        const newDigits = [...otpDigits];
        newDigits[prevIndex] = "";
        setOtpDigits(newDigits);
        otpInputRefs.current[prevIndex]?.focus();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("Text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setOtpDigits(newDigits);

    const targetIndex = Math.min(pasted.length, 5);
    otpInputRefs.current[targetIndex]?.focus();

    if (pasted.length === 6) {
      executeOtpVerification(pasted);
    }
  };

  // Step 2: Verify OTP API Call
  const executeOtpVerification = async (otpCode: string) => {
    if (!otpCode || otpCode.length < 6 || isVerifyingOtp) return;

    // if (isRateRestricted()) {
    //   setShowRateLimitModal(true);
    //   return;
    // }

    setIsVerifyingOtp(true);
    setOtpError(null);
    setShowNetworkError(false);

    try {
      const res = await authApi.verifyPasswordlessOtp({
        otp: otpCode,
        authOtpToken,
      });

      if (res.status === "LOGGED_IN") {
        // Existing User -> Immediate Login Success
        setCompletedUserData({
          token: res.token,
          refreshToken: res.refreshToken,
          data: res.data,
        });
        setStep("LOGIN_SUCCESS");

        // Set session in AuthContext & redirect
        setTimeout(async () => {
          await setAuthSession(
            res.token,
            res.refreshToken,
            res.data,
            isModal ? undefined : redirectTo,
          );
          if (onClose) onClose();
        }, 1200);
      } else if (res.status === "NEED_PROFILE") {
        // New User -> Prompt profile creation
        setRegisterToken(res.registerToken);
        setStep("VERIFIED_NEW_USER");
      }
    } catch (err: any) {
      console.error("verifyPasswordlessOtp error:", err);
      if (
        err?.message?.includes("Network") ||
        err?.status === 0 ||
        err?.status >= 500
      ) {
        setShowNetworkError(true);
        return;
      }

      const data = err?.response?.data || {};

      if (data.isExpired) {
        setStep("OTP_EXPIRED");
      } else if (data.remainingAttempts !== undefined) {
        setRemainingAttempts(data.remainingAttempts);
        setOtpError(data.error || "Kode yang kamu masukkan salah.");
        if (data.authOtpToken) {
          setAuthOtpToken(data.authOtpToken);
        }
        if (data.remainingAttempts <= 0) {
          // Block auth for 10 minutes
          setShowRateLimitModal(true);
        }
      } else {
        setOtpError(
          data.error || err?.message || "Kode yang kamu masukkan salah.",
        );
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (timeLeft > 0 || isResendingOtp) return;

    // if (isRateRestricted()) {
    //   setShowRateLimitModal(true);
    //   return;
    // }

    setIsResendingOtp(true);
    setOtpError(null);
    setRemainingAttempts(null);
    setShowNetworkError(false);

    try {
      const res = await authApi.resendPasswordlessOtp({
        email: email.trim(),
        authOtpToken,
      });
      setAuthOtpToken(res.authOtpToken);
      setTimeLeft(60);
      setOtpDigits(new Array(6).fill(""));
      setStep("OTP");
      toast.success("Kode baru telah dikirim", { position: "top-center" });
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 50);
    } catch (err: any) {
      console.error("resendPasswordlessOtp error:", err);
      const data = err?.response?.data || {};

      if (err?.response?.status === 429 || data?.isRateLimited) {
        setShowRateLimitModal(true);
        return;
      }

      if (
        err?.message?.includes("Network") ||
        err?.status === 0 ||
        err?.status >= 500
      ) {
        setShowNetworkError(true);
      } else {
        toast.error(data?.error || "Gagal mengirim ulang OTP");
      }
    } finally {
      setIsResendingOtp(false);
    }
  };

  // Step 3B: Complete Profile for New User
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFullNameError(null);
    setPhoneError(null);

    let hasError = false;
    if (!fullName.trim() || fullName.trim().length < 2) {
      setFullNameError("Masukkan nama lengkap yang valid");
      hasError = true;
    }

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 7) {
      setPhoneError("Masukkan nomor WhatsApp yang valid");
      hasError = true;
    }

    if (!termsAccepted) {
      toast.error("Harap setujui Syarat & Ketentuan dan Kebijakan Privasi");
      return;
    }

    if (hasError) return;

    setIsCompletingProfile(true);
    setShowNetworkError(false);

    try {
      const formattedPhone = `${selectedCountry.code}${cleanPhone.startsWith("0") ? cleanPhone.slice(1) : cleanPhone}`;
      const res = await authApi.completePasswordlessProfile({
        registerToken,
        name: fullName.trim(),
        phone: formattedPhone,
      });

      setCompletedUserData({
        token: res.token,
        refreshToken: res.refreshToken,
        data: res.data,
      });
      setStep("REGISTER_SUCCESS");
    } catch (err: any) {
      console.error("completePasswordlessProfile error:", err);
      if (
        err?.message?.includes("Network") ||
        err?.status === 0 ||
        err?.status >= 500
      ) {
        setShowNetworkError(true);
      } else {
        toast.error(
          err?.response?.data?.error ||
            err?.message ||
            "Gagal menyelesaikan pendaftaran",
        );
      }
    } finally {
      setIsCompletingProfile(false);
    }
  };

  // Complete Registration Final Action
  const handleFinishRegistration = async () => {
    if (completedUserData) {
      await setAuthSession(
        completedUserData.token,
        completedUserData.refreshToken,
        completedUserData.data,
        isModal ? undefined : redirectTo,
      );
    }
    if (onClose) onClose();
  };

  // Filtered country list
  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.includes(countrySearch),
  );

  return (
    <div className="relative w-full max-w-xl bg-white text-gray-900 rounded-3xl shadow-2xl border border-gray-100 p-7 md:p-8 flex flex-col font-sans transition-all">
      {/* Top Header with Back / Close Button */}
      <div className="flex items-center justify-between mb-4">
        {step === "OTP" || step === "PROFILE_FORM" ? (
          <button
            type="button"
            onClick={() => {
              if (step === "OTP") setStep("EMAIL");
              if (step === "PROFILE_FORM") setStep("VERIFIED_NEW_USER");
            }}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Kembali"
          >
            <ChevronLeft size={20} />
          </button>
        ) : (
          <div className="w-9 h-9" />
        )}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col">
        {/* =====================================================================
            SCREEN A01 - A03: EMAIL INPUT (PASSWORDLESS ENTRY)
        ===================================================================== */}
        {step === "EMAIL" && (
          <div className="flex-1 flex flex-col animate-fade-in">
            {/* Logo & Header */}
            <div className="flex flex-col items-center mb-6 text-center">
              <Image
                src="/images/logo/nobg-logo.png"
                alt="Travel Buddies Logo"
                width={72}
                height={72}
                className="h-16 w-auto object-contain mb-2"
                priority
              />
              <h1 className="text-2xl font-bold text-gray-900">
                Siap jalan-jalan lagi?
              </h1>
              <p className="text-sm text-gray-500 text-center mt-1">
                Masuk untuk melanjutkan perjalananmu bersama Travel Buddies.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled={isCheckingEmail}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="nama@email.com"
                  className={`w-full h-12 px-4 rounded-xl border text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all ${
                    emailError
                      ? "border-red-500 bg-red-50/50 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:border-[#25A6DD] focus:ring-2 focus:ring-[#25A6DD]/20"
                  }`}
                  autoFocus
                />
                {emailError && (
                  <span className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle size={14} />
                    {emailError}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={!email.trim() || isCheckingEmail}
                className="w-full h-12 rounded-xl flex items-center justify-center font-bold text-white bg-[#25A6DD] hover:bg-[#1e8ec0] transition-all shadow-md active:scale-[0.99] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
              >
                {isCheckingEmail ? (
                  <span className="flex items-center justify-center gap-2 text-white">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Memeriksa email...
                  </span>
                ) : (
                  "Lanjutkan"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-5">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                atau dengan
              </span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            {/* Social Logins */}
            <div className="flex flex-col gap-3">
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={(cred) => {
                    loginGoogle(cred, isModal ? "" : redirectTo);
                    if (onClose) onClose();
                  }}
                  onError={() => {
                    setSocialCancelledNotice("Login dibatalkan.");
                  }}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  width="100%"
                  shape="rectangular"
                />
              </div>

              {/* <button
                type="button"
                onClick={() => {
                  toast("Fitur Sign in with Apple segera hadir di website!", {
                    icon: "🍎",
                  });
                }}
                className="w-full h-11 rounded-xl flex items-center justify-center gap-2.5 font-semibold text-white bg-[#0f172a] hover:bg-black transition-all text-sm shadow-xs cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M16.365 14.734c-.015-3.238 2.64-4.792 2.76-4.865-1.503-2.198-3.83-2.496-4.664-2.533-1.97-.2-3.845 1.162-4.845 1.162-1.015 0-2.553-1.127-4.184-1.096-2.13.033-4.098 1.238-5.19 3.136-2.215 3.837-.565 9.508 1.583 12.607 1.05 1.516 2.296 3.208 3.944 3.146 1.585-.063 2.187-1.026 4.11-1.026 1.906 0 2.476 1.026 4.125 1.002 1.696-.032 2.784-1.536 3.82-3.05 1.203-1.758 1.697-3.46 1.717-3.553-.037-.015-3.16-1.213-3.176-4.93M14.62 7.026c.866-1.047 1.45-2.502 1.29-3.953-1.246.05-2.765.828-3.648 1.874-.784.912-1.485 2.394-1.31 3.825 1.393.108 2.808-.696 3.668-1.746" />
                </svg>
                Lanjutkan dengan Apple
              </button> */}
            </div>

            {/* Footer Links */}
            <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col items-center gap-2 text-center">
              <p className="text-xs text-gray-500">
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={() => {
                    const inputEl = document.querySelector(
                      'input[type="email"]',
                    ) as HTMLInputElement;
                    if (inputEl) inputEl.focus();
                  }}
                  className="text-[#25A6DD] font-semibold hover:underline cursor-pointer"
                >
                  Daftar
                </button>
              </p>
              <div className="flex gap-2 text-[11px] text-gray-400">
                <Link
                  href="/kebijakan-privasi"
                  target="_blank"
                  className="hover:text-gray-600 transition-colors"
                >
                  Kebijakan Privasi
                </Link>
                <span>•</span>
                <Link
                  href="/syarat-ketentuan"
                  target="_blank"
                  className="hover:text-gray-600 transition-colors"
                >
                  Syarat & Ketentuan
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            SCREEN A04 - A05: OTP VERIFICATION
        ===================================================================== */}
        {step === "OTP" && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#25A6DD] flex items-center justify-center mx-auto mb-3">
                <ShieldCheck size={26} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Cek email kamu
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Kami telah mengirimkan kode 6 digit ke <br />
                <span className="font-semibold text-gray-800">
                  {maskEmail(email)}
                </span>
              </p>
            </div>

            {/* 6 OTP Boxes */}
            <div className="flex justify-center gap-2 mb-3">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={idx === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  disabled={isVerifyingOtp}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                  onPaste={handleOtpPaste}
                  className={`w-11 h-13 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all ${
                    otpError
                      ? "border-red-400 bg-red-50/50 text-red-600 focus:border-red-500"
                      : digit
                        ? "border-[#25A6DD] bg-blue-50/50 text-[#25A6DD]"
                        : "border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#25A6DD] focus:ring-2 focus:ring-[#25A6DD]/15"
                  }`}
                />
              ))}
            </div>

            {/* Error Message & Attempts */}
            {otpError && (
              <div className="text-center my-2 animate-fade-in">
                <p className="text-xs font-semibold text-red-500">{otpError}</p>
                {remainingAttempts !== null && remainingAttempts > 0 && (
                  <p className="text-[11px] text-red-400 mt-0.5">
                    Sisa percobaan: {remainingAttempts}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => executeOtpVerification(otpDigits.join(""))}
              disabled={otpDigits.some((d) => !d) || isVerifyingOtp}
              className="w-full h-12 rounded-xl flex items-center justify-center font-bold text-white bg-[#25A6DD] hover:bg-[#1e8ec0] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20 active:scale-[0.99] cursor-pointer mt-3"
            >
              {isVerifyingOtp ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi...</span>
                </div>
              ) : (
                "Verifikasi"
              )}
            </button>

            {/* Timer & Resend Link */}
            <div className="flex flex-col items-center gap-1.5 mt-5 text-center">
              <p className="text-xs text-gray-400">
                Kode berlaku selama 5 menit
              </p>
              {timeLeft > 0 ? (
                <p className="text-xs text-gray-600">
                  Kirim ulang dalam{" "}
                  <span className="font-bold text-[#25A6DD]">
                    00:{String(timeLeft).padStart(2, "0")}
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResendingOtp}
                  className="text-xs font-bold text-[#25A6DD] hover:text-[#1e8ec0] underline cursor-pointer"
                >
                  {isResendingOtp
                    ? "Mengirim kode baru..."
                    : "Kirim Ulang Kode OTP"}
                </button>
              )}
            </div>

            {/* Help Section */}
            <div className="mt-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left">
              <button
                type="button"
                onClick={() => setShowOtpHelp(!showOtpHelp)}
                className="w-full flex items-center justify-between text-xs font-bold text-gray-700 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <HelpCircle size={15} className="text-[#25A6DD]" />
                  Tidak menerima email?
                </span>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform ${showOtpHelp ? "rotate-180" : ""}`}
                />
              </button>
              {showOtpHelp && (
                <ul className="text-xs text-gray-600 flex flex-col gap-1 pl-4 list-disc mt-2.5">
                  <li>Periksa folder Spam/Junk</li>
                  <li>Pastikan email yang digunakan benar</li>
                  <li>Tunggu beberapa saat atau Kirim ulang</li>
                </ul>
              )}
            </div>

            {/* Change Email Action */}
            <div className="mt-8 text-center pt-2">
              <button
                type="button"
                onClick={() => setStep("EMAIL")}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 underline cursor-pointer"
              >
                Ubah email
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            SCREEN 6.4: OTP EXPIRED STATE
        ===================================================================== */}
        {step === "OTP_EXPIRED" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-6 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-4">
              <Clock size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Kode kedaluwarsa
            </h2>
            <p className="text-sm text-gray-500 mb-8">
              Kode verifikasi sudah tidak berlaku.
            </p>

            <div className="w-full flex flex-col gap-3">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResendingOtp}
                className="w-full h-12 rounded-xl flex items-center justify-center font-bold text-white bg-[#25A6DD] hover:bg-[#1e8ec0] transition-all shadow-md cursor-pointer active:scale-[0.99]"
              >
                {isResendingOtp ? "Mengirim kode baru..." : "Kirim Kode Baru"}
              </button>
              <button
                type="button"
                onClick={() => setStep("EMAIL")}
                className="w-full h-11 rounded-xl flex items-center justify-center font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer text-sm"
              >
                Ubah Email
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            SCREEN A06: EXISTING USER LOGIN SUCCESS
        ===================================================================== */}
        {step === "LOGIN_SUCCESS" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-5 shadow-lg">
              <Check size={32} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Selamat datang kembali!
            </h2>
            <p className="text-sm text-gray-500">Menyiapkan perjalananmu...</p>

            <div className="mt-6 flex gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full bg-[#25A6DD] animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2.5 h-2.5 rounded-full bg-[#25A6DD] animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2.5 h-2.5 rounded-full bg-[#25A6DD] animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}

        {/* =====================================================================
            SCREEN B01: NEW USER EMAIL VERIFIED PROMPT
        ===================================================================== */}
        {step === "VERIFIED_NEW_USER" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-2 py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-5 shadow-md">
              <Check size={32} strokeWidth={3} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Email berhasil diverifikasi
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Lengkapi informasi untuk membuat akun Travel Buddies.
            </p>

            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-8 flex items-center justify-center gap-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#25A6DD"
                strokeWidth="2"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span className="font-semibold text-gray-800 text-sm">
                {email}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setStep("PROFILE_FORM")}
              className="w-full h-12 rounded-xl flex items-center justify-center font-bold text-white bg-[#25A6DD] hover:bg-[#1e8ec0] transition-all shadow-md cursor-pointer active:scale-[0.99]"
            >
              Lanjutkan
            </button>
          </div>
        )}

        {/* =====================================================================
            SCREEN B02 - B04: REGISTER PROFILE FORM
        ===================================================================== */}
        {step === "PROFILE_FORM" && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Lengkapi akun kamu
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Satu langkah lagi untuk memulai petualanganmu.
              </p>
            </div>

            <form
              onSubmit={handleProfileSubmit}
              className="flex flex-col gap-4 flex-1"
            >
              {/* Email Read-only with Verified Check */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Email
                </label>
                <div className="h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                  <span className="text-gray-600 text-sm font-medium">
                    {email}
                  </span>
                  <Check size={16} className="text-green-600" strokeWidth={3} />
                </div>
              </div>

              {/* Nama Lengkap */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={fullName}
                  disabled={isCompletingProfile}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fullNameError) setFullNameError(null);
                  }}
                  placeholder="Masukkan nama lengkap"
                  className={`w-full h-11 px-3.5 rounded-xl border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all ${
                    fullNameError
                      ? "border-red-500 bg-red-50/40 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:border-[#25A6DD] focus:ring-2 focus:ring-[#25A6DD]/20"
                  }`}
                  autoFocus
                />
                {fullNameError && (
                  <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle size={13} />
                    {fullNameError}
                  </span>
                )}
              </div>

              {/* Nomor WhatsApp with Country Selector */}
              <div
                className="flex flex-col gap-1.5 relative"
                ref={countryDropdownRef}
              >
                <label className="text-xs font-semibold text-gray-700">
                  Nomor WhatsApp
                </label>
                <div className="flex gap-2 relative">
                  {/* Country Selector Button */}
                  <button
                    type="button"
                    disabled={isCompletingProfile}
                    onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                    className="h-11 px-3 rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-1.5 text-gray-800 text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span>{selectedCountry.flag}</span>
                    <span>{selectedCountry.code}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  {/* Phone Input */}
                  <input
                    type="tel"
                    value={phoneNumber}
                    disabled={isCompletingProfile}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (phoneError) setPhoneError(null);
                    }}
                    placeholder="812-xxxx-xxxx"
                    className={`flex-1 h-11 px-3.5 rounded-xl border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all ${
                      phoneError
                        ? "border-red-500 bg-red-50/40 focus:ring-2 focus:ring-red-200"
                        : "border-gray-300 focus:border-[#25A6DD] focus:ring-2 focus:ring-[#25A6DD]/20"
                    }`}
                  />
                </div>

                {phoneError && (
                  <span className="text-xs text-red-500 font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle size={13} />
                    {phoneError}
                  </span>
                )}
                <p className="text-[11px] text-gray-400">
                  Nomor ini digunakan untuk komunikasi perjalananmu.
                </p>

                {/* Country Dropdown Popup */}
                {countryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 max-h-56 overflow-y-auto rounded-2xl border border-gray-200 bg-white z-50 py-2 shadow-2xl">
                    <div className="px-3 pb-2 border-b border-gray-100">
                      <input
                        type="text"
                        placeholder="Cari negara / kode..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-xs outline-none focus:border-[#25A6DD]"
                      />
                    </div>
                    {filteredCountries.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(c);
                          setCountryDropdownOpen(false);
                          setCountrySearch("");
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center gap-2.5 transition-colors cursor-pointer text-xs"
                      >
                        <span className="text-base">{c.flag}</span>
                        <span className="font-bold text-gray-800 w-10">
                          {c.code}
                        </span>
                        <span className="text-gray-600 truncate flex-1">
                          {c.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="mt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    disabled={isCompletingProfile}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#25A6DD] focus:ring-[#25A6DD] cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-gray-600 leading-snug">
                    Saya setuju dengan{" "}
                    <Link
                      href="/syarat-ketentuan"
                      target="_blank"
                      className="text-[#25A6DD] font-semibold hover:underline"
                    >
                      Syarat & Ketentuan
                    </Link>{" "}
                    dan{" "}
                    <Link
                      href="/kebijakan-privasi"
                      target="_blank"
                      className="text-[#25A6DD] font-semibold hover:underline"
                    >
                      Kebijakan Privasi
                    </Link>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="mt-4 pt-2">
                <button
                  type="submit"
                  disabled={
                    !fullName.trim() ||
                    !phoneNumber.trim() ||
                    !termsAccepted ||
                    isCompletingProfile
                  }
                  className="w-full h-12 rounded-xl flex items-center justify-center font-bold text-white bg-[#25A6DD] hover:bg-[#1e8ec0] transition-all shadow-md active:scale-[0.99] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isCompletingProfile ? (
                    <div className="flex flex-col items-center justify-center">
                      <span className="flex items-center gap-2 text-sm">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Membuat akun...
                      </span>
                      <span className="text-[10px] text-white/80 font-normal">
                        Sebentar ya.
                      </span>
                    </div>
                  ) : (
                    "Buat Akun"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =====================================================================
            SCREEN B05: REGISTER SUCCESS
        ===================================================================== */}
        {step === "REGISTER_SUCCESS" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-5 shadow-lg">
              <Check size={32} strokeWidth={3} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Akun berhasil dibuat
            </h2>
            <p className="text-sm text-gray-500 mb-8">
              Selamat datang di Travel Buddies.
            </p>

            <button
              type="button"
              onClick={handleFinishRegistration}
              className="w-full h-12 rounded-xl flex items-center justify-center font-bold text-white bg-[#25A6DD] hover:bg-[#1e8ec0] transition-all shadow-md cursor-pointer active:scale-[0.99]"
            >
              Mulai Jelajahi
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          EDGE CASE FULL-SCREEN DIALOG OVERLAYS
      ========================================================================= */}
      {/* Network Error Dialog (Section 20) */}
      {showNetworkError && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white rounded-3xl p-7 md:p-8 text-center text-gray-900 shadow-2xl max-w-md w-full border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 border border-red-200/60 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <WifiOff size={30} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Koneksi bermasalah
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Kami tidak dapat memproses permintaanmu. Periksa koneksi internet
              dan coba lagi.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowNetworkError(false);
                if (step === "EMAIL") handleEmailSubmit();
                else if (step === "OTP") {
                  const code = otpDigits.join("");
                  if (code.length === 6) executeOtpVerification(code);
                } else if (step === "PROFILE_FORM") {
                  handleProfileSubmit({ preventDefault: () => {} } as any);
                }
              }}
              className="w-full h-12 rounded-xl font-bold text-white bg-[#25A6DD] hover:bg-[#1e8ec0] transition-all shadow-md shadow-blue-500/20 active:scale-[0.99] cursor-pointer text-sm"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* Rate Limit / Too Many Attempts Dialog (Section 8) */}
      {showRateLimitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white rounded-3xl p-7 md:p-8 text-center text-gray-900 w-full max-w-md shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 border border-amber-200/60 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <AlertTriangle size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Terlalu banyak percobaan
            </h3>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Percobaan verifikasi terlalu sering. Silakan coba lagi beberapa
              saat nanti, atau kembali dalam 10 menit.
            </p>
            <div className="bg-amber-50/80 border border-amber-200/70 rounded-xl px-4 py-2.5 mb-6 text-xs text-amber-800 font-medium flex items-center justify-center gap-2">
              <Clock size={15} className="text-amber-600 shrink-0" />
              <span>Akses masuk dibatasi sementara selama 10 menit</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowRateLimitModal(false);
                setStep("EMAIL");
              }}
              className="w-full h-12 rounded-xl font-bold text-white bg-[#25A6DD] hover:bg-[#1e8ec0] transition-all shadow-md shadow-blue-500/20 active:scale-[0.99] cursor-pointer text-sm"
            >
              Kembali ke Login
            </button>
          </div>
        </div>
      )}

      {/* Session Expired Modal (Section 19) */}
      {/* {showSessionExpiredModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white rounded-3xl p-7 md:p-8 text-center text-gray-900 w-full max-w-md shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Clock size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Sesi telah berakhir
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Demi keamanan, silakan masuk kembali ke akun Travel Buddies.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowSessionExpiredModal(false);
                setStep("EMAIL");
              }}
              className="w-full h-12 rounded-xl font-bold text-white bg-[#25A6DD] hover:bg-[#1e8ec0] transition-all shadow-md shadow-blue-500/20 active:scale-[0.99] cursor-pointer text-sm"
            >
              Login Kembali
            </button>
          </div>
        </div>
      )} */}

      {/* Social Login Failed Dialog (Section 16.2, 17) */}
      {socialFailedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white rounded-3xl p-7 md:p-8 text-center text-gray-900 w-full max-w-md shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 border border-red-200/60 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <AlertCircle size={30} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {socialFailedModal === "google"
                ? "Login Google gagal"
                : "Login Apple gagal"}
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Kami tidak dapat menyelesaikan proses login{" "}
              {socialFailedModal === "google" ? "Google" : "Apple"} saat ini.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setSocialFailedModal(null)}
                className="w-full h-12 rounded-xl font-bold text-white bg-[#25A6DD] hover:bg-[#1e8ec0] transition-all shadow-md shadow-blue-500/20 active:scale-[0.99] cursor-pointer text-sm"
              >
                Coba Lagi
              </button>
              <button
                type="button"
                onClick={() => {
                  setSocialFailedModal(null);
                  setStep("EMAIL");
                }}
                className="w-full h-11 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer text-sm"
              >
                Gunakan Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Already Linked Dialog (Section 16.3, 18) */}
      {accountLinkedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white rounded-3xl p-7 md:p-8 text-center text-gray-900 w-full max-w-md shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#25A6DD] border border-blue-200/60 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Link2 size={30} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Akun sudah terhubung
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Email ini sudah terhubung dengan akun{" "}
              {accountLinkedModal === "google" ? "Google" : "Apple"}.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setAccountLinkedModal(null)}
                className="w-full h-12 rounded-xl font-bold text-white bg-[#25A6DD] hover:bg-[#1e8ec0] transition-all shadow-md shadow-blue-500/20 active:scale-[0.99] cursor-pointer text-sm"
              >
                Lanjutkan dengan{" "}
                {accountLinkedModal === "google" ? "Google" : "Apple"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccountLinkedModal(null);
                  setEmail("");
                  setStep("EMAIL");
                }}
                className="w-full h-11 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer text-sm"
              >
                Gunakan email lain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Social Cancellation Toast (Section 16.4) */}
      {socialCancelledNotice && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-4 w-full max-w-md animate-fade-in">
          <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl flex items-center justify-between shadow-xl w-full">
            <span className="flex items-center gap-2">
              <AlertCircle size={15} className="text-orange-400 shrink-0" />
              {socialCancelledNotice}
            </span>
            <button
              type="button"
              onClick={() => setSocialCancelledNotice(null)}
              className="text-white/60 hover:text-white ml-2 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
