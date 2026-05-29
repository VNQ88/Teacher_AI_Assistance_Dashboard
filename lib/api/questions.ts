import apiClient from './client';
import type {
  ApiResponse,
  PageResponse,
  QuestionBankResponse,
  CreateQuestionBankRequest,
  QuestionResponse,
  CreateQuestionRequest,
  DifficultyLevel,
  QuestionType,
  UserResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '../types';

export const questionBanksApi = {
  getAll: async (params?: {
    subjectId?: number;
    published?: boolean;
    pageNo?: number;
    pageSize?: number;
  }): Promise<PageResponse<QuestionBankResponse>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<QuestionBankResponse>>>(
      '/question-banks',
      { params }
    );
    return res.data.data;
  },

  getById: async (id: number): Promise<QuestionBankResponse> => {
    const res = await apiClient.get<ApiResponse<QuestionBankResponse>>(`/question-banks/${id}`);
    return res.data.data;
  },

  create: async (data: CreateQuestionBankRequest): Promise<QuestionBankResponse> => {
    const res = await apiClient.post<ApiResponse<QuestionBankResponse>>('/question-banks', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<CreateQuestionBankRequest>): Promise<QuestionBankResponse> => {
    const res = await apiClient.put<ApiResponse<QuestionBankResponse>>(`/question-banks/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/question-banks/${id}`);
  },
};

export const questionsApi = {
  getAll: async (
    questionBankId: number,
    params?: {
      questionType?: QuestionType;
      difficultyLevel?: DifficultyLevel;
      pageNo?: number;
      pageSize?: number;
    }
  ): Promise<PageResponse<QuestionResponse>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<QuestionResponse>>>(
      `/question-banks/${questionBankId}/questions`,
      { params }
    );
    return res.data.data;
  },

  create: async (
    questionBankId: number,
    data: CreateQuestionRequest
  ): Promise<QuestionResponse> => {
    const res = await apiClient.post<ApiResponse<QuestionResponse>>(
      `/question-banks/${questionBankId}/questions`,
      data
    );
    return res.data.data;
  },

  bulkCreate: async (
    questionBankId: number,
    questions: CreateQuestionRequest[]
  ): Promise<QuestionResponse[]> => {
    const res = await apiClient.post<ApiResponse<QuestionResponse[]>>(
      `/question-banks/${questionBankId}/questions/bulk`,
      { questions }
    );
    return res.data.data;
  },

  update: async (
    id: number,
    data: Partial<CreateQuestionRequest>
  ): Promise<QuestionResponse> => {
    const res = await apiClient.put<ApiResponse<QuestionResponse>>(`/questions/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/questions/${id}`);
  },
};

export const userApi = {
  getCurrentUser: async (): Promise<UserResponse> => {
    const res = await apiClient.get<ApiResponse<UserResponse>>('/user/current');
    return res.data.data;
  },

  getUserById: async (id: number): Promise<UserResponse> => {
    const res = await apiClient.get<ApiResponse<UserResponse>>(`/user/${id}`);
    return res.data.data;
  },

  updateProfile: async (userId: number, data: UpdateProfileRequest): Promise<UserResponse> => {
    const res = await apiClient.put<ApiResponse<UserResponse>>(`/user/${userId}`, data);
    return res.data.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post<ApiResponse<null>>('/user/change-password', data);
  },
};
