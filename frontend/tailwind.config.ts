import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0e1a',
          surface: '#0f1629',
          elevated: '#141d35',
          border: '#1e2d4a',
        },
        accent: {
          cyan:    '#00d4ff',
          emerald: '#10b981',
          amber:   '#f59e0b',
          red:     '#ef4444',
          purple:  '#8b5cf6',
        },
        text: {
          primary:   '#e2e8f0',
          secondary: '#94a3b8',
          muted:     '#475569',
        },
      },
      fontFamily: {
        display: ['"JetBrains Mono"', 'monospace'],
        body:    ['"IBM Plex Sans"', 'sans-serif'],
      },
      animation: {
        'flash-critical': 'flash 1s ease-in-out infinite',
        'pulse-slow':     'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':      'spin 3s linear infinite',
      },
      keyframes: {
        flash: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
