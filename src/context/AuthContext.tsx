"use client";

import { authApi, LoginBody, RegisterBody } from "@/features/auth/api/auth-api";
import { useState, createContext, ReactNode, useContext, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthMutation } from "@/features/auth/hooks/useAuth";
import * as sessionService from "../lib/session";
import toast from "react-hot-toast";
import { profileApi, ProfileUser } from "@/features/profile/api/profile-api";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { useQueryClient } from "@tanstack/react-query";

// export interface AuthUserType {
//   id: number;
//   name: string;
//   email: string;
//   roldeId: string;
// }

interface AuthContextType {
  user: ProfileUser | null;
  token: string | null;
  isAuth: boolean;
  isReady: boolean;
  isRefreshing?: boolean;
  isLoginLoading: boolean;
  isRegisterLoading: boolean;
  loginGoogleLoading: boolean;
  isLoadingLogout: boolean;
  register: (body: RegisterBody) => Promise<string | undefined>;
  login: (credentials: LoginBody, redirectTo: string) => void;
  loginGoogle: (credentials: any, redirectTo: string) => void;
  setAuthSession: (token: string, refreshToken: string, user: any, redirectTo?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { loginMutation, registerMutation } = useAuthMutation();
  const router = useRouter();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<ProfileUser | null>(null);
  const [loginGoogleLoading, setLoginGoogleLoading] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  // const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingLogout, setIsLoadingLogout] = useState(false);
  const accessTokenRef = useRef<string | null>(null);
  const isRefreshingRef = useRef<boolean>(false);
  const queryClient = useQueryClient();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const register = async (body: RegisterBody) => {
    try {
      const response = await registerMutation.mutateAsync(body);
      return response.registrationToken;
    } catch (err: any) {
      console.error("register error: ", err);
      throw err;
    }
  };

  const login = async (credentials: LoginBody, redirectTo: string = "/") => {
    try {
      const response = await loginMutation.mutateAsync(credentials);
      const { token, refreshToken, data: user } = response;

      setAccessToken(token);

      sessionService.setSession(token, user);
      sessionService.setRefreshToken(refreshToken);

      const dataUser = await queryClient.fetchQuery({
        queryKey: ["profile"],
        queryFn: () => profileApi.getProfile(),
      });

      setUserInfo(dataUser);
      sessionService.setSession(token, dataUser);
      router.push(redirectTo);
      toast.success("login success", {
        position: "top-center",
      });
    } catch (err: any) {
      console.error("login error: ", err);
      setAccessToken(null);
      setUserInfo(null);
      toast.error(err.message, {
        position: "top-center",
      });

      throw err;
    }
  };

  const loginGoogle = async (credentialResponse: any, redirectTo: string = "/") => {
    setLoginGoogleLoading(true);
    try {
      const idToken = credentialResponse.credential;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      setAccessToken(data.token);
      sessionService.setSession(data.token, data.data);
      sessionService.setRefreshToken(data.refreshToken);

      const dataUser = await queryClient.fetchQuery({
        queryKey: ["profile"],
        queryFn: () => profileApi.getProfile(),
      });

      setUserInfo(dataUser);
      sessionService.setSession(data.token, dataUser);
      router.push(redirectTo);
      toast.success("login success", {
        position: "top-center",
      });
    } catch (err: any) {
      console.error("login error: ", err);
      setAccessToken(null);
      setUserInfo(null);
      toast.error(err.message, {
        position: "top-center",
      });
    } finally {
      setLoginGoogleLoading(false);
    }
  };

  const setAuthSession = async (token: string, refreshToken: string, user: any, redirectTo?: string) => {
    try {
      setAccessToken(token);
      sessionService.setSession(token, user);
      sessionService.setRefreshToken(refreshToken);

      const dataUser = await queryClient.fetchQuery({
        queryKey: ["profile"],
        queryFn: () => profileApi.getProfile(),
      });

      setUserInfo(dataUser);
      sessionService.setSession(token, dataUser);

      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (err) {
      console.error("setAuthSession error: ", err);
    }
  };

  const logout = async () => {
    setIsLoadingLogout(true);
    try {
      await authApi.logout();
      queryClient.clear();
    } catch (err) {
      console.error("error logout: ", err);
      setAccessToken(null);
      setUserInfo(null);
      sessionService.flushRefreshToken();
      sessionService.flushSession();
      queryClient.clear();
      router.push("/");
    } finally {
      setAccessToken(null);
      setUserInfo(null);
      sessionService.flushRefreshToken();
      sessionService.flushSession();
      setIsLoadingLogout(false);
      toast.success("logout success", {
        position: "top-center",
      });
      queryClient.clear();
      router.push("/");
    }
  };

  // const refreshAccessToken = async () => {
  //   try {
  //     setIsRefreshing(true);
  //     const refreshToken = sessionService.getRefreshToken();
  //     if (!refreshToken) throw new Error("No refresh token found");

  //     const data = await authApi.refreshToken(refreshToken);
  //     setAccessToken(data.token);
  //     sessionService.setSession(data.token, userInfo);

  //     if (data.refreshToken) {
  //       sessionService.setRefreshToken(String(data.refreshToken));
  //     }

  //     return data.token;
  //   } catch (err) {
  //     await logout();
  //     return null;
  //   } finally {
  //     setIsRefreshing(false);
  //   }
  // };

  const refreshAccessToken = async () => {
    try {
      if (isRefreshingRef.current) return null;
      isRefreshingRef.current = true;

      const refreshToken = sessionService.getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token");

      const data = await authApi.refreshToken(refreshToken);

      // ✅ UPDATE STATE
      setAccessToken(data.token);

      accessTokenRef.current = data.token;
      sessionService.setSession(data.token, userInfo);

      if (data.refreshToken) {
        sessionService.setRefreshToken(String(data.refreshToken));
      }

      return data.token;
    } catch (err: any) {
      // ✅ Only logout if the backend explicitly rejects the refresh token (401/403)
      const status = err?.response?.status || err?.status;
      if (status === 401 || status === 403) {
        await logout();
      }
      return null;
    } finally {
      isRefreshingRef.current = false;
    }
  };

  const clearRefreshTimeout = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  };

  const scheduleRefresh = () => {
    if (document.visibilityState !== "visible") return;
    if (!accessToken) return;

    clearRefreshTimeout();

    try {
      const decoded: JwtPayload = jwtDecode(accessToken);
      if (!decoded.exp) return;

      const expMs = decoded.exp * 1000;
      // Refresh 1 hour before 7-day expiration (or at most 24h into the session)
      const delay = Math.max(0, expMs - Date.now() - 3600_000);

      if (delay <= 0) {
        refreshAccessToken();
      } else {
        // Cap setTimeout delay at 24 hours to prevent 32-bit integer overflow
        const safeDelay = Math.min(delay, 24 * 60 * 60 * 1000);
        refreshTimeoutRef.current = setTimeout(() => {
          refreshAccessToken();
        }, safeDelay);
      }
    } catch {
      refreshAccessToken();
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState !== "visible") return;
    if (!accessToken) return;

    const decoded: JwtPayload = jwtDecode(accessToken);
    if (!decoded.exp) return;

    const expMs = decoded.exp * 1000;
    const remaining = expMs - Date.now();

    // Refresh if token has less than 1 hour remaining
    if (remaining < 3600_000) {
      clearRefreshTimeout();
      refreshAccessToken();
    } else {
      scheduleRefresh();
    }
  };

  useEffect(() => {
    if (!accessToken) return;

    scheduleRefresh();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearRefreshTimeout();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [accessToken]);

  // useEffect(() => {
  //   let timeout: NodeJS.Timeout;

  //   const scheduleRefresh = () => {
  //     if (document.visibilityState !== "visible") return;
  //     if (!accessToken) return;

  //     try {
  //       const decoded: JwtPayload = jwtDecode(accessToken);

  //       if (!decoded.exp) {
  //         throw new Error("Invalid token: exp not found");
  //       }

  //       const expMs = decoded?.exp * 1000;
  //       const now = Date.now();
  //       const delay = expMs - now - 60 * 1000; // refresh 1 min before expiry

  //       if (delay <= 0) {
  //         refreshAccessToken();
  //       } else {
  //         timeout = setTimeout(refreshAccessToken, delay);
  //       }
  //     } catch (err) {
  //       console.error("Failed to decode JWT", err);
  //       refreshAccessToken();
  //     }
  //   };

  //   // refresh when tab becomes active again
  //   const handleVisibilityChange = () => {
  //     if (document.visibilityState === "visible") {
  //       if (!accessToken) return;

  //       const decoded: JwtPayload = jwtDecode(accessToken);

  //       if (!decoded.exp) return;

  //       const expMs = decoded.exp * 1000;

  //       if (Date.now() > expMs - 60 * 1000) {
  //         refreshAccessToken();
  //       }
  //     }
  //   };

  //   document.addEventListener("visibilitychange", handleVisibilityChange);

  //   scheduleRefresh();

  //   return () => {
  //     clearTimeout(timeout);
  //     document.removeEventListener("visibilitychange", handleVisibilityChange);
  //   };
  // }, [accessToken]);

  useEffect(() => {
    const token = sessionService.getSession();
    const user = sessionService.getUser();

    if (token && user) {
      setAccessToken(token);
      setUserInfo(user);
    }

    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return (
    <AuthContext.Provider
      value={{
        user: userInfo,
        isAuth: !!accessToken,
        token: accessToken,
        register,
        isReady,
        // isRefreshing,
        isRefreshing: isRefreshingRef.current,
        isRegisterLoading: registerMutation.isPending,
        loginGoogle,
        login,
        setAuthSession,
        isLoginLoading: loginMutation.isPending,
        logout,
        loginGoogleLoading,
        isLoadingLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
