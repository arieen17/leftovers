import {
  createReview,
  getReviewById,
  getMenuItemReviews,
  deleteReview,
} from "@/services/reviewService";
import { apiRequest } from "@/services/api";
import { getAuthToken } from "@/services/authService";

jest.mock("@/services/api");
jest.mock("@/services/authService");
jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "log").mockImplementation(() => {});

describe("ReviewService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createReview", () => {
    const mockReviewData = {
      menu_item_id: 1,
      rating: 5,
      comment: "Great food!",
      photos: ["photo1.jpg"],
    };

    const mockReview = {
      id: 1,
      user_id: 1,
      menu_item_id: 1,
      rating: 5,
      comment: "Great food!",
      photos: ["photo1.jpg"],
      created_at: new Date().toISOString(),
    };

    it("should throw error when user is not authenticated", async () => {
      (getAuthToken as jest.Mock).mockReturnValue(null);

      await expect(createReview(mockReviewData)).rejects.toThrow(
        "User not authenticated. Please log in to create a review.",
      );
    });

    it("should handle invalid token error", async () => {
      (getAuthToken as jest.Mock).mockReturnValue("invalid-token");
      (apiRequest as jest.Mock).mockRejectedValue(new Error("Invalid token"));

      await expect(createReview(mockReviewData)).rejects.toThrow(
        "Your session has expired. Please log in again.",
      );
    });

    it("should throw other errors as-is", async () => {
      (getAuthToken as jest.Mock).mockReturnValue("mock-token");
      const error = new Error("Server error");
      (apiRequest as jest.Mock).mockRejectedValue(error);

      await expect(createReview(mockReviewData)).rejects.toThrow(
        "Server error",
      );
    });
  });

  describe("getMenuItemReviews", () => {
    const mockReviews = [
      {
        id: 1,
        user_id: 1,
        menu_item_id: 1,
        rating: 5,
        comment: "Great!",
        photos: [],
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        user_id: 2,
        menu_item_id: 1,
        rating: 4,
        comment: "Good!",
        photos: [],
        created_at: new Date().toISOString(),
      },
    ];
    it("should return empty array when no reviews", async () => {
      (apiRequest as jest.Mock).mockResolvedValue([]);

      const result = await getMenuItemReviews(1);

      expect(result).toEqual([]);
    });

    it("should throw error on failure", async () => {
      const error = new Error("Network error");
      (apiRequest as jest.Mock).mockRejectedValue(error);

      await expect(getMenuItemReviews(1)).rejects.toThrow("Network error");
    });
  });

  describe("deleteReview", () => {
    it("should throw error when user is not authenticated", async () => {
      (getAuthToken as jest.Mock).mockReturnValue(null);

      await expect(deleteReview(1)).rejects.toThrow("User not authenticated");
    });

    it("should throw error on failure", async () => {
      (getAuthToken as jest.Mock).mockReturnValue("mock-token");
      const error = new Error("Forbidden");
      (apiRequest as jest.Mock).mockRejectedValue(error);

      await expect(deleteReview(1)).rejects.toThrow("Forbidden");
    });
  });
});
