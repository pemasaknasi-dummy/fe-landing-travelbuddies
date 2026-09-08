"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PasswordlessAuth } from "@/features/auth/components/PasswordlessAuth";

function RegisterContent() {
  const { isAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    if (isAuth) {
      router.push(callbackUrl);
    }
  }, [isAuth, router, callbackUrl]);

  return (
    <section className="min-h-screen flex items-center justify-center p-4 py-12 bg-gradient-to-b from-blue-50/40 via-slate-50 to-slate-100">
      <PasswordlessAuth redirectTo={callbackUrl} initialMode="register" />
    </section>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 text-gray-500 font-medium">
          Memuat...
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
