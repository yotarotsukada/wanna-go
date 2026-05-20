// hero.ts
import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    light: {
      colors: {
        background: "#F2E8D5",
        foreground: "#142840",
        primary: {
          DEFAULT: "#1F3A5F",
          foreground: "#F2E8D5",
        },
        secondary: {
          DEFAULT: "#A4503A",
          foreground: "#F2E8D5",
        },
        success: {
          DEFAULT: "#3D5A3D",
          foreground: "#F2E8D5",
        },
        warning: {
          DEFAULT: "#D4A24C",
          foreground: "#142840",
        },
        danger: {
          DEFAULT: "#8B3A2E",
          foreground: "#F2E8D5",
        },
        default: {
          DEFAULT: "#EADFC6",
          foreground: "#142840",
        },
      },
      layout: {
        radius: {
          small: "6px",
          medium: "10px",
          large: "14px",
        },
      },
    },
    dark: {
      colors: {
        background: "#0D1F33",
        foreground: "#F2E8D5",
        primary: {
          DEFAULT: "#E7C587",
          foreground: "#142840",
        },
        secondary: {
          DEFAULT: "#C87355",
          foreground: "#142840",
        },
        success: {
          DEFAULT: "#5B7D5B",
          foreground: "#0D1F33",
        },
        warning: {
          DEFAULT: "#D4A24C",
          foreground: "#0D1F33",
        },
        danger: {
          DEFAULT: "#C87355",
          foreground: "#0D1F33",
        },
        default: {
          DEFAULT: "#1C3552",
          foreground: "#F2E8D5",
        },
      },
      layout: {
        radius: {
          small: "6px",
          medium: "10px",
          large: "14px",
        },
      },
    },
  },
});
