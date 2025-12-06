import {
  fetchRestaurants,
  fetchRestaurantById,
  fetchRestaurantMenu,
  fetchMenuItemById,
  searchRestaurantsAndItems,
  checkBackendHealth,
} from "@/services/restaurantService";
import { apiRequest, API_CONFIG } from "@/services/api";

jest.mock("@/services/api");
jest.spyOn(console, "error").mockImplementation(() => {});

describe("RestaurantService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchRestaurants", () => {
    it("should fetch all restaurants successfully", async () => {
      const mockRestaurants = [
        {
          id: 1,
          name: "Test Restaurant",
          address: "123 Main St",
          latitude: "34.0522",
          longitude: "-118.2437",
          cuisine_type: "Italian",
          hours: {},
          image_url: null,
          created_at: new Date().toISOString(),
        },
      ];
      (apiRequest as jest.Mock).mockResolvedValue(mockRestaurants);

      const result = await fetchRestaurants();

      expect(apiRequest).toHaveBeenCalledWith(API_CONFIG.ENDPOINTS.RESTAURANTS);
      expect(result).toEqual(
        mockRestaurants.map((r) => ({
          ...r,
          average_rating: null,
          review_count: 0,
        })),
      );
    });

    it("should preserve rating fields when provided", async () => {
      const mockRestaurants = [
        {
          id: 1,
          name: "Test Restaurant",
          address: "123 Main St",
          latitude: "34.0522",
          longitude: "-118.2437",
          cuisine_type: "Italian",
          hours: {},
          image_url: null,
          created_at: new Date().toISOString(),
          average_rating: "4.5",
          review_count: 10,
        },
      ];
      (apiRequest as jest.Mock).mockResolvedValue(mockRestaurants);

      const result = await fetchRestaurants();

      expect(result[0].average_rating).toBe("4.5");
      expect(result[0].review_count).toBe(10);
    });

    it("should throw error on failure", async () => {
      const error = new Error("Network error");
      (apiRequest as jest.Mock).mockRejectedValue(error);

      await expect(fetchRestaurants()).rejects.toThrow("Network error");
    });
  });

  describe("fetchRestaurantById", () => {
    it("should fetch restaurant by id successfully", async () => {
      const mockRestaurant = {
        id: 1,
        name: "Test Restaurant",
        address: "123 Main St",
        latitude: "34.0522",
        longitude: "-118.2437",
        cuisine_type: "Italian",
        hours: {},
        image_url: null,
        created_at: new Date().toISOString(),
      };
      (apiRequest as jest.Mock).mockResolvedValue(mockRestaurant);

      const result = await fetchRestaurantById(1);

      expect(apiRequest).toHaveBeenCalledWith(
        `${API_CONFIG.ENDPOINTS.RESTAURANTS}/1`,
      );
      expect(result).toEqual(mockRestaurant);
    });

    it("should throw error on failure", async () => {
      const error = new Error("Not found");
      (apiRequest as jest.Mock).mockRejectedValue(error);

      await expect(fetchRestaurantById(1)).rejects.toThrow("Not found");
    });
  });

  describe("fetchRestaurantMenu", () => {
    it("should fetch menu items for restaurant successfully", async () => {
      const mockMenuItems = [
        {
          id: 1,
          restaurant_id: 1,
          name: "Pizza",
          description: "Delicious pizza",
          price: "12.99",
          category: "Main",
          image_url: null,
          tags: [],
          created_at: new Date().toISOString(),
          average_rating: "4.5",
          review_count: "10",
        },
      ];
      (apiRequest as jest.Mock).mockResolvedValue(mockMenuItems);

      const result = await fetchRestaurantMenu(1);

      expect(apiRequest).toHaveBeenCalledWith(
        API_CONFIG.ENDPOINTS.RESTAURANT_MENU(1),
      );
      expect(result).toEqual(mockMenuItems);
    });

    it("should throw error on failure", async () => {
      const error = new Error("Not found");
      (apiRequest as jest.Mock).mockRejectedValue(error);

      await expect(fetchRestaurantMenu(1)).rejects.toThrow("Not found");
    });
  });

  describe("fetchMenuItemById", () => {
    it("should fetch menu item by id successfully", async () => {
      const mockMenuItem = {
        id: 1,
        restaurant_id: 1,
        name: "Pizza",
        description: "Delicious pizza",
        price: "12.99",
        category: "Main",
        image_url: null,
        tags: [],
        created_at: new Date().toISOString(),
        average_rating: "4.5",
        review_count: "10",
      };
      (apiRequest as jest.Mock).mockResolvedValue(mockMenuItem);

      const result = await fetchMenuItemById(1);

      expect(apiRequest).toHaveBeenCalledWith(
        API_CONFIG.ENDPOINTS.MENU_ITEM(1),
      );
      expect(result).toEqual(mockMenuItem);
    });

    it("should throw error on failure", async () => {
      const error = new Error("Not found");
      (apiRequest as jest.Mock).mockRejectedValue(error);

      await expect(fetchMenuItemById(1)).rejects.toThrow("Not found");
    });
  });

  describe("searchRestaurantsAndItems", () => {
    it("should search restaurants and items successfully", async () => {
      const mockResults = {
        restaurants: [
          {
            id: 1,
            name: "Pizza Place",
            address: "123 Main St",
            latitude: "34.0522",
            longitude: "-118.2437",
            cuisine_type: "Italian",
            hours: {},
            image_url: null,
            created_at: new Date().toISOString(),
          },
        ],
        menuItems: [
          {
            id: 1,
            restaurant_id: 1,
            name: "Pizza",
            description: "Delicious",
            price: "12.99",
            category: "Main",
            image_url: null,
            tags: [],
            created_at: new Date().toISOString(),
            average_rating: "4.5",
            review_count: "10",
          },
        ],
      };
      (apiRequest as jest.Mock).mockResolvedValue(mockResults);

      const result = await searchRestaurantsAndItems("pizza");

      expect(apiRequest).toHaveBeenCalledWith(
        `${API_CONFIG.ENDPOINTS.RESTAURANTS}/search?q=pizza`,
      );
      expect(result).toEqual(mockResults);
    });

    it("should encode search query", async () => {
      (apiRequest as jest.Mock).mockResolvedValue({
        restaurants: [],
        menuItems: [],
      });

      await searchRestaurantsAndItems("pizza & pasta");

      expect(apiRequest).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent("pizza & pasta")),
      );
    });

    it("should throw error on failure", async () => {
      const error = new Error("Search failed");
      (apiRequest as jest.Mock).mockRejectedValue(error);

      await expect(searchRestaurantsAndItems("pizza")).rejects.toThrow(
        "Search failed",
      );
    });
  });

  describe("checkBackendHealth", () => {
    it("should return true when backend is healthy", async () => {
      (apiRequest as jest.Mock).mockResolvedValue({
        status: "✅ Backend is healthy",
        timestamp: new Date().toISOString(),
      });

      const result = await checkBackendHealth();

      expect(apiRequest).toHaveBeenCalledWith(API_CONFIG.ENDPOINTS.HEALTH);
      expect(result).toBe(true);
    });

    it("should return false when backend status does not include checkmark", async () => {
      (apiRequest as jest.Mock).mockResolvedValue({
        status: "Backend is down",
        timestamp: new Date().toISOString(),
      });

      const result = await checkBackendHealth();

      expect(result).toBe(false);
    });

    it("should return false on error", async () => {
      (apiRequest as jest.Mock).mockRejectedValue(new Error("Network error"));

      const result = await checkBackendHealth();

      expect(result).toBe(false);
    });
  });
});
