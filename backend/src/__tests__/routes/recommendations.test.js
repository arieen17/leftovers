const request = require("supertest");
const express = require("express");
const recommendationsRouter = require("../../routes/recommendations");
const axios = require("axios");

jest.mock("axios");
jest.spyOn(console, "error").mockImplementation(() => {});

const app = express();
app.use(express.json());
app.use("/api/recommendations", recommendationsRouter);

describe("Recommendations Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("GET /api/recommendations/user/:userId", () => {
    it("should return recommendations successfully", async () => {
      const mockResponse = {
        data: {
          recommendations: [
            { menu_item_id: 1, score: 1.0 },
            { menu_item_id: 2, score: 0.8 },
          ],
        },
      };
      axios.post.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get("/api/recommendations/user/1")
        .expect(200);

      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:8000/recommend",
        {
          user_id: 1,
          limit: 10,
        },
      );
      expect(response.body).toEqual(mockResponse.data);
    });

    it("should handle custom limit query parameter", async () => {
      const mockResponse = { data: { recommendations: [] } };
      axios.post.mockResolvedValue(mockResponse);

      await request(app).get("/api/recommendations/user/1?limit=5").expect(200);

      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:8000/recommend",
        {
          user_id: 1,
          limit: 5,
        },
      );
    });

    it("should use default limit of 10 when not provided", async () => {
      const mockResponse = { data: { recommendations: [] } };
      axios.post.mockResolvedValue(mockResponse);

      await request(app).get("/api/recommendations/user/42").expect(200);

      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:8000/recommend",
        {
          user_id: 42,
          limit: 10,
        },
      );
    });

    it("should parse userId as integer", async () => {
      const mockResponse = { data: { recommendations: [] } };
      axios.post.mockResolvedValue(mockResponse);

      await request(app).get("/api/recommendations/user/123").expect(200);

      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:8000/recommend",
        {
          user_id: 123,
          limit: 10,
        },
      );
    });

    it("should parse limit as integer", async () => {
      const mockResponse = { data: { recommendations: [] } };
      axios.post.mockResolvedValue(mockResponse);

      await request(app)
        .get("/api/recommendations/user/1?limit=20")
        .expect(200);

      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:8000/recommend",
        {
          user_id: 1,
          limit: 20,
        },
      );
    });

    it("should return 500 on service error", async () => {
      const error = new Error("Service unavailable");
      axios.post.mockRejectedValue(error);

      const response = await request(app)
        .get("/api/recommendations/user/1")
        .expect(500);

      expect(response.body).toEqual({
        error: "Failed to get recommendations",
        details: error.message,
      });
    });

    it("should return 500 on network error", async () => {
      const error = new Error("Network Error");
      error.code = "ECONNREFUSED";
      axios.post.mockRejectedValue(error);

      const response = await request(app)
        .get("/api/recommendations/user/1")
        .expect(500);

      expect(response.body).toEqual({
        error: "Failed to get recommendations",
        details: error.message,
      });
    });

    it("should handle different user IDs", async () => {
      const mockResponse = { data: { recommendations: [] } };
      axios.post.mockResolvedValue(mockResponse);

      await request(app).get("/api/recommendations/user/999").expect(200);

      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:8000/recommend",
        {
          user_id: 999,
          limit: 10,
        },
      );
    });

    it("should pass through recommendation service response", async () => {
      const mockResponse = {
        data: {
          user_id: 1,
          recommendations: [
            { menu_item_id: 1, score: 1.0, name: "Burger" },
            { menu_item_id: 2, score: 0.8, name: "Pizza" },
          ],
        },
      };
      axios.post.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get("/api/recommendations/user/1")
        .expect(200);

      expect(response.body).toEqual(mockResponse.data);
      expect(response.body.recommendations).toHaveLength(2);
    });
  });
});
