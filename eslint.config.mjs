import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  // Next.js specific configuration - DISABLED to fix circular dependency crash
  // ...compat.config({
  //   extends: ["next/core-web-vitals"],
  // }),

  // Apply to JavaScript and JSX files
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
      // all: "off",

      // /* Base Rules */
      "no-undef": "error",
      "no-unused-vars": "off",
      "no-console": "warn",

      // /* React.js Rules */
      "react/no-unescaped-entities": "off",
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
];
