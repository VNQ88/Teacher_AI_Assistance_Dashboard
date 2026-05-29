import apiClient from './client';
import type {
  ApiResponse,
  PageResponse,
  UserResponse,
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
} from '../types';

export const adminApi = {
  getUsers: async (params: { pageNo?: number; pageSize?: number } = {}): Promise<PageResponse<UserResponse>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<UserResponse>>>('/user/list', { params });
    return res.data.data;
  },

  getUser: async (userId: number): Promise<UserResponse> => {
    const res = await apiClient.get<ApiResponse<UserResponse>>(`/user/${userId}`);
    return res.data.data;
  },

  createUser: async (data: AdminCreateUserRequest): Promise<UserResponse> => {
    const res = await apiClient.post<ApiResponse<UserResponse>>('/user', data);
    return res.data.data;
  },

  updateUser: async (userId: number, data: AdminUpdateUserRequest): Promise<UserResponse> => {
    const res = await apiClient.put<ApiResponse<UserResponse>>(`/user/${userId}`, data);
    return res.data.data;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await apiClient.delete(`/user/${userId}`);
  },

  becomeTeacher: async (userId: number): Promise<UserResponse> => {
    const res = await apiClient.post<ApiResponse<UserResponse>>(`/user/${userId}/become-teacher`);
    return res.data.data;
  },
};
