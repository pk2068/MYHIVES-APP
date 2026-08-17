import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  testRegex: '.*\\.test\\.ts$',

  transformIgnorePatterns: [],

  moduleNameMapper: {
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },

  transform: {
    '^.+\\.ts$': [
      '@swc/jest',
      {
        swcrc: false, // Prevents SWC from treating tsconfig.json as an .swcrc file
        jsc: {
          target: 'es2022',
          parser: {
            syntax: 'typescript',
            tsx: false,
            decorators: true,
          },
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
        },
        module: {
          type: 'es6',
        },
      },
    ],
  },

  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
};

export default config;
