import js from "@eslint/js";
import expo from "eslint-config-expo/flat.js";
import { configs as typescriptConfigs } from "typescript-eslint";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/dist-web/**",
      "**/.tools/**",
      "**/.expo/**",
      "coverage/**",
    ],
  },
  js.configs.recommended,
  ...typescriptConfigs.recommended,
  ...expo,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "import/no-unresolved": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["**/*.config.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
