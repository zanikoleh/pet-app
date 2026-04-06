/**
 * Authentication Store (Zustand)
 * Manages user authentication state and actions
 */

import { apiClient } from '@/services/api-client';
import { tokenStorage } from '@/services/token-storage';
import * as models from '@/types/models';
import { create } from 'zustand';

interface AuthStore {
  // State
  user: models.User | null;
  tokens: models.AuthTokens | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  tokens: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  register: async (email: string, password: string, fullName?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.register({
        email,
        password,
        fullName,
      });

      await tokenStorage.saveTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      set({
        user: response.user,
        tokens: {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        },
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        'Registration failed';
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.login({
        email,
        password,
      });

      await tokenStorage.saveTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      set({
        user: response.user,
        tokens: {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        },
        isLoading: false,
        isInitialized: true,
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        'Login failed';
      set({
        error: errorMessage,
        isLoading: false,
        isInitialized: true,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      try {
        await apiClient.logout();
      } catch (error) {
        // Ignore logout errors, just clear local state
        console.warn('Logout API call failed, clearing local state', error);
      }

      await tokenStorage.clearTokens();

      set({
        user: null,
        tokens: null,
        error: null,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Error during logout:', error);
      // Clear state anyway
      set({
        user: null,
        tokens: null,
        error: null,
        isLoading: false,
      });
    }
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const tokens = await tokenStorage.loadTokens();

      if (!tokens?.accessToken) {
        set({
          user: null,
          tokens: null,
          isLoading: false,
          isInitialized: true,
        });
        return;
      }

      // Try to fetch user profile
      try {
        const user = await apiClient.getProfile();
        set({
          user,
          tokens,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      } catch (error) {
        // If profile fetch fails, tokens might be invalid
        console.warn('Failed to load user profile, clearing tokens', error);
        await tokenStorage.clearTokens();
        set({
          user: null,
          tokens: null,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      }
    } catch (error: any) {
      console.error('Error loading user:', error);
      set({
        user: null,
        tokens: null,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    }
  },

  refreshToken: async () => {
    try {
      const currentTokens = get().tokens;

      if (!currentTokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.refreshToken(currentTokens.refreshToken);

      const newTokens: models.AuthTokens = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };

      await tokenStorage.saveTokens(newTokens);

      set({
        tokens: newTokens,
        user: response.user,
        error: null,
      });
    } catch (error: any) {
      // Refresh failed, logout user
      await tokenStorage.clearTokens();
      set({
        user: null,
        tokens: null,
        error: 'Session expired. Please login again.',
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
