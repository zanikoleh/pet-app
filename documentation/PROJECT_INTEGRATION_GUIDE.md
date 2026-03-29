# Pet App - Frontend Integration Guide
**Date:** 2026-03-27  
**Frontend**: React Native (Expo), TypeScript  
**Backend**: .NET 10 Microservices (5 services)

## Quick Overview

The frontend (pet-app) is a React Native mobile app that needs to integrate with a .NET 10 microservices backend (pet-app-backend).

### Backend Services (5 Microservices)

| Service | Port | Purpose |
|---------|------|---------|
| 🔐 **Identity** | 44301 | Auth, JWT, OAuth |
| 👤 **User Profile** | 44302 | User profiles & preferences |
| 🐕 **Pet** | 5000 | Pet CRUD, photos, documents |
| 📁 **File** | 44303 | File upload/download |
| 🔔 **Notification** | 44304 | Email/SMS notifications |

**Entry Point for Frontend**: `https://localhost:44300` (API Gateway)

---

## Phase 1: Setup Infrastructure

### Step 1.1: Install Dependencies

```bash
cd pet-app
npm install
# Add these packages:
npm install axios react-native-keychain zustand @react-native-async-storage/async-storage
npm install @tanstack/react-query
```

### Step 1.2: Create API Client

Create `app/services/api.ts`:

