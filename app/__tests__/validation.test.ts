/**
 * Basic validation tests for models and types
 */

import {
    AuthTokens,
    CreatePetRequest,
    LoginRequest,
    Pet,
    User,
} from '@/types/models';

describe('TypeScript Models', () => {
  describe('User model', () => {
    it('should create a valid user object', () => {
      const user: User = {
        id: '123',
        email: 'test@example.com',
        fullName: 'Test User',
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        oAuthLinks: [],
      };

      expect(user.id).toBe('123');
      expect(user.email).toBe('test@example.com');
      expect(user.oAuthLinks).toEqual([]);
    });
  });

  describe('Pet model', () => {
    it('should create a valid pet object', () => {
      const pet: Pet = {
        id: '456',
        ownerId: '123',
        name: 'Fluffy',
        type: 'Cat',
        dateOfBirth: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        photos: [],
        documents: [],
      };

      expect(pet.name).toBe('Fluffy');
      expect(pet.type).toBe('Cat');
      expect(pet.photos).toEqual([]);
    });
  });

  describe('AuthTokens model', () => {
    it('should create valid auth tokens', () => {
      const tokens: AuthTokens = {
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
      };

      expect(tokens.accessToken).toBe('access-123');
      expect(tokens.refreshToken).toBe('refresh-456');
    });
  });

  describe('Request models', () => {
    it('should create a valid login request', () => {
      const loginReq: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      expect(loginReq.email).toBe('test@example.com');
      expect(loginReq.password).toBe('password123');
    });

    it('should create a valid create pet request', () => {
      const createPetReq: CreatePetRequest = {
        name: 'Buddy',
        type: 'Dog',
        dateOfBirth: new Date().toISOString(),
      };

      expect(createPetReq.name).toBe('Buddy');
      expect(createPetReq.type).toBe('Dog');
    });
  });
});
