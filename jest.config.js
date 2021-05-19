module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: 'target/coverage',
  coverageReporters: ['text-summary', 'lcov', 'cobertura'],
  collectCoverageFrom: ['./src/**/*.ts'],
};
