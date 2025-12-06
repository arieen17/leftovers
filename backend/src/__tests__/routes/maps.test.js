const request = require("supertest");
const express = require("express");
const mapsRouter = require("../../routes/maps");
const pool = require("../../../database/config");

jest.mock("../../../database/config");

const app = express();
app.use(express.json());
app.use("/api/maps", mapsRouter);

describe("Maps Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("GET /api/maps/restaurants", () => {
    it("should return restaurants with coordinates", async () => {
      const mockRestaurants = [
        {
          id: 1,
          name: "Restaurant 1",
          address: "123 Main St",
          latitude: 34.0522,
          longitude: -118.2437,
          cuisine_type: "Italian",
        },
        {
          id: 2,
          name: "Restaurant 2",
          address: "456 Oak Ave",
          latitude: 34.0533,
          longitude: -118.2448,
          cuisine_type: "Mexican",
        },
      ];
      pool.query.mockResolvedValue({ rows: mockRestaurants });

      const response = await request(app)
        .get("/api/maps/restaurants")
        .expect(200);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
      );
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("latitude IS NOT NULL"),
      );
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("longitude IS NOT NULL"),
      );
      expect(response.body).toEqual({
        success: true,
        data: mockRestaurants,
        count: 2,
      });
    });

    it("should return empty array when no restaurants", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get("/api/maps/restaurants")
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [],
        count: 0,
      });
    });

    it("should only return restaurants with coordinates", async () => {
      const mockRestaurants = [
        {
          id: 1,
          name: "Restaurant 1",
          latitude: 34.0522,
          longitude: -118.2437,
        },
      ];
      pool.query.mockResolvedValue({ rows: mockRestaurants });

      const response = await request(app)
        .get("/api/maps/restaurants")
        .expect(200);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining(
          "WHERE latitude IS NOT NULL AND longitude IS NOT NULL",
        ),
      );
      expect(response.body.data).toEqual(mockRestaurants);
    });

    it("should return restaurants ordered by name", async () => {
      const mockRestaurants = [
        { id: 2, name: "B Restaurant" },
        { id: 1, name: "A Restaurant" },
      ];
      pool.query.mockResolvedValue({ rows: mockRestaurants });

      await request(app).get("/api/maps/restaurants").expect(200);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("ORDER BY name"),
      );
    });

    it("should return 500 on database error", async () => {
      const error = new Error("Database connection failed");
      pool.query.mockRejectedValue(error);

      const response = await request(app)
        .get("/api/maps/restaurants")
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: "Internal server error",
      });
    });

    it("should include required fields in response", async () => {
      const mockRestaurants = [
        {
          id: 1,
          name: "Restaurant 1",
          address: "123 Main St",
          latitude: 34.0522,
          longitude: -118.2437,
          cuisine_type: "Italian",
        },
      ];
      pool.query.mockResolvedValue({ rows: mockRestaurants });

      const response = await request(app)
        .get("/api/maps/restaurants")
        .expect(200);

      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("count");
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(typeof response.body.count).toBe("number");
    });
  });
});
