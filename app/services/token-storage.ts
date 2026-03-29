/**
 * Secure Token Storage Service
 * Uses react-native-keychain for secure storage on mobile
 * Falls back to AsyncStorage for web development
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { AuthTokens } from '../types/models';

const TOKEN_STORAGE_KEY = 'pet-app-auth-tokens';
const USE_KEYCHAIN = true;

class TokenStorage {
  /**
   * Save tokens securely
   */
  async saveTokens(tokens: AuthTokens): Promise<void> {
    try {
      const tokenJson = JSON.stringify(tokens);

      if (USE_KEYCHAIN) {
        try {
          await Keychain.setGenericPassword(
            TOKEN_STORAGE_KEY,
            tokenJson,
            {
              service: 'pet-app',
              storage: Keychain.STORAGE_TYPE.AES,
            }
          );
        } catch (error) {
          // Fallback to AsyncStorage if Keychain fails
          console.warn('Keychain storage failed, falling back to AsyncStorage', error);
          await AsyncStorage.setItem(TOKEN_STORAGE_KEY, tokenJson);
        }
      } else {
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, tokenJson);
      }
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw new Error('Failed to save authentication tokens');
    }
  }

  /**
   * Load tokens from secure storage
   */
  async loadTokens(): Promise<AuthTokens | null> {
    try {
      let tokenJson: string | null = null;

      if (USE_KEYCHAIN) {
        try {
          const credentials = await Keychain.getGenericPassword({
            service: 'pet-app',
            storage: Keychain.STORAGE_TYPE.AES,
          });

          if (credentials && credentials.password) {
            tokenJson = credentials.password;
          }
        } catch (error) {
          // Fallback to AsyncStorage if Keychain fails
          console.warn('Keychain retrieval failed, falling back to AsyncStorage', error);
          tokenJson = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        }
      } else {
        tokenJson = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      }

      if (!tokenJson) {
        return null;
      }

      const tokens = JSON.parse(tokenJson) as AuthTokens;
      return tokens;
    } catch (error) {
      console.error('Error loading tokens:', error);
      return null;
    }
  }

  /**
   * Clear tokens from storage
   */
  async clearTokens(): Promise<void> {
    try {
      if (USE_KEYCHAIN) {
        try {
          await Keychain.resetGenericPassword({
            service: 'pet-app',
            storage: Keychain.STORAGE_TYPE.AES,
          });
        } catch (error) {
          // Fallback to AsyncStorage if Keychain fails
          console.warn('Keychain clear failed, falling back to AsyncStorage', error);
          await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      } else {
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error clearing tokens:', error);
      throw new Error('Failed to clear authentication tokens');
    }
  }

  /**
   * Check if tokens are stored
   */
  async hasTokens(): Promise<boolean> {
    const tokens = await this.loadTokens();
    return tokens !== null;
  }
}

export const tokenStorage = new TokenStorage();
