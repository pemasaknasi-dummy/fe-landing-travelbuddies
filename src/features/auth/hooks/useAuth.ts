import { useMutation } from "@tanstack/react-query";
import { authApi, LoginBody, OtpBody, RegisterBody, ResetPasswordBody } from "../api/auth-api";

export const useAuthMutation = () => {
  const loginMutation = useMutation({
    mutationKey: ["login"],
    mutationFn: (body: LoginBody) => authApi.postLogin(body),
  });

  const registerMutation = useMutation({
    mutationKey: ["register"],
    mutationFn: (body: RegisterBody) => authApi.register(body),
  });

  const verifyOtpMutation = useMutation({
    mutationKey: ["verifyOtp"],
    mutationFn: (body: OtpBody) => authApi.verifyOtp(body),
  });

  const resendOtpMutation = useMutation({
    mutationKey: ["resendOtp"],
    mutationFn: (body: OtpBody): Promise<{ message: string; registrationToken: string; submissionToken: string }> => authApi.resendOtp(body),
  });

  const forgotPasswordMutation = useMutation({
    mutationKey: ["forgot-password"],
    mutationFn: (email: string): Promise<void> => authApi.forgotPassword(email),
  });

  const resetPasswordMutation = useMutation({
    mutationKey: ["reset-password"],
    mutationFn: (body: ResetPasswordBody) => authApi.resetPassword(body),
  });

  return { loginMutation, registerMutation, verifyOtpMutation, resendOtpMutation, forgotPasswordMutation, resetPasswordMutation };
};
