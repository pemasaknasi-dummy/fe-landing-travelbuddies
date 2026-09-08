"use client";

import { SpinnerLoading } from "@/components/sections/SpinnerLoading";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useLayoutEffect } from "react";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, isAuth, isReady, isRefreshing, isLoadingLogout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (isLoadingLogout) return;

    if (isReady && !isRefreshing && !isAuth && !user) {
      const destination = pathname ? encodeURIComponent(pathname) : "/";
      router.replace(`/login?sessionExpired=true&callbackUrl=${destination}`);
    }
  }, [isAuth, isReady, isRefreshing, isLoadingLogout, pathname, router, user]);

  // ⛔ Saat logout, jangan render apa pun
  if (isLoadingLogout) return null;

  if (!isReady || isRefreshing) {
    return <SpinnerLoading />;
  }

  if (!isAuth) {
    return null;
  }

  return <>{children}</>;
};
