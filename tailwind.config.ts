import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "2rem",
          lg: "4rem",
          xl: "5rem",
          "2xl": "6rem",
        },
      },
      keyframes: {
        flicker: {
          '0%': { transform: 'translateX(-50%) scaleY(1) scaleX(1) rotate(-2deg)' },
          '50%': { transform: 'translateX(-50%) scaleY(1.15) scaleX(0.9) rotate(1deg)' },
          '100%': { transform: 'translateX(-50%) scaleY(0.95) scaleX(1.05) rotate(-1deg)' },
        },
      },
      animation: {
        flicker: 'flicker 0.3s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
};

export default config;
