# Pet App - A React Native Pet Management Application

A mobile pet management application built with Expo, React Native, and TypeScript.

## 🚀 Quick Start

### Development Server
```bash
npm start
```

Then:
- Press `i` for iPhone (requires Expo Go app)
- Press `a` for Android
- Press `w` for web

### Testing on iPhone
1. Install Expo Go from App Store
2. Run `npm start`
3. Scan QR code with Camera app
4. App opens on iPhone automatically!

For detailed instructions, see: `documentation/EXPO_iOS_STEPS.md`

---

## 📚 Documentation

All documentation is in the `documentation/` folder:

### Getting Started
- **README.md** - Project overview
- **EXPO_iOS_STEPS.md** - Visual step-by-step iPhone testing guide ⭐ START HERE
- **iPhone_TESTING_README.md** - iPhone testing overview

### Testing & Validation
- **TESTING_GENERAL.md** - Linting, Jest tests, type checking
- **EXPO_iOS_TESTING.md** - Complete iOS testing reference

### Project Information
- **PROJECT_INTEGRATION_GUIDE.md** - Architecture and integration overview
- **BACKEND_ANALYSIS_SUMMARY.md** - Backend API documentation

---

## 🛠️ Common Commands

```bash
npm start              # Start development server
npm run lint           # Check code quality
npm test              # Run unit tests
npm run web           # Start web bundler
npm start -- --tunnel # Use tunnel mode (works anywhere)
npm start -- --reset-cache # Clear Metro cache
```

---

## 📱 Project Structure

```
pet-app/
├── app/                    # Main app code
│   ├── services/          # API client, token storage
│   ├── store/             # State management (Zustand, TanStack Query)
│   ├── components/        # React components
│   ├── types/             # TypeScript interfaces
│   └── _layout.tsx        # Root layout with providers
├── documentation/         # All guides and docs
├── assets/               # Images, fonts, etc.
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

---

## ✨ Features

✅ **Infrastructure Complete**
- TypeScript for type safety
- Zustand for state management
- TanStack Query for server state
- Axios with interceptors
- Secure token storage
- Error boundaries

✅ **Ready for Development**
- Hot reload for fast iteration
- Environment configuration (dev, staging, prod)
- Comprehensive testing setup
- Full API client pre-built

---

## 🔗 Important Files

### Configuration
- `.env.local` - Development environment variables
- `.env.staging` - Staging environment
- `.env.production` - Production environment
- `.gitignore` - Git configuration

### Code
- `app/types/models.ts` - TypeScript models (50+ interfaces)
- `app/services/api-client.ts` - HTTP client with auth
- `app/store/auth-store.ts` - Authentication state
- `app/store/pet-store.ts` - Pet management with caching

---

## 🎯 Next Steps

1. ✅ **Infrastructure** - Phase 1 complete!
2. 📝 **Phase 2** - Build authentication screens
3. 📝 **Phase 3** - Build pet list UI
4. 📝 **Phase 4** - Add pet detail screens
5. 📝 **Phase 5** - Photo/document management

---

## 🐛 Need Help?

### For iPhone Testing Issues
See: `documentation/EXPO_iOS_TESTING.md`

### For General Testing
See: `documentation/TESTING_GENERAL.md`

### For Architecture Questions
See: `documentation/PROJECT_INTEGRATION_GUIDE.md`

### For API Details
See: `documentation/BACKEND_ANALYSIS_SUMMARY.md`

---

## 📦 Tech Stack

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build service
- **TypeScript** - Type-safe JavaScript
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Jest** - Testing framework

---

## 📖 Learn More

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)

---

## 📝 License

Private project - All rights reserved

---

**Status: Phase 1 Infrastructure Complete ✅**

See documentation folder for detailed guides!
