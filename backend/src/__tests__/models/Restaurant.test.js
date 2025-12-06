const Restaurant = require("../../models/Restaurant");
const pool = require("../../../database/config");

jest.mock("../../../database/config");

describe("Restaurant Model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all restaurants", async () => {
      const mockRestaurants = [
        { id: 1, name: "Restaurant 1" },
        { id: 2, name: "Restaurant 2" },
      ];
      pool.query.mockResolvedValue({ rows: mockRestaurants });

      const result = await Restaurant.findAll();

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM restaurants ORDER BY name"),
      );
      expect(result).toEqual(mockRestaurants);
    });

    it("should return empty array when no restaurants", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await Restaurant.findAll();

      expect(result).toEqual([]);
    });
  });

  describe("findById", () => {
    it("should find restaurant by id", async () => {
      const mockRestaurant = { id: 1, name: "Restaurant 1" };
      pool.query.mockResolvedValue({ rows: [mockRestaurant] });

      const result = await Restaurant.findById(1);

      expect(pool.query).toHaveBeenCalledWith(
        "SELECT * FROM restaurants WHERE id = $1",
        [1],
      );
      expect(result).toEqual(mockRestaurant);
    });

    it("should return undefined when restaurant not found", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await Restaurant.findById(999);

      expect(result).toBeUndefined();
    });
  });

  describe("findByLocation", () => {
    it("should find restaurants by location with default radius", async () => {
      const mockRestaurants = [{ id: 1, name: "Restaurant 1" }];
      pool.query.mockResolvedValue({ rows: mockRestaurants });

      const result = await Restaurant.findByLocation(34.0522, -118.2437);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM restaurants"),
        [34.0522, -118.2437, 1],
      );
      expect(result).toEqual(mockRestaurants);
    });

    it("should find restaurants by location with custom radius", async () => {
      const mockRestaurants = [{ id: 1, name: "Restaurant 1" }];
      pool.query.mockResolvedValue({ rows: mockRestaurants });

      const result = await Restaurant.findByLocation(34.0522, -118.2437, 5);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM restaurants"),
        [34.0522, -118.2437, 5],
      );
      expect(result).toEqual(mockRestaurants);
    });
  });

  describe("create", () => {
    it("should create a new restaurant", async () => {
      const restaurantData = {
        name: "New Restaurant",
        address: "123 Main St",
        latitude: 34.0522,
        longitude: -118.2437,
        cuisine_type: "Italian",
        hours: "9am-10pm",
        image_url: "http://example.com/image.jpg",
      };
      const mockRestaurant = { id: 1, ...restaurantData };
      pool.query.mockResolvedValue({ rows: [mockRestaurant] });

      const result = await Restaurant.create(restaurantData);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO restaurants"),
        [
          restaurantData.name,
          restaurantData.address,
          restaurantData.latitude,
          restaurantData.longitude,
          restaurantData.cuisine_type,
          restaurantData.hours,
          restaurantData.image_url,
        ],
      );
      expect(result).toEqual(mockRestaurant);
    });
  });

  describe("update", () => {
    it("should update restaurant with all fields", async () => {
      const updateData = { name: "Updated Name", address: "New Address" };
      const mockUpdatedRestaurant = { id: 1, ...updateData };
      pool.query.mockResolvedValue({ rows: [mockUpdatedRestaurant] });

      const result = await Restaurant.update(1, updateData);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE restaurants"),
        expect.arrayContaining([updateData.name, updateData.address, 1]),
      );
      expect(result).toEqual(mockUpdatedRestaurant);
    });

    it("should throw error when no fields to update", async () => {
      await expect(Restaurant.update(1, {})).rejects.toThrow(
        "No fields to update",
      );
    });

    it("should ignore undefined fields", async () => {
      const updateData = { name: "New Name", address: undefined };
      const mockUpdatedRestaurant = { id: 1, name: "New Name" };
      pool.query.mockResolvedValue({ rows: [mockUpdatedRestaurant] });

      const result = await Restaurant.update(1, updateData);

      expect(result).toEqual(mockUpdatedRestaurant);
    });
  });

  describe("delete", () => {
    it("should delete restaurant by id", async () => {
      const mockDeletedRestaurant = { id: 1, name: "Deleted Restaurant" };
      pool.query.mockResolvedValue({ rows: [mockDeletedRestaurant] });

      const result = await Restaurant.delete(1);

      expect(pool.query).toHaveBeenCalledWith(
        "DELETE FROM restaurants WHERE id = $1 RETURNING *",
        [1],
      );
      expect(result).toEqual(mockDeletedRestaurant);
    });
  });

  describe("getMenuWithRatings", () => {
    it("should get menu items with ratings for restaurant", async () => {
      const mockMenu = [
        { id: 1, name: "Item 1", average_rating: 4.5, review_count: 10 },
      ];
      pool.query.mockResolvedValue({ rows: mockMenu });

      const result = await Restaurant.getMenuWithRatings(1);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT menu_items.*"),
        [1],
      );
      expect(result).toEqual(mockMenu);
    });
  });

  describe("getAverageRating", () => {
    it("should get average rating for restaurant", async () => {
      const mockRating = { average_rating: 4.5, review_count: 20 };
      pool.query.mockResolvedValue({ rows: [mockRating] });

      const result = await Restaurant.getAverageRating(1);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT AVG(reviews.rating)"),
        [1],
      );
      expect(result).toEqual(mockRating);
    });
  });

  describe("search", () => {
    it("should search restaurants by name", async () => {
      const mockResults = [{ id: 1, name: "Pizza Place" }];
      pool.query.mockResolvedValue({ rows: mockResults });

      const result = await Restaurant.search("pizza");

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM restaurants"),
        ["%pizza%"],
      );
      expect(result).toEqual(mockResults);
    });

    it("should search restaurants by cuisine type", async () => {
      const mockResults = [{ id: 1, cuisine_type: "Italian" }];
      pool.query.mockResolvedValue({ rows: mockResults });

      const result = await Restaurant.search("italian");

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("LOWER(cuisine_type) LIKE LOWER"),
        ["%italian%"],
      );
      expect(result).toEqual(mockResults);
    });
  });
});
