import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: {
    relative: true,
    files: [
      "./app/**/*.{ts,tsx}",
      "./components/**/*.{ts,tsx}",
      "./hooks/**/*.{ts,tsx}",
      "./services/**/*.{ts,tsx}",
      "./utils/**/*.{ts,tsx}"
    ]
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)", ...defaultTheme.fontFamily.sans]
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)",
        cardHover: "0 4px 12px rgba(16, 24, 40, 0.08), 0 12px 32px rgba(16, 24, 40, 0.08)",
        popover: "0 12px 32px rgba(16, 24, 40, 0.12), 0 4px 8px rgba(16, 24, 40, 0.06)",
        soft: "0 1px 2px rgba(16, 24, 40, 0.05), 0 8px 24px rgba(16, 24, 40, 0.06)",
        glass: "0 8px 32px rgba(15, 23, 42, 0.12)",
        elevated: "0 24px 64px rgba(16, 24, 40, 0.12)",
        subtle: "0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.04)",
        inner: "inset 0 1px 2px rgba(0, 0, 0, 0.04)"
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.35s ease-out",
        "slide-down": "slideDown 0.3s ease-out"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
