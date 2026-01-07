/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
  collectCoverageFrom: [
    'src/app/**/*.{js,jsx,ts,tsx}',
    'src/components/**/*.{js,jsx,ts,tsx}',
    'src/lib/**/*.{js,jsx,ts,tsx}',
    'src/entities/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/cypress/**',
  ],
  projects: [
    {
      displayName: 'client',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testEnvironment: 'jest-environment-jsdom',
      testPathIgnorePatterns: [
        '<rootDir>/.next/',
        '<rootDir>/node_modules/',
        '<rootDir>/src/app/api',
      ],
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: [['next/babel', { 'preset-react': { runtime: 'automatic' } }]] }],
      },
      transformIgnorePatterns: [
        '/node_modules/(?!bson|mongodb|@mikro-orm)/',
      ],
    },
    {
      displayName: 'api',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/app/api/**/*.test.ts'],
      testPathIgnorePatterns: [
        '<rootDir>/.next/',
        '<rootDir>/node_modules/',
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: [['@babel/preset-env', { targets: { node: 'current' } }], '@babel/preset-typescript'] }],
      },
      transformIgnorePatterns: [
        '/node_modules/(?!bson|mongodb|@mikro-orm|whatwg-url)/',
      ],
    },
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
