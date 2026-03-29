/**
 * API Client with Interceptors
 * Handles authentication, token refresh, and error handling
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as models from '../types/models';
import { tokenStorage } from './token-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:44300';
const API_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000', 10);

class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: {
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  }[] = [];

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const tokens = await tokenStorage.loadTokens();
        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle 401 and refresh token
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue request while token is refreshing
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.axiosInstance(originalRequest);
              })
              .catch(Promise.reject);
          }

          this.isRefreshing = true;
          originalRequest._retry = true;

          try {
            const tokens = await tokenStorage.loadTokens();
            if (!tokens?.refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await this.axiosInstance.post('/auth/refresh', {
              refreshToken: tokens.refreshToken,
            });

            const newTokens: models.AuthTokens = {
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
            };

            await tokenStorage.saveTokens(newTokens);

            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;

            // Process queued requests
            this.failedQueue.forEach((item) => item.resolve(newTokens.accessToken));
            this.failedQueue = [];

            this.isRefreshing = false;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Token refresh failed, logout user
            await tokenStorage.clearTokens();
            this.failedQueue.forEach((item) => item.reject(refreshError));
            this.failedQueue = [];
            this.isRefreshing = false;

            // Redirect to login - this will be handled by auth store
            throw new Error('Authentication failed. Please login again.');
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ============================================
  // Auth Endpoints
  // ============================================

  async register(data: models.RegisterRequest): Promise<models.AuthResponse> {
    const response = await this.axiosInstance.post<models.AuthResponse>(
      '/auth/register',
      data
    );
    return response.data;
  }

  async login(data: models.LoginRequest): Promise<models.AuthResponse> {
    const response = await this.axiosInstance.post<models.AuthResponse>(
      '/auth/login',
      data
    );
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<models.AuthResponse> {
    const response = await this.axiosInstance.post<models.AuthResponse>(
      '/auth/refresh',
      { refreshToken }
    );
    return response.data;
  }

  async logout(): Promise<void> {
    await this.axiosInstance.post('/auth/logout');
  }

  // ============================================
  // User Profile Endpoints
  // ============================================

  async getProfile(): Promise<models.User> {
    const response = await this.axiosInstance.get<models.User>('/users/profile');
    return response.data;
  }

  async updateProfile(data: models.UpdateProfileRequest): Promise<models.User> {
    const response = await this.axiosInstance.put<models.User>(
      '/users/profile',
      data
    );
    return response.data;
  }

  async changePassword(data: models.ChangePasswordRequest): Promise<void> {
    await this.axiosInstance.post('/users/change-password', data);
  }

  // ============================================
  // Pet Endpoints
  // ============================================

  async getPets(pageNumber = 1, pageSize = 10): Promise<models.PaginatedResponse<models.Pet>> {
    const response = await this.axiosInstance.get<models.PaginatedResponse<models.Pet>>(
      '/pets',
      {
        params: { pageNumber, pageSize },
      }
    );
    return response.data;
  }

  async getPetById(id: string): Promise<models.Pet> {
    const response = await this.axiosInstance.get<models.Pet>(`/pets/${id}`);
    return response.data;
  }

  async createPet(data: models.CreatePetRequest): Promise<models.Pet> {
    const response = await this.axiosInstance.post<models.Pet>('/pets', data);
    return response.data;
  }

  async updatePet(id: string, data: models.UpdatePetRequest): Promise<models.Pet> {
    const response = await this.axiosInstance.put<models.Pet>(`/pets/${id}`, data);
    return response.data;
  }

  async deletePet(id: string): Promise<void> {
    await this.axiosInstance.delete(`/pets/${id}`);
  }

  async searchPets(query: string): Promise<models.Pet[]> {
    const response = await this.axiosInstance.get<models.Pet[]>('/pets/search', {
      params: { query },
    });
    return response.data;
  }

  // ============================================
  // Pet Photos Endpoints
  // ============================================

  async addPhoto(petId: string, data: models.AddPhotoRequest): Promise<models.Photo> {
    const response = await this.axiosInstance.post<models.Photo>(
      `/pets/${petId}/photos`,
      data
    );
    return response.data;
  }

  async updatePhoto(
    petId: string,
    photoId: string,
    data: models.UpdatePhotoRequest
  ): Promise<models.Photo> {
    const response = await this.axiosInstance.put<models.Photo>(
      `/pets/${petId}/photos/${photoId}`,
      data
    );
    return response.data;
  }

  async deletePhoto(petId: string, photoId: string): Promise<void> {
    await this.axiosInstance.delete(`/pets/${petId}/photos/${photoId}`);
  }

  // ============================================
  // Pet Documents Endpoints
  // ============================================

  async addDocument(petId: string, data: models.AddDocumentRequest): Promise<models.Document> {
    const response = await this.axiosInstance.post<models.Document>(
      `/pets/${petId}/documents`,
      data
    );
    return response.data;
  }

  async updateDocument(
    petId: string,
    documentId: string,
    data: models.UpdateDocumentRequest
  ): Promise<models.Document> {
    const response = await this.axiosInstance.put<models.Document>(
      `/pets/${petId}/documents/${documentId}`,
      data
    );
    return response.data;
  }

  async deleteDocument(petId: string, documentId: string): Promise<void> {
    await this.axiosInstance.delete(`/pets/${petId}/documents/${documentId}`);
  }

  async downloadDocument(petId: string, documentId: string): Promise<models.DownloadUrl> {
    const response = await this.axiosInstance.get<models.DownloadUrl>(
      `/pets/${petId}/documents/${documentId}/download`
    );
    return response.data;
  }

  // ============================================
  // Public Methods
  // ============================================

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export const apiClient = new ApiClient();
