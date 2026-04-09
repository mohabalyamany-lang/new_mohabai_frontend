import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      typography: {
        invert: {
          css: {
            "--tw-prose-body": "var(--text-primary)",
            "--tw-prose-headings": "var(--text-primary)",
            "--tw-prose-code": "var(--text-primary)",
            "--tw-prose-links": "var(--accent)",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
