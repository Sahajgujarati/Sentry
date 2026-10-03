/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#171717",
        surface: {
          DEFAULT: "#1D1D1D",
          subtle: "#141414",
          elevated: "#232323",
          hover: "#282828",
        },
        terminal: {
          text: "#F2F1EB",
          secondary: "#9A9A94",
          muted: "#5F5F5A",
          border: "#30302D",
          borderLight: "#3E3E3A",
          accent: "#00E5A0",
          accentDim: "rgba(0, 229, 160, 0.12)",
          negative: "#FF4D4D",
          negativeDim: "rgba(255, 77, 77, 0.12)",
          warning: "#F0A000",
          warningDim: "rgba(240, 160, 0, 0.12)",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      letterSpacing: {
        technical: "0.08em",
        wideTerminal: "0.12em",
      },
    },
  },
  plugins: [],
};
