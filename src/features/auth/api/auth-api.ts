import { httpClient } from "@/lib/api/http-client";

export interface LoginBody {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  data: {
    name: string;
    email: string;
    id: number;
  };
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: number;
}

export interface OtpBody {
  otp?: string;
  token?: string;
  submissionToken?: string
  mode?: string;
  email?: string;
}

export interface ResetPasswordBody {
  email: string;
  otp: string;
  newPassword: string;
}

export interface PasswordlessRequestOtpResponse {
  message: string;
  email: string;
  isExistingUser: boolean;
  authOtpToken: string;
  expiresIn: number;
}

export interface PasswordlessVerifyOtpSuccessResponse {
  status: "LOGGED_IN";
  isNewUser: false;
  token: string;
  refreshToken: string;
  data: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    photo?: string;
    isAffiliate?: boolean;
  };
}

export interface PasswordlessVerifyOtpNeedProfileResponse {
  status: "NEED_PROFILE";
  isNewUser: true;
  email: string;
  registerToken: string;
}

export type PasswordlessVerifyOtpResponse =
  | PasswordlessVerifyOtpSuccessResponse
  | PasswordlessVerifyOtpNeedProfileResponse;

export interface PasswordlessCompleteProfileBody {
  registerToken: string;
  name: string;
  phone: string;
}

export const authApi = {
  // Passwordless Flow
  requestPasswordlessOtp: async (email: string): Promise<PasswordlessRequestOtpResponse> => {
    return httpClient.post("/auth/otp/request", { email });
  },

  verifyPasswordlessOtp: async (body: { otp: string; authOtpToken: string }): Promise<PasswordlessVerifyOtpResponse> => {
    return httpClient.post("/auth/otp/verify", body);
  },

  resendPasswordlessOtp: async (body: { email?: string; authOtpToken?: string }): Promise<{ message: string; authOtpToken: string; expiresIn: number }> => {
    return httpClient.post("/auth/otp/resend", body);
  },

  completePasswordlessProfile: async (body: PasswordlessCompleteProfileBody): Promise<PasswordlessVerifyOtpSuccessResponse> => {
    return httpClient.post("/auth/otp/complete-profile", body);
  },

  // Legacy & Standard Endpoints
  postLogin: async (body?: LoginBody): Promise<LoginResponse> => {
    return httpClient.post("/auth/login", body);
  },

  register: async (body: RegisterBody): Promise<{ message: string; registrationToken: string }> => {
    return httpClient.post("/auth/register", body);
  },

  logout: async (): Promise<{ message: string }> => {
    return httpClient.post("/auth/logout");
  },

  refreshToken: async (refreshToken: string): Promise<{ token: string; refreshToken: string }> => {
    return httpClient.post("/auth/refresh-token", { refreshToken });
  },

  verifyOtp: async (body: OtpBody) => {
    return httpClient.post("/auth/verify-otp", { ...body });
  },

  resendOtp: async (body: OtpBody): Promise<{ message: string; registrationToken: string; submissionToken: string }> => {
    return httpClient.post("/auth/resend-otp", { ...body });
  },

  forgotPassword: async (email: string): Promise<void> => {
    return httpClient.post("/auth/forgot-password", { email });
  },

  resetPassword: async (body: ResetPasswordBody): Promise<void> => {
    return httpClient.post("/auth/reset-password", { ...body });
  },
};

