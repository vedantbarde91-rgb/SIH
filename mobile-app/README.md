# NER-LEWS Mobile App

React + Vite + **Capacitor** — produces both an Android `.apk` and a browser-installable PWA from the same codebase.

Shares the same **FastAPI backend** as the web `frontend/`.

---

## Project Structure

```
mobile-app/
├── capacitor.config.json   ← App ID, name, native plugin settings
├── package.json            ← Dependencies (includes @capacitor/* packages)
├── vite.config.js          ← base: './' REQUIRED for Capacitor Android
├── index.html              ← Mobile viewport, PWA meta tags
├── .env.example            ← Copy to .env, set VITE_API_BASE_URL
├── public/
│   └── manifest.json       ← PWA "Add to Home Screen" manifest
└── src/
    ├── App.jsx             ← Routes (uses MobileBottomNav not Sidebar)
    ├── main.jsx
    ├── index.css           ← Mobile CSS (safe-area insets, 44px touch targets)
    ├── api/
    │   └── client.js       ← Uses VITE_API_BASE_URL env var
    ├── components/
    │   ├── MobileNavbar.jsx    ← Compact navbar with back button
    │   └── MobileBottomNav.jsx ← Bottom tab bar (replaces desktop Sidebar)
    ├── pages/
    │   ├── Landing.jsx
    │   ├── citizen/
    │   │   ├── ReportForm.jsx  ← NATIVE Camera + GPS via nativePlugins.js
    │   │   ├── CitizenAuth.jsx
    │   │   └── UserDashboard.jsx
    │   └── officer/            ← Same as web (all officer pages)
    └── utils/
        └── nativePlugins.js    ← Capacitor Camera, GPS, Haptics wrappers
```

---

## Quick Start

### Step 1 — Configure the API URL

```bash
cp .env.example .env
```

Edit `.env`:
- **Same WiFi demo**: Set to your laptop's IP → `VITE_API_BASE_URL=http://192.168.1.5:8000/api`
- **Find your IP**: `ipconfig` on Windows → IPv4 Address

### Step 2 — Install Dependencies

```bash
npm install
```

### Step 3 — Run in Browser (Dev Mode)

```bash
npm run dev
# Opens at http://localhost:5174
```

### Step 4 — Build Android APK

Requirements: **Android Studio** must be installed.

```bash
# Build web assets + sync to Android project
npm run build:android
# This runs: npm run build → npx cap sync android → npx cap open android

# Then in Android Studio:
# Build → Generate Signed Bundle / APK → APK → follow wizard
```

---

## Key Differences from `frontend/` (Web)

| Feature | `frontend/` (Web) | `mobile-app/` (Android/PWA) |
|---|---|---|
| Navigation | Desktop Sidebar | Bottom Tab Bar |
| Camera | HTML file input | Native Camera picker |
| GPS | `navigator.geolocation` | Capacitor Geolocation (faster, high-accuracy) |
| API URL | `localhost:8000` | Env var (LAN IP or cloud URL) |
| Haptics | None | Native vibration on submit |
| Viewport | Standard | Mobile-optimized (safe areas, no zoom) |
| Build output | `dist/` for browser | `dist/` → synced to `android/` for APK |

---

## Native Permissions (Android)

These are auto-added by Capacitor to `AndroidManifest.xml`:
- `CAMERA` — photo capture
- `READ_EXTERNAL_STORAGE` — photo gallery access  
- `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` — GPS
- `INTERNET` — API calls
- `RECEIVE_BOOT_COMPLETED` — push notifications (optional)
