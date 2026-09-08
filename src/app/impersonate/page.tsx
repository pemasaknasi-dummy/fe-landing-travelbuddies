"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import * as sessionService from "@/lib/session";
import { profileApi } from "@/features/profile/api/profile-api";
import toast from "react-hot-toast";

function ImpersonateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Memproses login impersonasi...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      toast.error("Token impersonasi tidak ditemukan");
      router.push("/");
      return;
    }

    const processImpersonation = async () => {
      try {
        setStatus("Menghubungkan sesi impersonasi...");
        
        // 1. Temporarily store token
        sessionService.setSession(token, null);
        window.localStorage.setItem("is_impersonating", "true");

        // 2. Fetch user profile with the impersonation token
        const user = await profileApi.getProfile();

        // 3. Save session with user details
        sessionService.setSession(token, user);
        window.localStorage.setItem("impersonating_user", JSON.stringify(user));

        toast.success(`Berhasil login impersonasi sebagai ${user.name} (${user.email})`, {
          duration: 5000,
          position: "top-center",
        });

        // 4. Redirect to homepage
        window.location.href = "/";
      } catch (err: any) {
        console.error("Impersonation login error:", err);
        sessionService.flushAll();
        window.localStorage.removeItem("is_impersonating");
        window.localStorage.removeItem("impersonating_user");

        toast.error(err.message || "Gagal memproses sesi impersonasi", {
          position: "top-center",
        });
        router.push("/");
      }
    };

    processImpersonation();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center space-y-4 border border-gray-100">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-gray-800">Support Impersonation</h2>
        <p className="text-sm text-gray-600">{status}</p>
        <p className="text-xs text-gray-400">Harap tunggu sebentar, Anda akan dialihkan ke beranda...</p>
      </div>
    </div>
  );
}

export default function ImpersonatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ImpersonateContent />
    </Suspense>
  );
}
