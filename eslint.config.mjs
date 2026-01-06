import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import cypress from "eslint-plugin-cypress";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["cypress/**/*.ts"],
    plugins: {
      cypress,
    },
    rules: {
      "cypress/no-unnecessary-waiting": "warn",
      "cypress/assertion-before-screenshot": "warn",
    },
  },
  {
    files: ["**/__tests__/**/*.ts","__tests__/api/**/*.ts", "**/__tests__/**/*.tsx", "**/*.test.ts", "**/*.test.tsx",],
    rules: {
      // Add any test-specific rules here if needed
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "jest.setup.api.js",
    "coverage/**",
  ]),
]);

export default eslintConfig;
