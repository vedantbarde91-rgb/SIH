/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        risk: {
          low: "#10b981",       // emerald-500
          moderate: "#f59e0b",  // amber-500
          high: "#f97316",      // orange-500
          critical: "#ef4444",  // red-500
        },
        command: {
          dark: "#0f172a",      // slate-900
          card: "#1e293b",      // slate-800
          border: "#334155",    // slate-700
          accent: "#38bdf8",    // sky-400
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar': 'radarPing 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        radarPing: {
          '75%, 100%': {
            transform: 'scale(2.5)',
            opacity: '0',
          },
        },
      },
      // Mobile-specific spacing for safe areas (iPhone notch, Android status bar)
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      }
    },
  },
  plugins: [],
}
