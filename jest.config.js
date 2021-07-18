module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  resetMocks: true,
  coverageDirectory: 'target/coverage',
  coverageReporters: ['text-summary', 'lcov', 'cobertura'],
  collectCoverageFrom: ['./src/**/*.ts'],
};
