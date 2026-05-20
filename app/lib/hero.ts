// hero.ts
import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    light: {
      colors: {
        background: "#F4EEDE",
        foreground: "#142840",
        content1: "#FBF8EE",
        content2: "#F7F2E4",
        content3: "#EFE7D2",
        content4: "#E6DCC4",
        divider: "rgba(20, 40, 64, 0.1)",
        focus: "#1F3A5F",
        primary: {
          DEFAULT: "#1F3A5F",
          foreground: "#FBF8EE",
        },
        secondary: {
          DEFAULT: "#A4503A",
          foreground: "#FBF8EE",
        },
        success: {
          DEFAULT: "#3D5A3D",
          foreground: "#FBF8EE",
        },
        warning: {
          DEFAULT: "#C69544",
          foreground: "#142840",
        },
        danger: {
          DEFAULT: "#8B3A2E",
          foreground: "#FBF8EE",
        },
        default: {
          50: "#FBF8EE",
          100: "#F7F2E4",
          200: "#EFE7D2",
          300: "#E6DCC4",
          400: "#C9BDA0",
          500: "#A2997F",
          600: "#7A725F",
          700: "#534D40",
          800: "#2D2A23",
          DEFAULT: "#EFE7D2",
          foreground: "#142840",
        },
      },
      layout: {
        radius: { small: "8px", medium: "10px", large: "12px" },
        borderWidth: { small: "1px", medium: "1px", large: "2px" },
      },
    },
    dark: {
      colors: {
        background: "#0D1F33",
        foreground: "#F4EEDE",
        content1: "#1A3050",
        content2: "#21405E",
        content3: "#2A4D7A",
        content4: "#365E91",
        divider: "rgba(244, 238, 222, 0.08)",
        focus: "#E0BF85",
        primary: {
          DEFAULT: "#E0BF85",
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
          DEFAULT: "#C69544",
          foreground: "#0D1F33",
        },
        danger: {
          DEFAULT: "#C87355",
          foreground: "#0D1F33",
        },
        default: {
          DEFAULT: "#1A3050",
          foreground: "#F4EEDE",
        },
      },
      layout: {
        radius: { small: "8px", medium: "10px", large: "12px" },
        borderWidth: { small: "1px", medium: "1px", large: "2px" },
      },
    },
  },
});
