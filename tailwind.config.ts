import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta-sans), Plus Jakarta Sans']
      },
      fontSize: {
        sm: "0.8rem",
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
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
  plugins: [require("@tailwindcss/forms"), require('tailwind-scrollbar')({ nocompatible: true })],
} satisfies Config;
