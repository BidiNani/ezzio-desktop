// Config ESLint 9 (flat config) — E-ZZIO Desktop Frontend
// Cible : fichiers TS/TSX/JS/JSX sous src/ et e2e/

import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  // Fichiers ignores
  { ignores: [
    "dist/**",
    "node_modules/**",
    "coverage/**",
    "*.config.js",
    "*.config.ts",
    // Dossiers de build natifs (bundles minifies, pas du code source)
    "android/**",
    "ios/**",
    "src-tauri/target/**",
    "src-tauri/gen/**",
  ] },

  // Config de base TS/React
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        fetch: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        AbortSignal: "readonly",
        Response: "readonly",
        RequestInit: "readonly",
        process: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // Règles tolérantes (pas de blocage CI pour démarrer)
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": "off",
      "no-console": "off",
    },
  },
];