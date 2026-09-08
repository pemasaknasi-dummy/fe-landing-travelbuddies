import React, { useState } from "react";
import { X, Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { useAuthMutation } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Props {
  onClose: () => void;
  otp: string;
  email: string;
}

export const ResetPasswordModal = ({ onClose, otp, email }: Props) => {
  const { resetPasswordMutation } = useAuthMutation();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validations, setValidations] = useState({
    minLength: false,
    hasLowerCase: false,
    hasNumberOrSpecial: false,
  });

  const validatePassword = (password: string) => {
    setValidations({
      minLength: password.length >= 8,
      hasLowerCase: /[a-z]/.test(password),
      hasNumberOrSpecial: /([0-9]|[!@#$%^&*(),.?":{}|<>])/.test(password),
    });
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    validatePassword(value);
    setError("");
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setError("");
  };

  const handleSubmit = async () => {
    setError("");

    // Validasi password kosong
    if (!newPassword || !confirmPassword) {
      setError("Mohon isi semua field");
      return;
    }

    // Validasi password match
    if (newPassword !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    // Validasi password strength
    const allValid = Object.values(validations).every((v) => v);
    if (!allValid) {
      setError("Password tidak memenuhi kriteria keamanan");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordMutation.mutateAsync(
        { otp, newPassword, email },
        {
          onSuccess: () => {
            toast.success("Password berhasil dirubah.");
            setTimeout(() => {
              localStorage.clear();
              router.push("/login");
            }, 700);
          },
        },
      );
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mengubah password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSubmitting) {
      handleSubmit();
    }
  };

  return (
    <div className="fixed z-99 inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <X size={24} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#1B75BC] rounded-full flex items-center justify-center shadow-lg">
            <Lock className="text-white" size={32} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-2">
          <h2 className="text-2xl font-bold text-gray-800">Buat Password Baru</h2>
        </div>

        {/* New Password Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={handleNewPasswordChange}
              onKeyPress={handleKeyPress}
              disabled={isSubmitting}
              placeholder="Masukkan password baru"
              className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              disabled={isSubmitting}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Password Validations */}
        {newPassword && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-600 mb-2">Password harus memenuhi:</p>
            <div className="space-y-1">
              {[
                { key: "minLength", label: "Minimal 8 karakter" },
                { key: "hasLowerCase", label: "Huruf kecil (a-z)" },
                { key: "hasNumberOrSpecial", label: "Angka (0-9) atau Karakter spesial (!@#$ ...)" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <CheckCircle size={16} className={validations[key as keyof typeof validations] ? "text-green-500" : "text-gray-300"} />
                  <span className={`text-xs ${validations[key as keyof typeof validations] ? "text-green-600" : "text-gray-500"}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirm Password Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              onKeyPress={handleKeyPress}
              disabled={isSubmitting}
              placeholder="Masukkan ulang password baru"
              className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isSubmitting}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {confirmPassword && newPassword !== confirmPassword && <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !newPassword || !confirmPassword}
          className="w-full bg-[#1B75BC] text-white font-semibold py-3 rounded-xl hover:bg-[#145b91] transition-colors cursor-pointer duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Menyimpan...
            </span>
          ) : (
            "Simpan Password Baru"
          )}
        </button>
      </div>
    </div>
  );
};
