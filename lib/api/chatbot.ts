import apiClient from './client';
import type {
  ApiResponse,
  PageResponse,
  ChatSessionResponse,
  CreateChatSessionRequest,
  SendChatMessageRequest,
} from '../types';

// ChatMessageResponse from new API
export interface ChatMessageResponse {
  id: number;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  agentType?: string;
  confidenceScore?: number;
  confidenceLevel?: string;
  tokensUsed?: number;
  responseTimeMs?: number;
  sources?: string[];
  createdAt: string;
}

export const chatApi = {
  createSession: async (data: CreateChatSessionRequest): Promise<ChatSessionResponse> => {
    const res = await apiClient.post<ApiResponse<ChatSessionResponse>>('/chat/sessions', data);
    return res.data.data;
  },

  getSessions: async (): Promise<ChatSessionResponse[]> => {
    const res = await apiClient.get<ApiResponse<PageResponse<ChatSessionResponse>>>('/chat/sessions');
    return res.data.data.items || [];
  },

  getSessionById: async (id: number): Promise<any> => {
    const res = await apiClient.get(`/chat/sessions/${id}`);
    return res.data.data;
  },

  // New: dedicated history endpoint
  getHistory: async (sessionId: number): Promise<ChatMessageResponse[]> => {
    const res = await apiClient.get<ApiResponse<ChatMessageResponse[]>>(
      `/chat/sessions/${sessionId}/history`
    );
    return res.data.data || [];
  },

  // Updated: sendMessage now returns ChatMessageResponse
  sendMessage: async (
    sessionId: number,
    data: SendChatMessageRequest
  ): Promise<ChatMessageResponse> => {
    const res = await apiClient.post<ApiResponse<ChatMessageResponse>>(
      `/chat/sessions/${sessionId}/messages`,
      data
    );
    return res.data.data;
  },

  deleteSession: async (id: number): Promise<void> => {
    await apiClient.delete(`/chat/sessions/${id}`);
  },
};
