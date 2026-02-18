import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";
import { dirname } from "path";
import { fileURLToPath } from "url";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default tseslint.config(
  // Base JS recommended
  js.configs.recommended,

  // TypeScript recommended
  ...tseslint.configs.recommended,

  // Apply to JavaScript and JSX/TSX files
  {
    files: [
      "**/*.js",
      "**/*.jsx",
      "**/*.mjs",
      "**/*.cjs",
      "**/*.ts",
      "**/*.tsx",
      "**/*.mts",
      "**/*.cts",
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        React: "writable",
        JSX: "writable",
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      /* Global Rules */
      // all: "off", // Using recommended sets as base instead of "all: off"

      // /* Base Rules */
      // "no-undef": "error", // Handled by recommended
      "no-unused-vars": "off", // Turn off base rule for TS compatibility
      "no-console": "warn",

      // /* React.js Rules */
      // "react/no-unescaped-entities": "off", // Plugin not loaded yet, might warn if rule not found

      // /* TypeScript Rules */
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      // "@typescript-eslint/consistent-type-imports": "warn",

      // /* Next.js Rules */
      // "@next/next/no-img-element": "off",
    },
  },

  // Files and directories to ignore during linting
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "public/**",
      "dist/**",
      "build/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/*.config.cjs",
      "**/*.config.ts",
      "**/*.config.tsx",
      "**/*.config.mts",
      "**/*.config.cts",
    ],
  },

  // Prettier configuration
  prettierConfig,
);
