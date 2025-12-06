module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.js", "**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  verbose: true,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js",
    "!src/__tests__/**",
    "!**/node_modules/**",
  ],
  coverageDirectory: "../coverage/backend",
  coverageReporters: [
    "text",
    "text-summary",
    ["text", { file: "coverage.txt" }],
    "html",
    "lcov",
  ],
  coveragePathIgnorePatterns: ["/node_modules/", "/__tests__/"],
};
