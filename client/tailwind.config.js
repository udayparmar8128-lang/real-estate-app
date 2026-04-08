/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary – rich blue
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Accent – warm orange
        accent: {
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        // Success / Rent – emerald green
        success: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        // Highlight / featured – violet-purple
        purple: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        // Warning / views – amber-orange  
        amber: {
          50:  '#fffbeb',
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:   '0 4px 24px rgba(0,0,0,0.08)',
        soft:   '0 2px 12px rgba(0,0,0,0.06)',
        glow:   '0 0 20px rgba(37,99,235,0.15)',
        'glow-green':  '0 0 20px rgba(16,185,129,0.15)',
        'glow-purple': '0 0 20px rgba(139,92,246,0.15)',
      },
      backgroundImage: {
        'gradient-card':   'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
        'gradient-blue':   'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        'gradient-green':  'linear-gradient(135deg, #059669 0%, #047857 100%)',
        'gradient-purple': 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
        'gradient-amber':  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'gradient-orange': 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      },
    },
  },
  plugins: [],
}
