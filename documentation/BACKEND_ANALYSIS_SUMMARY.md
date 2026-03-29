# Backend Analysis Summary
**Date:** 2026-03-27  
**Status:** ✅ Complete

## Backend Overview

The **pet-app-backend** is a production-ready .NET 10 microservices architecture.

### 5 Microservices

| Service | Port | Key Features |
|---------|------|--------------|
| **Identity** | 44301 | Register, Login, JWT, OAuth, Password reset |
| **User Profile** | 44302 | Profiles, Preferences, Notifications settings |
| **Pet** | 5000 | Pet CRUD, Photos, Medical documents, Search |
| **File** | 44303 | Upload/Download, Virus scan, Signed URLs |
| **Notification** | 44304 | Email, SMS, Event-driven |

**Entry Point**: API Gateway at `https://localhost:44300` (routes to services)

---

## Critical Information for Frontend

### Authentication
```
1. POST /api/auth/register (email, password, fullName)
   → { user, accessToken, refreshToken, expiresAt }

2. Store tokens securely in react-native-keychain

3. Add to every request:
   Authorization: Bearer <accessToken>

4. Token expires in 15 minutes
   → Call POST /api/auth/refresh-token to get new one

5. Refresh token expires in 7 days
   → User must login again after 7 days
```

### Pet Service (Most Important)
```
⚠️  ALL endpoints require: ?ownerId={userId} query parameter

GET    /api/pets?ownerId={id}&page=1&pageSize=10
  → Returns: { items, pageNumber, pageSize, totalCount, totalPages }

POST   /api/pets?ownerId={id}
  → Create: { name, type, breed, dateOfBirth, description }

GET    /api/pets/{petId}?ownerId={id}
  → Get single pet

PUT    /api/pets/{petId}?ownerId={id}
  → Update: { name, breed, description }

DELETE /api/pets/{petId}?ownerId={id}
  → Delete pet

GET    /api/pets/search?ownerId={id}&searchTerm=Buddy
  → Search by name

GET    /api/pets/{petId}/photos?ownerId={id}
  → Get pet photos

POST   /api/pets/{petId}/photos?ownerId={id}
  → Add photo

GET    /api/pets/{petId}/documents?ownerId={id}
  → Get medical records

POST   /api/pets/{petId}/documents?ownerId={id}
  → Add medical document
```

### File Uploads
```
POST /api/files/upload
  → Use multipart/form-data
  → Fields: file, category (optional), relatedEntityId (optional)
  → Returns: { fileId, fileName, url, downloadUrl }

GET /api/files/{fileId}/download-url?expirationMinutes=60
  → Returns: { downloadUrl } (signed URL expires in X minutes)
```

### Error Format
```json
{
  "error": "User not found",
  "code": "NOT_FOUND",
  "errors": {
    "email": ["Invalid email format"]
  }
}
```

---

## Setup Instructions

### 1. Start Backend
```bash
cd ../pet-app-backend
docker-compose up --build
```

### 2. Install Frontend Dependencies
```bash
cd pet-app
npm install axios react-native-keychain zustand @tanstack/react-query
```

### 3. Create API Client
See `PROJECT_INTEGRATION_GUIDE.md` for complete code.

### 4. Implement Auth Store
See `PROJECT_INTEGRATION_GUIDE.md` for complete code.

### 5. Build Features Progressively
- Login/Register screens
- Pet list screen
- Pet CRUD screens
- File upload

---

## Development Checklist

- [ ] Understand microservices architecture
- [ ] Review 5 service ports (44300-44304)
- [ ] Install HTTP client (Axios) and state management (Zustand)
- [ ] Create API client with token refresh logic
- [ ] Implement secure token storage (react-native-keychain)
- [ ] Build login/register screens
- [ ] Test pet list endpoint with real JWT token
- [ ] Implement pet CRUD operations
- [ ] Add file upload capability
- [ ] Handle errors gracefully
- [ ] Setup environment configuration (.env)
- [ ] Add loading/error states UI
- [ ] Test on multiple platforms (iOS, Android, Web)

---

## Testing the API

### Use Swagger UI
- Identity: https://localhost:44301/swagger
- User Profile: https://localhost:44302/swagger
- Pet: http://localhost:5000/swagger
- File: https://localhost:44303/swagger
- Notification: https://localhost:44304/swagger

### Manual Testing with curl
```bash
# Register
curl -X POST https://localhost:44301/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "Pass123!", "fullName": "John"}'

# Login
curl -X POST https://localhost:44301/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "Pass123!"}'

# Get pets (using token from login response)
curl -X GET "https://localhost:44300/api/pets?ownerId=<uuid>&page=1" \
  -H "Authorization: Bearer <accessToken>"
```

---

## Complete Documentation

See:
- `PROJECT_INTEGRATION_GUIDE.md` - Step-by-step integration code
- `../pet-app-backend/project-state-docs/BACKEND_API_SPECIFICATION.md` - Full API reference (737 lines)
- `../pet-app-backend/project-state-docs/BACKEND_ARCHITECTURE_SUMMARY.md` - Architecture details

---

## Next Phase Development Plan

**Phase 1: Infrastructure** (2-3 days)
- HTTP client with auth interceptors
- Token storage & refresh logic
- State management setup

**Phase 2: Core Features** (3-4 days)
- Login/Register
- Pet list with pagination
- Pet CRUD operations
- User profile

**Phase 3: Advanced** (2-3 days)
- File uploads with photos
- Medical documents
- Search functionality
- Notifications

**Phase 4: Quality** (2-3 days)
- Testing setup
- CI/CD pipeline
- Performance optimization

---

**Status**: Backend fully analyzed and documented. Ready for frontend integration! 🚀