```typescript
import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'react-native-keychain';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://localhost:44300';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

class ApiClient {
  private client: AxiosInstance;
  private tokens: AuthTokens | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    // Request interceptor: Add auth header
    this.client.interceptors.request.use((config) => {
      if (this.tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${this.tokens.accessToken}`;
      }
      return config;
    });

    // Response interceptor: Handle 401 & refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config;
        
        if (error.response?.status === 401 && !original._retry) {
          original._retry = true;
          
          try {
            const tokens = await this.refreshAccessToken();
            if (tokens) {
              original.headers.Authorization = `Bearer ${tokens.accessToken}`;
              return this.client(original);
            }
          } catch (refreshError) {
            // Logout user on refresh failure
            await this.logout();
            throw refreshError;
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  async loadTokens(): Promise<void> {
    try {
      const credentials = await SecureStore.getGenericPassword();
      if (credentials) {
        this.tokens = JSON.parse(credentials.password);
      }
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
  }

  async saveTokens(tokens: AuthTokens): Promise<void> {
    this.tokens = tokens;
    try {
      await SecureStore.setGenericPassword(
        'petapp_tokens',
        JSON.stringify(tokens),
        { accessibilityLevel: SecureStore.ACCESS_CONTROL.WHEN_UNLOCKED }
      );
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  }

  async register(email: string, password: string, fullName: string) {
    const response = await this.client.post('/api/auth/register', {
      email,
      password,
      fullName,
    });
    await this.saveTokens(response.data);
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/api/auth/login', {
      email,
      password,
    });
    await this.saveTokens(response.data);
    return response.data;
  }

  async refreshAccessToken(): Promise<AuthTokens | null> {
    if (!this.tokens?.refreshToken) return null;

    try {
      const response = await this.client.post('/api/auth/refresh-token', {
        refreshToken: this.tokens.refreshToken,
      });
      await this.saveTokens(response.data);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    this.tokens = null;
    try {
      await SecureStore.resetGenericPassword();
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  async getCurrentUser() {
    return this.client.get('/api/auth/profile');
  }

  // Pet endpoints
  async getPets(ownerId: string, page: number = 1, pageSize: number = 10) {
    return this.client.get('/api/pets', {
      params: { ownerId, page, pageSize },
    });
  }

  async getPet(petId: string, ownerId: string) {
    return this.client.get(`/api/pets/${petId}`, {
      params: { ownerId },
    });
  }

  async createPet(ownerId: string, petData: any) {
    return this.client.post('/api/pets', petData, {
      params: { ownerId },
    });
  }

  async updatePet(petId: string, ownerId: string, petData: any) {
    return this.client.put(`/api/pets/${petId}`, petData, {
      params: { ownerId },
    });
  }

  async deletePet(petId: string, ownerId: string) {
    return this.client.delete(`/api/pets/${petId}`, {
      params: { ownerId },
    });
  }

  // Add more methods for photos, documents, file upload, etc.
  getClient() {
    return this.client;
  }
}

export const apiClient = new ApiClient();
```

### Step 1.3: Create Auth Store (Zustand)

Create `app/store/authStore.ts`:

```typescript
import { create } from 'zustand';
import { apiClient } from '../services/api';

interface User {
  id: string;
  email: string;
  fullName?: string;
  avatar?: string;
  isEmailVerified: boolean;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  register: (email: string, password: string, fullName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  register: async (email, password, fullName) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.register(email, password, fullName);
      set({ user: response.user, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Registration failed', isLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.login(email, password);
      set({ user: response.user, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Login failed', isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiClient.logout();
      set({ user: null, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      await apiClient.loadTokens();
      const response = await apiClient.getCurrentUser();
      set({ user: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));
```

### Step 1.4: Initialize App

Update `app/_layout.tsx`:

```typescript
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { apiClient } from './services/api';

export default function RootLayout() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    const initApp = async () => {
      // Load tokens and user on app start
      await loadUser();
    };
    initApp();
  }, [loadUser]);

  // Rest of your layout code...
}
```

---

## Phase 2: Build Core Features

### Step 2.1: Login/Register Screens

Create `app/(tabs)/auth.tsx`:

```typescript
import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { useAuthStore } from './store/authStore';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  
  const { login, register, isLoading, error } = useAuthStore();

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, fullName);
      }
      // Navigation handled automatically by router
    } catch (error) {
      // Error displayed via error state
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        editable={!isLoading}
      />
      {!isLogin && (
        <TextInput
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          editable={!isLoading}
        />
      )}
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!isLoading}
      />
      
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      
      <TouchableOpacity onPress={handleSubmit} disabled={isLoading}>
        <Text>{isLoading ? 'Loading...' : isLogin ? 'Login' : 'Register'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text>
          {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Step 2.2: Pet List Screen

Create `app/(tabs)/pets.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { View, FlatList, Text, ActivityIndicator } from 'react-native';
import { useAuthStore } from './store/authStore';
import { apiClient } from './services/api';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string;
  description?: string;
  dateOfBirth: string;
}

export default function PetsScreen() {
  const { user } = useAuthStore();
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const loadPets = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.getPets(user.id, page);
        setPets(response.data.items);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Failed to load pets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPets();
  }, [user?.id, page]);

  if (!user) {
    return <Text>Please log in</Text>;
  }

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.name}</Text>
            <Text>{item.type} {item.breed && `- ${item.breed}`}</Text>
          </View>
        )}
      />
      {page < totalPages && (
        <TouchableOpacity onPress={() => setPage(page + 1)}>
          <Text>Load More</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

---

## Critical Implementation Details

### Authentication
```
POST /api/auth/register → { user, accessToken, refreshToken, expiresAt }
POST /api/auth/login    → { user, accessToken, refreshToken, expiresAt }
POST /api/auth/refresh-token → Same response
Authorization: Bearer <accessToken>
```

### Pet Operations
```
⚠️  ALL pet endpoints require: ownerId query parameter
GET    /api/pets?ownerId={userId}&page=1&pageSize=10
POST   /api/pets?ownerId={userId} → Create new pet
GET    /api/pets/{petId}?ownerId={userId}
PUT    /api/pets/{petId}?ownerId={userId} → Update pet
DELETE /api/pets/{petId}?ownerId={userId} → Delete pet
```

### Error Handling
```typescript
try {
  await apiClient.login(email, password);
} catch (error) {
  const errorCode = error.response?.data?.code; // "VALIDATION_ERROR", "UNAUTHORIZED", etc.
  const errorMsg = error.response?.data?.error;
  const errors = error.response?.data?.errors; // Field-specific errors
}
```

### Token Lifecycle
1. Login → Get access + refresh tokens (15 min + 7 days)
2. Request with access token
3. 401 response → Auto-refresh with refresh token
4. Get new access token
5. Retry original request
6. On refresh failure → Logout user

---

## Environment Configuration

Create `.env.local`:

```
EXPO_PUBLIC_API_URL=https://localhost:44300
EXPO_PUBLIC_ENV=development
```

Create `.env.production`:

```
EXPO_PUBLIC_API_URL=https://api.petapp.com
EXPO_PUBLIC_ENV=production
```

---

## Testing Workflow

1. **Start Backend**:
   ```bash
   cd pet-app-backend
   docker-compose up --build
   ```

2. **Check Services**:
   - Identity Swagger: https://localhost:44301/swagger
   - Pet Swagger: http://localhost:5000/swagger
   - Other services: 44302, 44303, 44304

3. **Test in Frontend**:
   ```bash
   cd pet-app
   npm start
   ```

4. **Register & Login**:
   - Use app register screen
   - Check that tokens are stored securely
   - Verify pet list loads

---

## Data Models Required

### Authentication
```typescript
interface AuthResponse {
  user: {
    id: UUID;
    email: string;
    fullName?: string;
    avatar?: string;
    isEmailVerified: boolean;
    isActive: boolean;
    createdAt: ISO8601;
    oAuthLinks: { provider: string; linkedAt: ISO8601 }[];
  };
  accessToken: string;
  refreshToken: string;
  expiresAt: ISO8601;
}
```

### Pet
```typescript
interface Pet {
  id: UUID;
  ownerId: UUID;
  name: string;
  type: string;
  breed?: string;
  dateOfBirth: ISO8601;
  description?: string;
  createdAt: ISO8601;
  updatedAt?: ISO8601;
  photos: Photo[];
  documents: Document[];
}

interface Photo {
  id: UUID;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  url: string;
  uploadedAt: ISO8601;
  caption?: string;
  tags?: string;
}
```

---

## Common Mistakes to Avoid

❌ **DON'T**: Store token in localStorage or plain AsyncStorage  
✅ **DO**: Use react-native-keychain for secure storage

❌ **DON'T**: Forget ownerId query param in pet endpoints  
✅ **DO**: Always include ?ownerId={userId}

❌ **DON'T**: Use JSON body for file uploads  
✅ **DO**: Use multipart/form-data

❌ **DON'T**: Ignore 401 errors and redirect immediately  
✅ **DO**: Attempt token refresh before logout

❌ **DON'T**: Make all requests without auth header  
✅ **DO**: Use axios interceptor to add auth header automatically

---

## Next Phase: File Uploads & Advanced Features

See `BACKEND_API_SPECIFICATION.md` for:
- File upload endpoint details
- Photo management endpoints
- Document management endpoints
- Notification preferences API
- User profile updates

---

**See Also**:
- `/pet-app-backend/project-state-docs/BACKEND_API_SPECIFICATION.md` - Full API reference
- `/pet-app-backend/project-state-docs/BACKEND_ARCHITECTURE_SUMMARY.md` - Architecture details
- `/pet-app/project-state-docs/2026-03-27-project-status.md` - Frontend status
