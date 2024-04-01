import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.tsx"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta-sans), Plus Jakarta Sans']
      },
      fontSize: {
        sm: "0.8rem",
      },
      boxShadow: {
        '3xl': '0px 16px 70px rgba(0, 0, 0, 0.5)',
      },
      colors: {
        "dark-50": "#161616",
        "dark-100": "#1c1c1c",
        "dark-200": "#232323",
        "dark-300": "#282828",
        "dark-400": "#2e2e2e",
        "dark-500": "#343434",
        "dark-600": "#3e3e3e",
        "dark-700": "#505050",
        "dark-800": "#707070",
        "dark-900": "#7e7e7e",
        "dark-950": "#bbb",
        "dark-1000": "#ededed",
        "light-50": "hsl(0deg 0% 98.8%)",
        "light-100": "hsl(0deg 0% 97.3%)",
        "light-200": "hsl(0deg 0% 95.3%)",
        "light-300": "hsl(0deg 0% 92.9%)",
        "light-400": "hsl(0deg 0% 91%)",
        "light-500": "hsl(0deg 0% 88.6%)",
        "light-600": "hsl(0deg 0% 85.9%)",
        "light-700": "hsl(0deg 0% 78%)",
        "light-800": "hsl(0deg 0% 56.1%)",
        "light-900": "hsl(0deg 0% 52.2%)",
        "light-950": "hsl(0deg 0% 43.5%)",
        "light-1000": "hsl(0deg 0% 9%)"
      },
      screens: {
        xxl: '1600px'
      }
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
  plugins: [require("@tailwindcss/forms"), require('tailwind-scrollbar')({ nocompatible: true })],
} satisfies Config;
