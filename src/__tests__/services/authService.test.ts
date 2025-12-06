import {
  login,
  signup,
  clearAuth,
  getAuthToken,
  setAuthToken,
  getCurrentUser,
  setCurrentUser,
} from "../../services/authService";
import { apiRequest } from "../../services/api";

jest.mock("../../services/api");

jest.spyOn(console, "error").mockImplementation(() => {});

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setAuthToken(null);
    setCurrentUser(null);
  });

  describe("Token Management", () => {
    it("should set and get auth token", () => {
      const token = "test-token-123";
      setAuthToken(token);
      expect(getAuthToken()).toBe(token);
    });

    it("should return null when no token is set", () => {
      setAuthToken(null);
      expect(getAuthToken()).toBeNull();
    });
  });

  describe("User Management", () => {
    it("should set and get current user", () => {
      const user = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        tier: "bronze",
      };
      setCurrentUser(user);
      expect(getCurrentUser()).toEqual(user);
    });

    it("should return null when no user is set", () => {
      setCurrentUser(null);
      expect(getCurrentUser()).toBeNull();
    });
  });

  describe("login", () => {
    it("should login successfully and set token and user", async () => {
      const credentials = {
        email: "test@example.com",
        password: "password123",
      };

      const mockResponse = {
        message: "Login successful",
        token: "jwt-token-123",
        user: {
          id: 1,
          email: "test@example.com",
          name: "Test User",
          tier: "bronze",
        },
      };

      (apiRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await login(credentials);

      expect(apiRequest).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      expect(result).toEqual(mockResponse);
      expect(getAuthToken()).toBe("jwt-token-123");
      expect(getCurrentUser()).toEqual(mockResponse.user);
    });

    it("should handle login errors", async () => {
      const credentials = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      (apiRequest as jest.Mock).mockRejectedValueOnce(
        new Error("Invalid credentials"),
      );

      await expect(login(credentials)).rejects.toThrow("Invalid credentials");
      expect(getAuthToken()).toBeNull();
      expect(getCurrentUser()).toBeNull();
    });
  });

  describe("signup", () => {
    it("should signup successfully and set token and user", async () => {
      const credentials = {
        email: "new@example.com",
        password: "password123",
        name: "New User",
      };

      const mockResponse = {
        message: "User created successfully",
        token: "jwt-token-456",
        user: {
          id: 2,
          email: "new@example.com",
          name: "New User",
          tier: "bronze",
        },
      };

      (apiRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await signup(credentials);

      expect(apiRequest).toHaveBeenCalledWith("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      expect(result).toEqual(mockResponse);
      expect(getAuthToken()).toBe("jwt-token-456");
      expect(getCurrentUser()).toEqual(mockResponse.user);
    });

    it("should handle signup errors", async () => {
      const credentials = {
        email: "existing@example.com",
        password: "password123",
        name: "Existing User",
      };

      (apiRequest as jest.Mock).mockRejectedValueOnce(
        new Error("User already exists"),
      );

      await expect(signup(credentials)).rejects.toThrow("User already exists");
      expect(getAuthToken()).toBeNull();
      expect(getCurrentUser()).toBeNull();
    });
  });

  describe("clearAuth (logout)", () => {
    it("should clear token and user", () => {
      setAuthToken("some-token");
      setCurrentUser({
        id: 1,
        email: "test@example.com",
        name: "Test User",
        tier: "bronze",
      });

      clearAuth();

      expect(getAuthToken()).toBeNull();
      expect(getCurrentUser()).toBeNull();
    });
  });
});
