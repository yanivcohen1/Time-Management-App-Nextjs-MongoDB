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
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
