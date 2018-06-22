module.exports = {
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      statements: 100
    }
  },
  modulePathIgnorePatterns: [
    '<rootDir>/test/fixtures'
  ]
}
