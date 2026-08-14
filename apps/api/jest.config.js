module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],

  testMatch: ['**/*.spec.ts', '**/*.e2e-spec.ts'],

  moduleNameMapper: {
    '^@linkedout/database$': '<rootDir>/../../packages/database/src/index.ts',
  },

  setupFiles: ['<rootDir>/test-env.js'],
};
