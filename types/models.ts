/**
 * Pet App - TypeScript Data Models
 * All interfaces for API communication and state management
 */

// ============================================
// Authentication
// ============================================

export interface User {
  id: string; // UUID
  email: string;
  fullName?: string;
  avatar?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string; // ISO 8601
  updatedAt?: string;
  lastLoginAt?: string;
  oAuthLinks: OAuthLink[];
}

export interface OAuthLink {
  provider: 'google' | 'facebook' | 'apple';
  linkedAt: string; // ISO 8601
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO 8601
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ============================================
// User Profile
// ============================================

export interface UserProfile {
  id: string; // UUID
  userId: string; // UUID
  firstName: string;
  lastName: string;
  bio?: string;
  dateOfBirth?: string; // ISO 8601
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  profilePictureUrl?: string;
  language: string;
  timezone: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationPreferences {
  id: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  receivePromotions: boolean;
  receiveNewsletter: boolean;
  updatedAt?: string;
}

// ============================================
// Pets
// ============================================

export interface Pet {
  id: string; // UUID
  ownerId: string; // UUID
  name: string;
  type: string; // "Dog", "Cat", "Bird", etc.
  breed?: string;
  dateOfBirth: string; // ISO 8601
  description?: string;
  createdAt: string;
  updatedAt?: string;
  photos: Photo[];
  documents: Document[];
}

export interface Photo {
  id: string; // UUID
  fileName: string;
  fileType: string; // "image/jpeg", etc.
  fileSizeBytes: number;
  url: string;
  uploadedAt: string;
  caption?: string;
  tags?: string; // comma-separated
}

export interface Document {
  id: string; // UUID
  fileName: string;
  fileType: string; // "application/pdf", etc.
  fileSizeBytes: number;
  url: string;
  category: string; // "vaccination", "medical", "insurance", etc.
  uploadedAt: string;
  description?: string;
}

// ============================================
// File Service
// ============================================

export interface FileMetadata {
  id: string; // UUID
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  category?: string;
  relatedEntityId?: string; // UUID
  userId: string; // UUID
  uploadedAt: string;
  virusScanStatus: 'pending' | 'clean' | 'infected';
  storageUrl: string;
}

export interface DownloadUrl {
  downloadUrl: string;
}

// ============================================
// API Response Wrappers
// ============================================

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedListDto<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// ============================================
// Error Responses
// ============================================

export interface ApiError {
  error: string;
  code: string;
  errors?: Record<string, string[]>;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ============================================
// Request DTOs
// ============================================

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CreatePetRequest {
  name: string;
  type: string;
  breed?: string;
  dateOfBirth: string; // ISO 8601
  description?: string;
}

export interface UpdatePetRequest {
  name?: string;
  breed?: string;
  description?: string;
}

export interface AddPhotoRequest {
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  url: string;
  caption?: string;
  tags?: string;
}

export interface UpdatePhotoRequest {
  caption?: string;
  tags?: string;
}

export interface AddDocumentRequest {
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  url: string;
  category: string;
  description?: string;
}

export interface UpdateDocumentRequest {
  description?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  profilePictureUrl?: string;
}

export interface UpdateNotificationPreferencesRequest {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  smsNotifications?: boolean;
  receivePromotions?: boolean;
  receiveNewsletter?: boolean;
}

export interface UpdateLanguageRequest {
  language: string;
  timezone: string;
}

export interface EmailCheckRequest {
  email: string;
}

export interface EmailCheckResponse {
  exists: boolean;
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  htmlBody?: string;
}

export interface SendSmsRequest {
  phoneNumber: string;
  message: string;
}

// ============================================
// OAuth
// ============================================

export interface OAuthLoginRequest {
  provider: 'google' | 'facebook' | 'apple';
  code?: string;
  idToken?: string;
}

export interface LinkOAuthRequest {
  provider: 'google' | 'facebook' | 'apple';
  providerUserId: string;
  providerEmail: string;
}

export interface UnlinkOAuthRequest {
  provider: 'google' | 'facebook' | 'apple';
}

// ============================================
// Type Guards
// ============================================

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    'code' in error
  );
}

export function isPaginatedResponse<T>(
  data: unknown
): data is PaginatedResponse<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'items' in data &&
    'pageNumber' in data &&
    'totalCount' in data
  );
}
