import { defineConfig } from "cypress";

export default defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    charts: true,
    reportPageTitle: 'Agile Tasks E2E Test Report',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },
  e2e: {
    baseUrl: 'http://localhost:3001',
    setupNodeEvents(on) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('cypress-mochawesome-reporter/plugin')(on);
    },
  },
});
