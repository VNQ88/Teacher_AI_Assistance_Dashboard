import apiClient, { tokenManager } from './client';

import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegistrationRequest,
  VerifyCodeRequest,
  SetNewPasswordRequest,
  OtpSentResponse,
} from '../types';

export const authApi = {
  login: async (data: LoginRequest) => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    const { accessToken, refreshToken } = res.data.data;
    tokenManager.setAccessToken(accessToken);
    if (refreshToken) tokenManager.setRefreshToken(refreshToken);
    return res.data.data;
  },

  register: async (data: RegistrationRequest) => {
    const res = await apiClient.post<ApiResponse<OtpSentResponse>>('/auth/register', data);
    return res.data;
  },

  resendActivationCode: async (email: string) => {
    const res = await apiClient.post<ApiResponse<OtpSentResponse>>(`/auth/resend-activation-code?email=${encodeURIComponent(email)}`);
    return res.data;
  },

  verifyCode: async (data: VerifyCodeRequest) => {
    const res = await apiClient.post<ApiResponse<null>>('/auth/verify-reset-code', data);
    return res.data;
  },

  activateAccount: async (code: string) => {
    const res = await apiClient.post<ApiResponse<null>>(`/auth/activate-account?code=${encodeURIComponent(code)}`);
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await apiClient.post<ApiResponse<OtpSentResponse>>(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
    return res.data;
  },

  resendResetCode: async (email: string) => {
    const res = await apiClient.post<ApiResponse<OtpSentResponse>>(`/auth/resend-reset-code?email=${encodeURIComponent(email)}`);
    return res.data;
  },

  setNewPassword: async (data: SetNewPasswordRequest) => {
    const res = await apiClient.post<ApiResponse<null>>('/auth/reset-password', data);
    return res.data;
  },

  logout: async () => {
    const refreshToken = tokenManager.getRefreshToken();
    if (refreshToken) {
      try {
        // refreshToken in body; apiClient attaches the optional Bearer access token
        await apiClient.post('/auth/logout', { refreshToken });
      } catch {
        // Proceed with local cleanup even if server call fails
      }
    }
    tokenManager.clearTokens();
    window.location.href = '/login';
  },
};
