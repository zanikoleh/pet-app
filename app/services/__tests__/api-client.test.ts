/**
 * Tests for API Client with Fetch
 * Tests auth interceptors, token refresh, error handling, and all API endpoints
 */

import * as models from '../../types/models';

// Mock modules BEFORE importing the actual module
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
  STORAGE_TYPE: { AES_GCM_NO_AUTH: 'AES_GCM_NO_AUTH' },
}));

// NOW import the modules
import { apiClient } from '../api-client';
import { tokenStorage } from '../token-storage';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Spy on tokenStorage methods
    jest.spyOn(tokenStorage, 'loadTokens');
    jest.spyOn(tokenStorage, 'saveTokens');
    jest.spyOn(tokenStorage, 'clearTokens');
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('Request Interceptors - Auth Token', () => {
    it('should add authorization header when token exists', async () => {
      const mockTokens: models.AuthTokens = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };

      (tokenStorage.loadTokens as jest.Mock).mockResolvedValueOnce(mockTokens);

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: '123' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );

      await apiClient.getProfile();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-access-token',
          }),
        })
      );
    });

    it('should not add authorization header when no token', async () => {
      (tokenStorage.loadTokens as jest.Mock).mockResolvedValueOnce(null);

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: '123' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );

      await apiClient.getProfile();

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1]?.headers).not.toHaveProperty('Authorization');
    });
  });;;

  describe('Response Interceptors - Token Refresh', () => {
    it('should refresh token on 401 response', async () => {
      const tokens: models.AuthTokens = {
        accessToken: 'old-access-token',
        refreshToken: 'old-refresh-token',
      };

      const newTokens: models.AuthTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      (tokenStorage.loadTokens as jest.Mock)
        .mockResolvedValueOnce(tokens)
        .mockResolvedValueOnce(tokens) // For refresh attempt
        .mockResolvedValueOnce(newTokens); // After refresh

      // First call returns 401
      mockFetch.mockResolvedValueOnce(
        new Response(null, { status: 401 })
      );

      // Refresh token call
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
          }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }
        )
      );

      // Retry original request
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: '123', email: 'test@example.com' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );

      const result = await apiClient.getProfile();

      expect(tokenStorage.saveTokens).toHaveBeenCalledWith(newTokens);
      expect(result).toEqual({ id: '123', email: 'test@example.com' });
      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + refresh + retry
    });

    it('should clear tokens and throw error when refresh fails', async () => {
      const tokens: models.AuthTokens = {
        accessToken: 'old-access-token',
        refreshToken: 'old-refresh-token',
      };

      (tokenStorage.loadTokens as jest.Mock)
        .mockResolvedValueOnce(tokens)
        .mockResolvedValueOnce(tokens); // For refresh attempt

      // First call returns 401
      mockFetch.mockResolvedValueOnce(
        new Response(null, { status: 401 })
      );

      // Refresh token call fails
      mockFetch.mockResolvedValueOnce(
        new Response(null, { status: 401 })
      );

      await expect(apiClient.getProfile()).rejects.toThrow(
        'Authentication failed. Please login again.'
      );

      expect(tokenStorage.clearTokens).toHaveBeenCalled();
    });
  });;

  describe('Error Handling', () => {
    it('should throw error on HTTP error response', async () => {
      (tokenStorage.loadTokens as jest.Mock).mockResolvedValue(null);

      mockFetch.mockResolvedValueOnce(
        new Response(null, { status: 500, statusText: 'Internal Server Error' })
      );

      await expect(apiClient.getProfile()).rejects.toThrow(
        'HTTP 500: Internal Server Error'
      );
    });

    it('should handle timeout', async () => {
      (tokenStorage.loadTokens as jest.Mock).mockResolvedValue(null);

      mockFetch.mockImplementation(
        () =>
          new Promise((_, reject) => {
            const controller = new AbortController();
            controller.abort();
            reject(new DOMException('The operation was aborted', 'AbortError'));
          })
      );

      // Manually simulate abort
      mockFetch.mockImplementationOnce(() => {
        const error = new Error('');
        (error as any).name = 'AbortError';
        return Promise.reject(error);
      });

      await expect(apiClient.getProfile()).rejects.toThrow('Request timeout');
    });
  });

  describe('Auth Endpoints', () => {
    beforeEach(() => {
      (tokenStorage.loadTokens as jest.Mock).mockResolvedValue(null);
    });

    it('should call register endpoint', async () => {
      const registerData: models.RegisterRequest = {
        email: 'newuser@example.com',
        password: 'password123',
        fullName: 'New User',
      };

      const response: models.AuthResponse = {
        user: {
          id: '123',
          email: 'newuser@example.com',
          fullName: 'New User',
          isEmailVerified: false,
          isActive: true,
          createdAt: new Date().toISOString(),
          oAuthLinks: [],
        },
        accessToken: 'access-123',
        refreshToken: 'refresh-123',
        expiresAt: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(response), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );

      const result = await apiClient.register(registerData);

      expect(result).toEqual(response);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(registerData),
        })
      );
    });

    it('should call login endpoint', async () => {
      const loginData: models.LoginRequest = {
        email: 'user@example.com',
        password: 'password123',
      };

      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            user: { id: '123' },
            accessToken: 'token',
            refreshToken: 'refresh',
            expiresAt: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }
        )
      );

      await apiClient.login(loginData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should call logout endpoint', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(null, { status: 200 })
      );

      await apiClient.logout();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/logout'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });;

  describe('User Profile Endpoints', () => {
    beforeEach(() => {
      (tokenStorage.loadTokens as jest.Mock).mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'refresh',
      });
    });

    it('should fetch user profile', async () => {
      const userData: models.User = {
        id: '123',
        email: 'user@example.com',
        fullName: 'Test User',
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        oAuthLinks: [],
      };

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(userData), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );

      const result = await apiClient.getProfile();

      expect(result).toEqual(userData);
    });

    it('should update user profile', async () => {
      const updateData: models.UpdateProfileRequest = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: '123', firstName: 'Updated' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );

      await apiClient.updateProfile(updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/profile'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        })
      );
    });

    it('should change password', async () => {
      const changePasswordData: models.ChangePasswordRequest = {
        currentPassword: 'old123',
        newPassword: 'new123',
      };

      mockFetch.mockResolvedValueOnce(
        new Response(null, { status: 200 })
      );

      await apiClient.changePassword(changePasswordData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/change-password'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });;

  describe('Pet Endpoints', () => {
    beforeEach(() => {
      (tokenStorage.loadTokens as jest.Mock).mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'refresh',
      });
    });

    it('should fetch pets with pagination', async () => {
      const response: models.PaginatedResponse<models.Pet> = {
        items: [
          {
            id: '1',
            ownerId: '123',
            name: 'Fluffy',
            type: 'Cat',
            dateOfBirth: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            photos: [],
            documents: [],
          },
        ],
        totalCount: 1,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      };

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(response), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );

      const result = await apiClient.getPets(1, 10);

      expect(result).toEqual(response);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('pageNumber=1'),
        expect.any(Object)
      );
    });

    it('should fetch pet by id', async () => {
      const petId = 'pet-123';
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: petId, name: 'Buddy' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );

      await apiClient.getPetById(petId);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/pets/${petId}`),
        expect.any(Object)
      );
    });

    it('should create a pet', async () => {
      const createData: models.CreatePetRequest = {
        name: 'Rex',
        type: 'Dog',
        dateOfBirth: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: '1', ...createData }), {
          status: 201,
          headers: { 'content-type': 'application/json' },
        })
      );

      await apiClient.createPet(createData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/pets'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(createData),
        })
      );
    });

    it('should update a pet', async () => {
      const petId = 'pet-123';
      const updateData: models.UpdatePetRequest = {
        name: 'Updated Name',
      };

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: petId, ...updateData }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );

      await apiClient.updatePet(petId, updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/pets/${petId}`),
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });

    it('should delete a pet', async () => {
      const petId = 'pet-123';

      mockFetch.mockResolvedValueOnce(
        new Response(null, { status: 204 })
      );

      await apiClient.deletePet(petId);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/pets/${petId}`),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should search pets', async () => {
      const query = 'fluffy';
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify([{ id: '1', name: 'Fluffy' }]), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );

      await apiClient.searchPets(query);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('query=fluffy'),
        expect.any(Object)
      );
    });
  });;

  describe('Pet Photos Endpoints', () => {
    beforeEach(() => {
      (tokenStorage.loadTokens as jest.Mock).mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'refresh',
      });
    });

    it('should add a photo to pet', async () => {
      const petId = 'pet-123';
      const photoData: models.AddPhotoRequest = {
        fileName: 'photo.jpg',
        fileType: 'image/jpeg',
        fileSizeBytes: 1024,
        url: 'https://example.com/photo.jpg',
      };

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: '1', ...photoData }), {
          status: 201,
          headers: { 'content-type': 'application/json' },
        })
      );

      await apiClient.addPhoto(petId, photoData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/pets/${petId}/photos`),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should update a photo', async () => {
      const petId = 'pet-123';
      const photoId = 'photo-456';
      const updateData: models.UpdatePhotoRequest = {
        caption: 'Updated caption',
      };

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: photoId, ...updateData }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );

      await apiClient.updatePhoto(petId, photoId, updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/pets/${petId}/photos/${photoId}`),
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });

    it('should delete a photo', async () => {
      const petId = 'pet-123';
      const photoId = 'photo-456';

      mockFetch.mockResolvedValueOnce(
        new Response(null, { status: 204 })
      );

      await apiClient.deletePhoto(petId, photoId);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/pets/${petId}/photos/${photoId}`),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });;

  describe('Pet Documents Endpoints', () => {
    beforeEach(() => {
      (tokenStorage.loadTokens as jest.Mock).mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'refresh',
      });
    });

    it('should add a document to pet', async () => {
      const petId = 'pet-123';
      const docData: models.AddDocumentRequest = {
        fileName: 'doc.pdf',
        fileType: 'application/pdf',
        fileSizeBytes: 2048,
        url: 'https://example.com/doc.pdf',
        category: 'Vaccination Certificate',
      };

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: '1', ...docData }), {
          status: 201,
          headers: { 'content-type': 'application/json' },
        })
      );

      await apiClient.addDocument(petId, docData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/pets/${petId}/documents`),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should delete a document', async () => {
      const petId = 'pet-123';
      const docId = 'doc-456';

      mockFetch.mockResolvedValueOnce(
        new Response(null, { status: 204 })
      );

      await apiClient.deleteDocument(petId, docId);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/pets/${petId}/documents/${docId}`),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should download document', async () => {
      const petId = 'pet-123';
      const docId = 'doc-456';
      const downloadUrl: models.DownloadUrl = {
        downloadUrl: 'https://example.com/download/doc.pdf',
      };

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(downloadUrl), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );

      const result = await apiClient.downloadDocument(petId, docId);

      expect(result).toEqual(downloadUrl);
    });
  });;

  describe('Request Queueing on 401', () => {
    it('should queue failed requests during token refresh', async () => {
      const tokens: models.AuthTokens = {
        accessToken: 'old-token',
        refreshToken: 'old-refresh',
      };

      const newTokens: models.AuthTokens = {
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
      };

      (tokenStorage.loadTokens as jest.Mock)
        .mockResolvedValueOnce(tokens)
        .mockResolvedValueOnce(tokens)
        .mockResolvedValueOnce(newTokens);

      // First 401
      mockFetch.mockResolvedValueOnce(new Response(null, { status: 401 }));

      // Refresh success
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            accessToken: 'new-token',
            refreshToken: 'new-refresh',
          }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }
        )
      );

      // Retry
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: '123' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );

      const result = await apiClient.getProfile();

      expect(result).toBeDefined();
      expect(tokenStorage.saveTokens).toHaveBeenCalledWith(newTokens);
    });
  });
});
