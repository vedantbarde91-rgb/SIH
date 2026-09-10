import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// IMPORTANT: base './' is required for Capacitor Android webview to load assets correctly
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    // Ensure assets are correctly referenced in Android webview
    assetsDir: 'assets',
  },
  server: {
    // Allow connections from Android device on same WiFi
    host: '0.0.0.0',
    port: 5174,
  }
})
