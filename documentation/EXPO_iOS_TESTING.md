# Complete Expo iOS Testing Guide

Comprehensive guide for testing Pet App on iPhone with Expo.

## Prerequisites

- iPhone (iOS 13+)
- Same WiFi network as your Mac
- Expo Go app installed on iPhone
- Pet App running on your Mac

---

## Quick Start

```bash
# 1. Start dev server
npm start

# 2. Scan QR with Camera app on iPhone
# 3. App opens on iPhone automatically

# That's it! You're testing!
```

---

## Environment Modes

### **LAN** (Default - Fastest)
- Uses local network
- Fastest hot reload
- Requires same WiFi

```bash
npm start  # Uses LAN by default
```

### **Tunnel** (More Stable)
- Works over internet
- Slower hot reload
- Works anywhere

```bash
npm start -- --tunnel
```

### **Local Only** (No External)
- Only local device
- Fastest but limited

```bash
npm start -- --localhost
```

---

## Three Connection Methods

### 1. QR Code Scanning (Recommended)
- Fastest to set up
- Most reliable
- Scan with Camera app → Tap notification

### 2. Press 'i' Command
- Automatic in terminal
- No manual scanning
- Works immediately

### 3. Manual URL
- Fallback if others don't work
- Copy-paste URL to Safari
- Redirects to Expo Go

---

## Testing Workflow

### Daily Development Loop

```bash
# 1. Start server
npm start

# 2. While watching for changes:
# - Edit file on Mac
# - Save (Cmd+S)
# - Watch iPhone auto-reload in 2-3 seconds
# - Test the change
# - Repeat
```

---

## Dev Menu on iPhone

**Shake device** or **Swipe down with 2 fingers:**

- ⚡ **Fast Refresh** - Hot reload
- 🔄 **Reload** - Full reload
- 🐞 **Show element inspector** - Inspect UI
- ⚙️ **Performance Monitor** - Check FPS/Memory
- 📊 **View Network Requests** - See API calls

---

## Network Configuration

### Connect to Backend API

Update `.env.local`:

```bash
# Get Mac IP
ipconfig getifaddr en0

# Then set in .env.local
EXPO_PUBLIC_API_URL=http://192.168.1.X:44300
```

Restart dev server:

```bash
npm start -- --reset-cache
```

---

## Troubleshooting

### Cannot connect to localhost
- ✅ Check same WiFi
- ✅ Try tunnel mode
- ✅ Check Mac firewall

### QR code doesn't work
- ✅ Press 'i' in terminal
- ✅ Use tunnel mode
- ✅ Copy URL to Safari

### Stuck on loading
- ✅ Ctrl+C to stop
- ✅ `npm start -- --reset-cache`
- ✅ Try again

### App crashes
- ✅ Check terminal errors (red text)
- ✅ Fix code error
- ✅ Save - auto-refreshes on iPhone

---

## Best Practices

✅ **DO:**
- Keep terminal open
- Use same WiFi
- Shake for dev menu
- Check terminal logs
- Edit and watch changes

❌ **DON'T:**
- Switch WiFi mid-test
- Close terminal
- Force-close Expo Go
- Ignore red errors
- Use phone hotspot

---

## Commands Reference

| Command | Purpose |
|---------|---------|
| `npm start` | Start dev server |
| `npm start -- --tunnel` | Use tunnel mode |
| `npm start -- --reset-cache` | Clear cache |
| `Ctrl+C` | Stop server |

---

## Testing Checklist

- [ ] App loads without errors
- [ ] Buttons respond to taps
- [ ] Text inputs work
- [ ] Navigation works
- [ ] No red error screens
- [ ] Console shows no errors
- [ ] Hot reload works
- [ ] Performance is smooth

---

**Happy Testing! 🎉**

For visual step-by-step guide, see: EXPO_iOS_STEPS.md
