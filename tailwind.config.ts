import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          primary: "#ff6b35",
          secondary: "#f7c59f",
          tertiary: "#ffe66d",
        },
        surface: {
          light: "#fefefe",
          muted: "#f8f6f3",
          dark: "#0f0f1a",
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '70%': { transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 107, 53, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 107, 53, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'medium': '0 8px 30px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 40px rgba(255, 107, 53, 0.15)',
        'glow-accent': '0 4px 20px rgba(255, 107, 53, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-accent': 'linear-gradient(135deg, #ff6b35, #ff8c5a)',
        'gradient-warm': 'linear-gradient(135deg, #ff6b35, #ffe66d)',
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              50: "#fff7f2",
              100: "#ffede6",
              200: "#ffd9c7",
              300: "#ffbf9f",
              400: "#ff9b70",
              500: "#ff6b35",
              600: "#ff5216",
              700: "#e63e00",
              800: "#bf3400",
              900: "#992900",
              DEFAULT: "#ff6b35",
              foreground: "#ffffff",
            },
            secondary: {
              50: "#fffbf5",
              100: "#fff5e8",
              200: "#ffe8c7",
              300: "#ffd9a0",
              400: "#f7c59f",
              500: "#f0a870",
              600: "#e89040",
              700: "#d97820",
              800: "#b36418",
              900: "#8c4e12",
              DEFAULT: "#f7c59f",
              foreground: "#1a1a2e",
            },
            success: {
              DEFAULT: "#22c55e",
              foreground: "#ffffff",
            },
            warning: {
              DEFAULT: "#ffe66d",
              foreground: "#1a1a2e",
            },
            danger: {
              DEFAULT: "#ef4444",
              foreground: "#ffffff",
            },
            background: "#fefefe",
            foreground: "#1a1a2e",
          },
        },
        dark: {
          colors: {
            primary: {
              50: "#2d1810",
              100: "#4a2515",
              200: "#6b3520",
              300: "#8c4830",
              400: "#b55f40",
              500: "#ff8c5a",
              600: "#ffa070",
              700: "#ffb48a",
              800: "#ffc8a5",
              900: "#ffdcc0",
              DEFAULT: "#ff8c5a",
              foreground: "#0f0f1a",
            },
            secondary: {
              50: "#1a150f",
              100: "#2d2518",
              200: "#473820",
              300: "#634d2c",
              400: "#8a6b40",
              500: "#ffb088",
              600: "#ffc0a0",
              700: "#ffd0b8",
              800: "#ffe0d0",
              900: "#fff0e8",
              DEFAULT: "#ffb088",
              foreground: "#0f0f1a",
            },
            success: {
              DEFAULT: "#4ade80",
              foreground: "#0f0f1a",
            },
            warning: {
              DEFAULT: "#ffe066",
              foreground: "#0f0f1a",
            },
            danger: {
              DEFAULT: "#f87171",
              foreground: "#0f0f1a",
            },
            background: "#0f0f1a",
            foreground: "#f5f5f7",
          },
        },
      },
    }) as any,
  ],
};

export default config;
