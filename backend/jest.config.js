module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.js", "**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/server.js", "!**/node_modules/**"],
  coverageDirectory: "../coverage/backend",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  verbose: true,
};
