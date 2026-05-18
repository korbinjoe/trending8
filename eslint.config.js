import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

const MAX_LINES = 500;

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "max-lines": [
        "error",
        { max: MAX_LINES, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/drizzle/**",
      "openspec/**",
      "research/**",
    ],
  },
);
