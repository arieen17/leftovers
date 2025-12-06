process.env.EXPO_PUBLIC_API_URL = "http://localhost:5000";

import { apiRequest, API_CONFIG } from "../../services/api";

global.fetch = jest.fn();

jest.spyOn(console, "log").mockImplementation(() => {});

describe("API Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("API_CONFIG", () => {
    it("should have correct endpoint structure", () => {
      expect(API_CONFIG.ENDPOINTS.RESTAURANTS).toBe("/api/restaurants");
      expect(API_CONFIG.ENDPOINTS.MENU_ITEMS).toBe("/api/menu-items");
      expect(API_CONFIG.ENDPOINTS.HEALTH).toBe("/api/health");
    });

    it("should generate dynamic endpoints correctly", () => {
      expect(API_CONFIG.ENDPOINTS.RESTAURANT_MENU(1)).toBe(
        "/api/restaurants/1/menu",
      );
      expect(API_CONFIG.ENDPOINTS.MENU_ITEM(42)).toBe("/api/menu-items/42");
    });
  });

  describe("apiRequest", () => {
    it("should make successful GET request", async () => {
      const mockData = { id: 1, name: "Test" };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await apiRequest("/api/test");

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[0]).toContain("/api/test");
      expect(fetchCall[1]).toMatchObject({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      });
      expect(result).toEqual(mockData);
    });

    it("should include custom headers", async () => {
      const mockData = { success: true };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      await apiRequest("/api/test", {
        headers: { Authorization: "Bearer token123" },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer token123",
          }),
        }),
      );
    });

    it("should handle POST request with body", async () => {
      const mockData = { id: 1 };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      process.env.EXPO_PUBLIC_API_URL = "http://localhost:5000";

      const body = { name: "Test" };
      await apiRequest("/api/test", {
        method: "POST",
        body: JSON.stringify(body),
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(body),
        }),
      );
    });

    it("should throw error on HTTP error response", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Not found" }),
      });

      process.env.EXPO_PUBLIC_API_URL = "http://localhost:5000";

      await expect(apiRequest("/api/test")).rejects.toThrow("Not found");
    });

    it("should handle error response without JSON", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      process.env.EXPO_PUBLIC_API_URL = "http://localhost:5000";

      await expect(apiRequest("/api/test")).rejects.toThrow(
        "HTTP error! status: 500",
      );
    });

    it("should handle network errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      process.env.EXPO_PUBLIC_API_URL = "http://localhost:5000";

      await expect(apiRequest("/api/test")).rejects.toThrow("Network error");
    });

    it("should preserve Authorization header when provided", async () => {
      const mockData = { success: true };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      await apiRequest("/api/test", {
        headers: {
          Authorization: "Bearer token",
          "Custom-Header": "value",
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer token",
            "Custom-Header": "value",
          }),
        }),
      );
    });
  });
});
