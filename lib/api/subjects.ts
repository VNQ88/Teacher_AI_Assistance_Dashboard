import apiClient from './client';
import type {
  ApiResponse,
  SubjectResponse,
  CreateSubjectRequest,
  UpdateSubjectRequest,
  ClassroomResponse,
  CreateClassroomRequest,
  DocumentResponse,
  UpdateDocumentRequest,
} from '../types';

export const subjectsApi = {
  getAll: async (): Promise<SubjectResponse[]> => {
    const res = await apiClient.get<ApiResponse<SubjectResponse[]>>('/subjects');
    return res.data.data;
  },

  getById: async (id: number): Promise<SubjectResponse> => {
    const res = await apiClient.get<ApiResponse<SubjectResponse>>(`/subjects/${id}`);
    return res.data.data;
  },

  create: async (data: CreateSubjectRequest): Promise<SubjectResponse> => {
    const res = await apiClient.post<ApiResponse<SubjectResponse>>('/subjects', data);
    return res.data.data;
  },

  update: async (id: number, data: UpdateSubjectRequest): Promise<SubjectResponse> => {
    const res = await apiClient.put<ApiResponse<SubjectResponse>>(`/subjects/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/subjects/${id}`);
  },
};

export const classroomsApi = {
  getAll: async (subjectId?: number): Promise<ClassroomResponse[]> => {
    const params = subjectId ? { subjectId } : {};
    const res = await apiClient.get<ApiResponse<ClassroomResponse[]>>('/classrooms', { params });
    return res.data.data;
  },

  getById: async (id: number): Promise<ClassroomResponse> => {
    const res = await apiClient.get<ApiResponse<ClassroomResponse>>(`/classrooms/${id}`);
    return res.data.data;
  },

  create: async (data: CreateClassroomRequest): Promise<ClassroomResponse> => {
    const res = await apiClient.post<ApiResponse<ClassroomResponse>>('/classrooms', data);
    return res.data.data;
  },

  getStudents: async (classroomId: number) => {
    const res = await apiClient.get(`/classrooms/${classroomId}/students`);
    return res.data.data;
  },
};

export const documentsApi = {
  getAll: async (params?: {
    subjectId?: number;
    classroomId?: number;
    status?: string;
    pageNo?: number;
    pageSize?: number;
  }): Promise<any> => {
    const res = await apiClient.get('/documents', { params });
    return res.data.data;
  },

  getById: async (id: number): Promise<DocumentResponse> => {
    const res = await apiClient.get<ApiResponse<DocumentResponse>>(`/documents/${id}`);
    return res.data.data;
  },

  upload: async (formData: FormData): Promise<DocumentResponse> => {
    const res = await apiClient.post<ApiResponse<DocumentResponse>>('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  update: async (id: number, data: UpdateDocumentRequest): Promise<DocumentResponse> => {
    const res = await apiClient.patch<ApiResponse<DocumentResponse>>(`/documents/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/documents/${id}`);
  },

  getPresignedGetUrl: async (key: string): Promise<string> => {
    const res = await apiClient.get('/storage/presign/get', { params: { key } });
    return res.data.data || res.data;
  },

  reprocess: async (id: number): Promise<DocumentResponse> => {
    const res = await apiClient.post<ApiResponse<DocumentResponse>>(`/documents/${id}/reprocess`);
    return res.data.data;
  },
};
