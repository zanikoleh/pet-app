/**
 * API Client with Interceptors
 * Handles authentication, token refresh, and error handling
 * Uses native Fetch API instead of axios
 */

import { tokenStorage } from '@/services/token-storage';
import * as models from '@/types/models';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:44300';
const API_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000', 10);

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

interface ApiResponse<T = any> {
  data?: T;
  status: number;
  statusText: string;
}

class ApiClient {
  private isRefreshing = false;
  private failedQueue: {
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  }[] = [];

  constructor() {
    // Initialization handled by fetch calls
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  /**
   * Execute fetch request with auth and error handling
   */
  private async fetchWithInterceptors<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options;
    
    const url = this.buildUrl(endpoint, params);
    
    // Set default headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add any custom headers from options
    if (fetchOptions.headers) {
      if (typeof fetchOptions.headers === 'object' && !Array.isArray(fetchOptions.headers)) {
        Object.assign(headers, fetchOptions.headers as Record<string, string>);
      }
    }

    // Add auth token
    const tokens = await tokenStorage.loadTokens();
    if (tokens?.accessToken) {
      headers['Authorization'] = `Bearer ${tokens.accessToken}`;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized with token refresh
      if (response.status === 401) {
        return this.handleTokenRefresh<T>(endpoint, options);
      }

      // Handle other errors
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        (error as any).status = response.status;
        (error as any).response = response;
        throw error;
      }

      // Parse response
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return (await response.json()) as T;
      }

      return undefined as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${API_TIMEOUT}ms`);
      }

      throw error;
    }
  }

  /**
   * Handle token refresh on 401
   */
  private async handleTokenRefresh<T>(
    endpoint: string,
    options: FetchOptions
  ): Promise<T> {
    if (this.isRefreshing) {
      // Queue request while token is refreshing
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      }).then(() => {
        return this.fetchWithInterceptors<T>(endpoint, options);
      });
    }

    this.isRefreshing = true;

    try {
      const tokens = await tokenStorage.loadTokens();
      if (!tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Token refresh failed');
      }

      const refreshData = (await refreshResponse.json()) as any;
      const newTokens: models.AuthTokens = {
        accessToken: refreshData.accessToken,
        refreshToken: refreshData.refreshToken,
      };

      await tokenStorage.saveTokens(newTokens);

      // Process queued requests
      this.failedQueue.forEach((item) => item.resolve(newTokens.accessToken));
      this.failedQueue = [];

      this.isRefreshing = false;

      // Retry original request with new token
      return this.fetchWithInterceptors<T>(endpoint, options);
    } catch (refreshError) {
      // Token refresh failed, logout user
      await tokenStorage.clearTokens();
      this.failedQueue.forEach((item) => item.reject(refreshError));
      this.failedQueue = [];
      this.isRefreshing = false;

      throw new Error('Authentication failed. Please login again.');
    }
  }

  // ============================================
  // Auth Endpoints
  // ============================================

  async register(data: models.RegisterRequest): Promise<models.AuthResponse> {
    return this.fetchWithInterceptors('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: models.LoginRequest): Promise<models.AuthResponse> {
    return this.fetchWithInterceptors('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refreshToken(refreshToken: string): Promise<models.AuthResponse> {
    return this.fetchWithInterceptors('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(): Promise<void> {
    await this.fetchWithInterceptors('/auth/logout', {
      method: 'POST',
    });
  }

  // ============================================
  // User Profile Endpoints
  // ============================================

  async getProfile(): Promise<models.User> {
    return this.fetchWithInterceptors('/users/profile', {
      method: 'GET',
    });
  }

  async updateProfile(data: models.UpdateProfileRequest): Promise<models.User> {
    return this.fetchWithInterceptors('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: models.ChangePasswordRequest): Promise<void> {
    await this.fetchWithInterceptors('/users/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============================================
  // Pet Endpoints
  // ============================================

  async getPets(pageNumber = 1, pageSize = 10): Promise<models.PaginatedResponse<models.Pet>> {
    return this.fetchWithInterceptors('/pets', {
      method: 'GET',
      params: { pageNumber, pageSize },
    });
  }

  async getPetById(id: string): Promise<models.Pet> {
    return this.fetchWithInterceptors(`/pets/${id}`, {
      method: 'GET',
    });
  }

  async createPet(data: models.CreatePetRequest): Promise<models.Pet> {
    return this.fetchWithInterceptors('/pets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePet(id: string, data: models.UpdatePetRequest): Promise<models.Pet> {
    return this.fetchWithInterceptors(`/pets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePet(id: string): Promise<void> {
    await this.fetchWithInterceptors(`/pets/${id}`, {
      method: 'DELETE',
    });
  }

  async searchPets(query: string): Promise<models.Pet[]> {
    return this.fetchWithInterceptors('/pets/search', {
      method: 'GET',
      params: { query },
    });
  }

  // ============================================
  // Pet Photos Endpoints
  // ============================================

  async addPhoto(petId: string, data: models.AddPhotoRequest): Promise<models.Photo> {
    return this.fetchWithInterceptors(`/pets/${petId}/photos`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePhoto(
    petId: string,
    photoId: string,
    data: models.UpdatePhotoRequest
  ): Promise<models.Photo> {
    return this.fetchWithInterceptors(`/pets/${petId}/photos/${photoId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePhoto(petId: string, photoId: string): Promise<void> {
    await this.fetchWithInterceptors(`/pets/${petId}/photos/${photoId}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // Pet Documents Endpoints
  // ============================================

  async addDocument(petId: string, data: models.AddDocumentRequest): Promise<models.Document> {
    return this.fetchWithInterceptors(`/pets/${petId}/documents`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDocument(
    petId: string,
    documentId: string,
    data: models.UpdateDocumentRequest
  ): Promise<models.Document> {
    return this.fetchWithInterceptors(`/pets/${petId}/documents/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDocument(petId: string, documentId: string): Promise<void> {
    await this.fetchWithInterceptors(`/pets/${petId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  async downloadDocument(petId: string, documentId: string): Promise<models.DownloadUrl> {
    return this.fetchWithInterceptors(`/pets/${petId}/documents/${documentId}/download`, {
      method: 'GET',
    });
  }
}

export const apiClient = new ApiClient();
