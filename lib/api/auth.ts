import axios from 'axios';
import apiClient, { tokenManager } from './client';

const BASE_URL: string = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8080/api';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegistrationRequest,
  VerifyCodeRequest,
  SetNewPasswordRequest,
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
    const res = await apiClient.post<ApiResponse<null>>('/auth/register', data);
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
    const res = await apiClient.post<ApiResponse<null>>(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
    return res.data;
  },

  setNewPassword: async (data: SetNewPasswordRequest) => {
    const res = await apiClient.post<ApiResponse<null>>('/auth/reset-password', data);
    return res.data;
  },

  logout: async () => {
    const accessToken = tokenManager.getAccessToken();
    const refreshToken = tokenManager.getRefreshToken();
    if (accessToken && refreshToken) {
      try {
        await axios.post(
          `${BASE_URL}/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${accessToken}`, Referer: refreshToken } }
        );
      } catch {
        // Proceed with local cleanup even if server call fails
      }
    }
    tokenManager.clearTokens();
    window.location.href = '/login';
  },
};
