// ============================================
// API Response Wrappers
// ============================================
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  items: T[];
}

// ============================================
// Auth
// ============================================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistrationRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface SetNewPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  email: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ============================================
// User
// ============================================
export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  avatar?: string;
  enabled: boolean;
  roles: string[];
}

// ============================================
// Admin - User Management
// ============================================
export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface AdminCreateUserRequest {
  email: string;
  fullName: string;
  password: string;
  role: UserRole;
}

export interface AdminUpdateUserRequest {
  fullName: string;
  email?: string;
  avatar?: string;
}

// ============================================
// Subject
// ============================================
export interface SubjectResponse {
  id: number;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectRequest {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateSubjectRequest {
  name: string;
  code: string;
  description?: string;
}

// ============================================
// Classroom
// ============================================
export interface ClassroomResponse {
  id: number;
  name: string;
  code: string;
  academicYear: string;
  semester?: string;
  description?: string;
  subjectId: number;
  subjectName: string;
  teacherId: number;
  teacherName: string;
  studentCount?: number;
}

export interface CreateClassroomRequest {
  name: string;
  code: string;
  academicYear: string;
  semester?: string;
  description?: string;
  subjectId: number;
  teacherId: number;
}

// ============================================
// Document
// ============================================
export type DocumentStatus =
  | 'UPLOADED'
  | 'PARSING'
  | 'CHUNKING'
  | 'EMBEDDING'
  | 'READY'
  | 'FAILED';

export interface DocumentResponse {
  id: number;
  title: string;
  description?: string;
  subjectId: number;
  subjectName: string;
  classroomId?: number;
  classroomName?: string;
  fileType: string;
  fileSizeBytes: number;
  originalObjectKey: string;
  markdownObjectKey?: string;
  status: DocumentStatus;
  processingError?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Chat / RAG
// ============================================
export interface ChatSessionResponse {
  id: number;
  subjectId: number;
  subjectName: string;
  classroomId?: number;
  classroomName?: string;
  title: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatSessionRequest {
  subjectId: number;
  classroomId?: number;
  title?: string;
}

export interface SendChatMessageRequest {
  question: string;
  topK?: number;
  temperature?: number;
  includeSources?: boolean;
}

export interface RagSourceResponse {
  chunkId: number;
  documentId: number;
  documentTitle: string;
  score: number;
  excerpt: string;
}

export interface TokenUsageResponse {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
}

export interface RagAnswerResponse {
  sessionId: number;
  messageId: number;
  answer: string;
  confidenceScore: number;
  confidenceLevel: string;
  fallback: boolean;
  lowConfidenceReason?: string;
  suggestions?: string[];
  sources?: RagSourceResponse[];
  usage?: TokenUsageResponse;
  createdAt: string;
}

// Chat message (for frontend state)
export interface ChatMessage {
  id: number | string;
  role: 'user' | 'assistant';
  content: string;
  sources?: RagSourceResponse[];
  confidenceScore?: number;
  confidenceLevel?: string;
  createdAt: string;
}

// ============================================
// Question Bank
// ============================================
export interface QuestionBankResponse {
  id: number;
  name: string;
  description?: string;
  subjectId: number;
  subjectName: string;
  published: boolean;
  questionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionBankRequest {
  name: string;
  description?: string;
  subjectId: number;
}

// ============================================
// Question
// ============================================
export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'MULTI_SELECT'
  | 'TRUE_FALSE'
  | 'SHORT_ANSWER'
  | 'ESSAY'
  | 'FILL_IN_BLANK';

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface AnswerOptionResponse {
  id: number;
  content: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface QuestionResponse {
  id: number;
  content: string;
  questionType: QuestionType;
  difficultyLevel: DifficultyLevel;
  explanation?: string;
  answerOptions: AnswerOptionResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnswerOptionRequest {
  content: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface CreateQuestionRequest {
  content: string;
  questionType: QuestionType;
  difficultyLevel: DifficultyLevel;
  explanation?: string;
  answerOptions: CreateAnswerOptionRequest[];
}

// ============================================
// Exam
// ============================================
export type ExamStatus = 'DRAFT' | 'SCHEDULED' | 'ONGOING' | 'FINISHED' | 'CANCELLED';

export interface ExamResponse {
  id: number;
  title: string;
  description?: string;
  classroomId: number;
  classroomName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: ExamStatus;
  totalQuestions: number;
  totalScore: number;
}

// ============================================
// Submission
// ============================================
export type SubmissionStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'AI_GRADED' | 'TEACHER_REVIEWED';

export interface SubmissionSummaryResponse {
  id: number;
  examId: number;
  examTitle: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  startedAt: string;
  submittedAt?: string;
  totalScore?: number;
  status: SubmissionStatus;
}
