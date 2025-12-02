// Mock environment variables
process.env.JWT_SECRET = "test-secret-key";
process.env.JWT_EXPIRES_IN = "7d";
process.env.NODE_ENV = "test";

// Mock database connection to prevent actual connections during tests
jest.mock("./database/config", () => {
  const mockPool = {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  };
  return mockPool;
});
