// hero.ts
import { heroui } from "@heroui/react";
export default heroui({
  themes: {
    light: {
      colors: {
        primary: {
          DEFAULT: "#e07a5f",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f2cc8f",
          foreground: "#3d405b",
        },
      },
    },
    dark: {
      colors: {
        primary: {
          DEFAULT: "#e07a5f",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f2cc8f",
          foreground: "#3d405b",
        },
      },
    },
  },
  layout: {
    radius: {
      small: "8px",
      medium: "16px",
      large: "24px",
    },
  },
});