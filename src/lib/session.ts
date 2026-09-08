/* eslint-disable @typescript-eslint/no-explicit-any */

const ACCESS_TOKEN_KEY = "session";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user_info";

// --- Access Token ---
export function getSession(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setSession(token: string, user: any) {
  if (typeof window === "undefined") return null;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function flushSession() {
  if (typeof window === "undefined") return null;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

// --- Refresh Token ---
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string) {
  if (typeof window === "undefined") return null;
  window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function flushRefreshToken() {
  if (typeof window === "undefined") return null;
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// --- User Info ---
export function getUser(): any {
  if (typeof window === "undefined") return null;
  const user = window.localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function flushAll() {
  flushSession();
  flushRefreshToken();
}
