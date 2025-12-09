const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    screens: {
      'xs': '375px',
      ...defaultTheme.screens,
    },
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      colors: {
        primary: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7dc1fc",
          400: "#3898f9",
          500: "#0072f5",
          600: "#005ad1",
          700: "#0047ab",
          800: "#003c8c",
          900: "#003474",
        },
        premium: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        gradient: "gradient 8s linear infinite",
        shimmer: "shimmer 3s infinite",
        float: "float 3s ease-in-out infinite",
        "float-slow": "float 16s ease-in-out infinite",
        "float-slower": "float 22s ease-in-out infinite",
        "float-slowest": "float 30s ease-in-out infinite",
        "icon-pulse": "icon-pulse 2.2s ease-in-out infinite",
        ripple: "ripple 700ms ease-out",
      },
      scale: {
        102: "1.02",
        105: "1.05",
      },
      keyframes: {
        "fade-in": {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        gradient: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        float: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "25%": { transform: "translate3d(15px,-10px,0) scale(1.02)" },
          "50%": { transform: "translate3d(-10px,10px,0) scale(1.01)" },
          "75%": { transform: "translate3d(10px,5px,0) scale(1.015)" },
        },
        "icon-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.08)", opacity: "0.9" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.4" },
          "80%": { transform: "scale(1)", opacity: "0.2" },
          "100%": { transform: "scale(1.05)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
