/** @type {import('jest').Config} */

const config = {
  transformIgnorePatterns: [],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    // '^(\\.{1,2}/.*)\\.js$': '$1.ts',
  },
  testRegex: '.*\\.test\\.ts$',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.test.json', // Use test-specific config
      },
    ],
  },
  testEnvironment: 'node',
  preset: 'ts-jest/presets/js-with-ts-esm',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  //   setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'], // optional
};

export default config;
