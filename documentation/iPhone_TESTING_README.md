# iPhone Testing with Expo - Complete Guide

Quick reference for testing Pet App on your iPhone.

## 📱 Three Ways to Test

### 1. **iPhone with Expo Go** ⭐ Most Complete
- Test on real device
- Full feature testing
- Hot reload
- Native performance
- **Use this for main development**

### 2. **Web Browser**
- Quick testing
- Immediate feedback
- No device needed
- Limited to web-only features

### 3. **Android Emulator**
- Emulated device
- Similar to iOS testing
- No physical device needed

---

## 🚀 Quick Start (3 Minutes)

### For iPhone Testing:

```bash
# 1. Install Expo Go on iPhone (from App Store)
# Already done? Continue...

# 2. Start dev server on Mac
npm start

# 3. Scan QR code with iPhone Camera
# (Or press 'i' in terminal)

# 4. App opens on iPhone automatically!
```

**Done!** You're testing on iPhone now. 🎉

---

## 📚 Full Documentation

### **EXPO_iOS_STEPS.md** (Read This First!)
Visual step-by-step guide with:
- Installation instructions
- Connection options
- What to expect at each step
- Troubleshooting for common issues
- Testing checklist

**Start here if first time!**

### **EXPO_iOS_TESTING.md** (Complete Reference)
Comprehensive guide with:
- Detailed setup instructions
- All connection methods (LAN, Tunnel, Localhost)
- Network configuration
- Backend API integration
- Advanced debugging
- Performance monitoring

**Use this for detailed setup and troubleshooting!**

### **TESTING.md** (General Testing)
General testing strategies:
- Code linting
- Unit tests with Jest
- TypeScript type checking
- Build validation
- Dependency verification

**Use this for non-device testing!**

---

## 🔧 Common Commands

```bash
# Start development server
npm start

# Use tunnel mode (works anywhere, slower)
npm start -- --tunnel

# Reset Metro cache
npm start -- --reset-cache

# Stop server
Ctrl+C
```

---

## 📋 Pre-Testing Checklist

- [ ] Expo Go installed on iPhone
- [ ] Mac and iPhone on same WiFi
- [ ] npm dependencies installed (`npm install`)
- [ ] Dev server ready (`npm start`)
- [ ] Environment variables configured (`.env.local`)

---

## 🎮 Testing Your App

Once app loads on iPhone:

1. **Test Navigation**
   - Tap buttons
   - Navigate between screens
   - Use back button

2. **Test Forms**
   - Type in text inputs
   - Check validation
   - Submit forms

3. **Test Performance**
   - Check smoothness
   - Look for lag
   - Monitor battery

4. **Check Console**
   - Look for errors
   - Check logs
   - No red screens

5. **Test Hot Reload**
   - Edit a file
   - Save
   - Watch it update on iPhone

---

**Happy Testing! 🎉**
