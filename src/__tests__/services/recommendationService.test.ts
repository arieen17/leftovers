import {
  getUserRecommendations,
  getPopularItems,
} from "@/services/recommendationService";
import { apiRequest } from "@/services/api";
import { getCurrentUser } from "@/services/authService";
import { fetchMenuItemById } from "@/services/restaurantService";

jest.mock("@/services/api");
jest.mock("@/services/authService");
jest.mock("@/services/restaurantService");

describe("RecommendationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("getUserRecommendations", () => {
    const mockUser = { id: 1, email: "test@ucr.edu", name: "Test User" };
    const mockMenuItem = {
      id: 1,
      restaurant_id: 1,
      name: "Test Item",
      description: "Test description",
      price: "10.99",
      category: "Main",
      image_url: null,
      tags: [],
      created_at: new Date().toISOString(),
      average_rating: "4.5",
      review_count: "10",
    };

    it("should fetch user recommendations successfully", async () => {
      (getCurrentUser as jest.Mock).mockReturnValue(mockUser);
      (apiRequest as jest.Mock).mockResolvedValue({
        user_id: 1,
        recommendations: [
          { menu_item_id: 1, score: 0.9 },
          { menu_item_id: 2, score: 0.8 },
        ],
      });
      (fetchMenuItemById as jest.Mock)
        .mockResolvedValueOnce(mockMenuItem)
        .mockResolvedValueOnce({ ...mockMenuItem, id: 2 });

      const result = await getUserRecommendations(10);

      expect(getCurrentUser).toHaveBeenCalled();
      expect(apiRequest).toHaveBeenCalledWith(
        "/api/recommendations/user/1?limit=10",
      );
      expect(fetchMenuItemById).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when user is not authenticated", async () => {
      (getCurrentUser as jest.Mock).mockReturnValue(null);

      const result = await getUserRecommendations();

      expect(result).toEqual([]);
    });

    it("should return empty array when no recommendations", async () => {
      (getCurrentUser as jest.Mock).mockReturnValue(mockUser);
      (apiRequest as jest.Mock).mockResolvedValue({
        user_id: 1,
        recommendations: [],
      });

      const result = await getUserRecommendations();

      expect(result).toEqual([]);
      expect(fetchMenuItemById).not.toHaveBeenCalled();
    });

    it("should filter out null menu items when fetch fails", async () => {
      (getCurrentUser as jest.Mock).mockReturnValue(mockUser);
      (apiRequest as jest.Mock).mockResolvedValue({
        user_id: 1,
        recommendations: [
          { menu_item_id: 1, score: 0.9 },
          { menu_item_id: 2, score: 0.8 },
        ],
      });
      (fetchMenuItemById as jest.Mock)
        .mockResolvedValueOnce(mockMenuItem)
        .mockRejectedValueOnce(new Error("Not found"));

      const result = await getUserRecommendations();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockMenuItem);
    });

    it("should return empty array on error", async () => {
      (getCurrentUser as jest.Mock).mockReturnValue(mockUser);
      (apiRequest as jest.Mock).mockRejectedValue(new Error("API Error"));

      const result = await getUserRecommendations();

      expect(result).toEqual([]);
    });

    it("should use custom limit parameter", async () => {
      (getCurrentUser as jest.Mock).mockReturnValue(mockUser);
      (apiRequest as jest.Mock).mockResolvedValue({
        user_id: 1,
        recommendations: [],
      });

      await getUserRecommendations(5);

      expect(apiRequest).toHaveBeenCalledWith(
        "/api/recommendations/user/1?limit=5",
      );
    });
  });

  describe("getPopularItems", () => {
    const mockMenuItem = {
      id: 1,
      restaurant_id: 1,
      name: "Popular Item",
      description: "Description",
      price: "12.99",
      category: "Main",
      image_url: null,
      tags: [],
      created_at: new Date().toISOString(),
      average_rating: "4.8",
      review_count: "50",
    };

    it("should fetch popular items successfully", async () => {
      (apiRequest as jest.Mock).mockResolvedValue([mockMenuItem]);

      const result = await getPopularItems(10);

      expect(apiRequest).toHaveBeenCalledWith(
        "/api/menu-items/popular?limit=10",
      );
      expect(result).toEqual([mockMenuItem]);
    });

    it("should use default limit when not provided", async () => {
      (apiRequest as jest.Mock).mockResolvedValue([]);

      await getPopularItems();

      expect(apiRequest).toHaveBeenCalledWith(
        "/api/menu-items/popular?limit=10",
      );
    });

    it("should fallback to all menu items when popular fails", async () => {
      const allItems = [
        { ...mockMenuItem, id: 1 },
        { ...mockMenuItem, id: 2 },
        { ...mockMenuItem, id: 3 },
      ];
      (apiRequest as jest.Mock)
        .mockRejectedValueOnce(new Error("Popular failed"))
        .mockResolvedValueOnce(allItems);

      const result = await getPopularItems(2);

      expect(apiRequest).toHaveBeenCalledWith("/api/menu-items");
      expect(result).toHaveLength(2);
      expect(result).toEqual(allItems.slice(0, 2));
    });

    it("should return empty array when fallback also fails", async () => {
      (apiRequest as jest.Mock)
        .mockRejectedValueOnce(new Error("Popular failed"))
        .mockRejectedValueOnce(new Error("Fallback failed"));

      const result = await getPopularItems();

      expect(result).toEqual([]);
    });

    it("should use custom limit for fallback", async () => {
      const allItems = Array.from({ length: 20 }, (_, i) => ({
        ...mockMenuItem,
        id: i + 1,
      }));
      (apiRequest as jest.Mock)
        .mockRejectedValueOnce(new Error("Popular failed"))
        .mockResolvedValueOnce(allItems);

      const result = await getPopularItems(5);

      expect(result).toHaveLength(5);
    });
  });
});
