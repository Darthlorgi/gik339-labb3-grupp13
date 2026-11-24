/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testTimeout: 15000,
  verbose: false,
  testMatch: [
    '<rootDir>/tests/tasks.test.js'
  ],
  reporters: ['<rootDir>/minimalReporter.cjs'], // ENDAST vår reporter
  displayName: 'Labb 3 – Backend med Node.js och Express'
};
