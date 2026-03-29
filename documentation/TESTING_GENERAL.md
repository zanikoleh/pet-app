# Pet App - Testing Guide

This guide explains how to test if the Pet App project is working correctly.

## 1. **Code Quality - Linting** ✅

Check for TypeScript and code quality issues:

```bash
npm run lint
```

**Expected Output:**
- 0 errors
- 0 warnings

**What it checks:**
- TypeScript syntax and type errors
- ESLint rules (style, best practices)
- Component structure

---

## 2. **Unit Tests** ✅

Run Jest unit tests:

```bash
npm test
# or with more details:
npx jest --verbose
# or watch mode:
npx jest --watch
```

**Expected Output:**
```
Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
```

**What's tested:**
- TypeScript models (User, Pet, AuthTokens, etc.)
- Request/Response DTOs
- Type safety

---

## 3. **Build Compilation** ✅

Check if the app builds successfully for web:

```bash
npm run web
```

**Expected Output:**
```
λ Bundled 2304ms node_modules/expo-router/entry.js (1083 modules)
LOG  [web] Logs will appear in the browser console
```

**Open browser:**
- Navigate to http://localhost:8081
- You should see the app loading with a spinner

**What it validates:**
- TypeScript compilation
- Module resolution
- Metro bundler compatibility
- All imports work correctly

---

## 4. **Dependencies Check** ✅

Verify all required dependencies are installed:

```bash
npm list --depth=0 | grep -E "axios|zustand|@tanstack|keychain|hook-form|zod"
```

**Expected Output:**
```
├── @tanstack/react-query@5.95.2
├── axios@1.13.6
├── jest@30.3.0
├── react-hook-form@7.72.0
├── react-native-keychain@10.0.0
├── zod@4.3.6
└── zustand@5.0.12
```

---

## 5. **Type Checking** ✅

Verify TypeScript compilation without building:

```bash
npx tsc --noEmit
```

**Expected Output:**
- No output (success)
- Exit code: 0

---

## 6. **Manual Testing with Dev Server**

Start the development server:

```bash
npm run web
```

### Check the console for:

1. **No TypeScript errors** in browser console
2. **App initialization logs** showing:
   - Environment loaded
   - Auth store initialized
   - TanStack Query provider running
3. **No error boundaries** triggered

### Test API connectivity:

Open browser DevTools (F12) → Network tab

1. Look for API calls to `http://localhost:44300`
2. If backend isn't running, you'll see connection refused (expected)

---

## 7. **Environment Configuration Check**

Verify environment files are properly set up:

```bash
ls -la .env.*
```

**Expected files:**
- ✅ `.env.local` (development)
- ✅ `.env.staging` (staging)
- ✅ `.env.production` (production)
- ✅ `.env.example` (template)

Check that `.env.local` has correct values:

```bash
cat .env.local | grep EXPO_PUBLIC_API_URL
# Should output: EXPO_PUBLIC_API_URL=http://localhost:44300
```

---

## 8. **Complete Test Suite**

Run all tests in sequence:

```bash
# Run all checks
npm run lint && npm test && echo "✅ All checks passed!"
```

---

## 9. **Expected Project State**

### Files Created ✅
- `app/services/api-client.ts` - API client with interceptors
- `app/services/token-storage.ts` - Secure token storage
- `app/store/auth-store.ts` - Authentication state
- `app/store/pet-store.ts` - Pet data management
- `app/types/models.ts` - TypeScript models
- `app/components/ErrorBoundary.tsx` - Error handling
- `.env.local`, `.env.staging`, `.env.production` - Environment configs
- `jest.config.js`, `jest.setup.js` - Testing setup
- `app/__tests__/validation.test.ts` - Unit tests

### Build Status ✅
- No TypeScript errors
- Linting passes
- Tests pass
- Web bundler works
- All npm scripts functional

---

## 10. **Troubleshooting**

### "Module not found" errors
```bash
npm install
```

### Linting fails
```bash
npm run lint
```

### Tests fail with "jest-expo" error
```bash
npm install --save-dev jest-expo --legacy-peer-deps
```

### API connection fails (Expected if backend not running)
- This is OK during Phase 1
- Backend must run on `http://localhost:44300`
- See BACKEND_ANALYSIS_SUMMARY.md for backend setup

---

## 11. **Quick Status Verification**

Quick check that everything is working:

```bash
npm run lint && npm test && echo "✅ All checks passed!"
```

This runs:
1. ✅ Linting (ESLint + TypeScript)
2. ✅ Unit tests (Jest)
3. ✅ Type safety

---

**Phase 1 Infrastructure Status: ✅ Ready**

The app infrastructure is complete and ready for Phase 2 development!
