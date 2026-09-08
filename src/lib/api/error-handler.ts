export type ErrorDetail = {
  code: string;
  message: string;
};

export function parseBookingError(error: any): ErrorDetail {
  // 1. Client offline detection
  if (typeof window !== "undefined" && !window.navigator.onLine) {
    window.dispatchEvent(new Event("trigger-offline-modal"));
    return {
      code: "NO_INTERNET_CONNECTION",
      message: "Koneksi internet terputus. Periksa koneksi Anda dan coba lagi.",
    };
  }

  // Network/fetch-level failures
  if (error instanceof TypeError || error.name === "TypeError" || error.message?.includes("Failed to fetch")) {
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      window.dispatchEvent(new Event("trigger-offline-modal"));
      return {
        code: "NO_INTERNET_CONNECTION",
        message: "Koneksi internet terputus. Periksa koneksi Anda dan coba lagi.",
      };
    }
    // Server is down or unreachable but client is online
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("trigger-server-error-banner"));
    }
    return {
      code: "SERVER_UNREACHABLE",
      message: "Gagal terhubung ke server. Silakan coba beberapa saat lagi.",
    };
  }

  // 2. Read standardized response from Backend
  const backendError = error.response?.data; // { code, message, error }
  
  if (backendError?.message || backendError?.error) {
    return {
      code: backendError.code || "UNEXPECTED_ERROR",
      message: backendError.message || backendError.error,
    };
  }

  // 3. Fallback for 5xx status codes
  const status = error.response?.status;
  if (status >= 500) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("trigger-server-error-banner"));
    }
    return {
      code: "SERVER_ERROR",
      message: "Terjadi gangguan pada sistem. Silakan coba beberapa saat lagi.",
    };
  }

  return {
    code: "UNEXPECTED_ERROR",
    message: "Terjadi kesalahan. Silakan coba kembali.",
  };
}
