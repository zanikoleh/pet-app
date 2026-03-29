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

## 5. **Quick Status Check**

Run this command to verify everything:

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
