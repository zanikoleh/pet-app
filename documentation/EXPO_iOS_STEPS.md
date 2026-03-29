# iPhone Testing - Visual Step-by-Step Guide

Complete step-by-step guide for testing Pet App on your iPhone using Expo.

## Step 1: Install Expo Go App on iPhone

**On your iPhone:**

1. Tap **App Store** (blue icon)
2. Tap **Search** tab (bottom right)
3. Type **"Expo Go"**
4. Tap the app result
5. Tap **Get** → **Install**
6. Wait for install to complete

**Done!** Expo Go is now installed on your iPhone.

---

## Step 2: Start Development Server on Mac

**On your Mac:**

Open Terminal and run:

```bash
cd /Users/olehzanik/projects/pet-app
npm start
```

**Expected output in Terminal:**

```
Starting Metro Bundler...

Waiting on http://localhost:8081

To open the app on:
  - Android, press 'a'
  - iOS, press 'i'  
  - Web, press 'w'

┌─────────────────────────────┐
│                             │
│    ▊▊▊▊▊ QR CODE ▊▊▊▊▊    │
│    ▊                   ▊    │
│    ▊   [QR Pattern]    ▊    │
│    ▊                   ▊    │
│    ▊▊▊▊▊▊▊▊▊▊▊▊▊▊▊▊▊▊▊    │
│                             │
│    exp://192.168.1.XX:19000 │
│                             │
└─────────────────────────────┘

Logs will appear below:
```

**This QR code is your key to connecting!**

---

## Step 3: Connect iPhone - OPTION A: QR Code (Recommended ⭐)

**On your iPhone:**

1. Open **Camera app**
2. Point camera at the **QR code in Terminal**
3. Look at screen - you'll see:
   ```
   "Open in Expo Go"
   ```
4. **Tap that notification**
5. **Expo Go opens automatically**

**On your iPhone screen:**

You'll see:
```
Loading...
```

Then after 5-10 seconds:
```
✅ App loaded successfully!
```

**You're testing the app now!** 🎉

---

## Step 3B: Connect iPhone - OPTION B: Manual Command

**If QR code doesn't work:**

In Terminal, press the **i** key:

```
Press 'i' now →
```

Terminal will automatically open the app on your iPhone.

---

## Step 3C: Connect iPhone - OPTION C: Manual URL

**If nothing works:**

1. In Terminal, find the URL line:
   ```
   exp://192.168.1.XX:19000
   ```

2. Copy that URL

3. On iPhone, open **Safari**

4. In address bar, paste the URL

5. Tap **Go**

6. You'll be redirected to Expo Go

---

## Step 4: Test the App

Now that your app is loaded on iPhone:

### ✅ Tap Buttons
- Tap UI elements
- Navigation should work
- Buttons should respond

### ✅ Fill Forms
- Try typing in text inputs
- Keyboard should appear
- Numbers should input

### ✅ Navigate
- Tap links/buttons
- Navigate between screens
- Press back button

### ✅ Check Console
Look at Mac Terminal for:
- ✅ Green logs (good)
- ❌ Red errors (bad)
- 📊 Performance info

---

## 🌟 Super Power: Hot Reload

This is what makes Expo amazing! 🚀

### How it works:

**On Mac:**

1. Open any file in code editor
2. Make a small change (e.g., change text)
3. Press **Cmd+S** to save

**On iPhone:**

- App automatically reloads
- Change appears in ~2 seconds
- **No restart needed!**

### Example:

**File:** `app/_layout.tsx`

**Save (Cmd+S)**

**Watch your iPhone** - it reloads automatically! ⚡

---

## Open Dev Menu on iPhone

**Shake your iPhone** or **Swipe down with 2 fingers**

You'll see menu with options:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⚡ Fast Refresh
  🔄 Reload
  🐞 Show element inspector
  ⚙️  Performance Monitor
  📊 View Network Requests
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Troubleshooting

### Problem: "Cannot reach localhost"

**Solution:**
1. Check you're on **same WiFi**
2. Check Mac IP: `ipconfig getifaddr en0`
3. If doesn't work, use tunnel:
   ```
   npm start -- --tunnel
   ```

### Problem: "QR code not scanning"

**Solution:**
1. Make sure code is visible in terminal
2. Try pressing **i** in terminal instead
3. Or manually copy URL from terminal

### Problem: "Stuck on loading screen"

**Solution:**
1. On Mac: Press **Ctrl+C**
2. Run: `npm start -- --reset-cache`
3. Try connecting again

### Problem: "App shows red error screen"

**Solution:**
1. Check Mac terminal for error message
2. Fix the error in code editor
3. Save - app auto-refreshes on iPhone

---

## Testing Checklist

When you have the app on iPhone, test:

- [ ] App loads without errors
- [ ] Can tap buttons
- [ ] Text inputs work
- [ ] Can navigate between screens
- [ ] No crashes
- [ ] Terminal shows no red errors
- [ ] Hot reload works (make change → auto refresh)

---

## Tips & Tricks

✅ **Do:**
- Keep Mac terminal open
- Use same WiFi
- Shake to open dev menu
- Check logs in terminal
- Edit and watch live changes

❌ **Don't:**
- Switch WiFi networks mid-test
- Close terminal while testing
- Force-close Expo Go app repeatedly
- Ignore red errors in terminal

---

**You got this! 💪**

Once your app works on iPhone, you can:
- Test in real device
- Check performance
- Verify touch interactions
- Catch iOS-specific bugs early
- Develop faster with hot reload!

**Happy Testing! 🎉**
