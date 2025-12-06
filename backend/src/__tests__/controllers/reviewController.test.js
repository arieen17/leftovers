const {
  createReview,
  getMenuItemReviews,
  getUserReviews,
  getReviewById,
  deleteReview,
} = require("../../controllers/reviewController");
const Review = require("../../models/Review");
const User = require("../../models/User");

jest.mock("../../models/Review");
jest.mock("../../models/User");
jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});

describe("ReviewController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe("createReview", () => {
    it("should create review successfully with authenticated user", async () => {
      req.user = { userId: 1 };
      req.body = {
        menu_item_id: 1,
        rating: 5,
        comment: "Great food!",
        photos: [],
      };

      const mockReview = {
        id: 1,
        user_id: 1,
        menu_item_id: 1,
        rating: 5,
        comment: "Great food!",
        photos: [],
      };

      const mockFullReview = {
        ...mockReview,
        menu_item_name: "Burger",
        restaurant_name: "Restaurant 1",
      };

      Review.create.mockResolvedValue(mockReview);
      Review.findById.mockResolvedValue(mockFullReview);
      User.addXP.mockResolvedValue({});

      await createReview(req, res);

      expect(Review.create).toHaveBeenCalledWith({
        menu_item_id: 1,
        rating: 5,
        comment: "Great food!",
        photos: [],
        user_id: 1,
      });
      expect(User.addXP).toHaveBeenCalledWith(1, 50);
      expect(Review.findById).toHaveBeenCalledWith(1, 1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockFullReview);
    });

    it("should return 401 if user is not authenticated", async () => {
      req.user = null;
      req.body = {
        menu_item_id: 1,
        rating: 5,
        comment: "Great food!",
      };

      await createReview(req, res);

      expect(Review.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "User not authenticated",
      });
    });

    it("should return 400 if user already reviewed menu item", async () => {
      req.user = { userId: 1 };
      req.body = {
        menu_item_id: 1,
        rating: 5,
        comment: "Great food!",
      };

      const error = new Error("Duplicate review");
      error.code = "23505";

      Review.create.mockRejectedValue(error);

      await createReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "You have already reviewed this menu item",
      });
    });

    it("should return 400 if invalid foreign key", async () => {
      req.user = { userId: 1 };
      req.body = {
        menu_item_id: 999,
        rating: 5,
        comment: "Great food!",
      };

      const error = new Error("Foreign key violation");
      error.code = "23503";

      Review.create.mockRejectedValue(error);

      await createReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid user_id or menu_item_id",
      });
    });

    it("should return 500 on other errors", async () => {
      req.user = { userId: 1 };
      req.body = {
        menu_item_id: 1,
        rating: 5,
        comment: "Great food!",
      };

      const dbError = new Error("Database error");
      Review.create.mockRejectedValue(dbError);

      await createReview(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to create review",
      });
    });
  });

  describe("getMenuItemReviews", () => {
    it("should return reviews for menu item successfully", async () => {
      req.params.menuItemId = "1";
      req.user = { userId: 1 };
      const mockReviews = [
        {
          id: 1,
          menu_item_id: 1,
          rating: 5,
          comment: "Great!",
          user_name: "John Doe",
        },
      ];

      Review.findByMenuItem.mockResolvedValue(mockReviews);

      await getMenuItemReviews(req, res);

      expect(Review.findByMenuItem).toHaveBeenCalledWith("1", 1);
      expect(res.json).toHaveBeenCalledWith(mockReviews);
    });

    it("should work without authenticated user", async () => {
      req.params.menuItemId = "1";
      req.user = null;
      const mockReviews = [];

      Review.findByMenuItem.mockResolvedValue(mockReviews);

      await getMenuItemReviews(req, res);

      expect(Review.findByMenuItem).toHaveBeenCalledWith("1", undefined);
      expect(res.json).toHaveBeenCalledWith(mockReviews);
    });

    it("should return 500 on database error", async () => {
      req.params.menuItemId = "1";
      Review.findByMenuItem.mockRejectedValue(new Error("Database error"));

      await getMenuItemReviews(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch reviews",
      });
    });
  });

  describe("getUserReviews", () => {
    it("should return reviews by user successfully", async () => {
      req.params.userId = "1";
      const mockReviews = [
        {
          id: 1,
          user_id: 1,
          menu_item_id: 1,
          rating: 5,
          comment: "Great!",
        },
      ];

      Review.findByUser.mockResolvedValue(mockReviews);

      await getUserReviews(req, res);

      expect(Review.findByUser).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith(mockReviews);
    });

    it("should return 500 on database error", async () => {
      req.params.userId = "1";
      Review.findByUser.mockRejectedValue(new Error("Database error"));

      await getUserReviews(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch user reviews",
      });
    });
  });

  describe("getReviewById", () => {
    it("should return review by id successfully", async () => {
      req.params.reviewId = "1";
      req.user = { userId: 1 };
      const mockReview = {
        id: 1,
        user_id: 1,
        menu_item_id: 1,
        rating: 5,
        comment: "Great!",
      };

      Review.findById.mockResolvedValue(mockReview);

      await getReviewById(req, res);

      expect(Review.findById).toHaveBeenCalledWith("1", 1);
      expect(res.json).toHaveBeenCalledWith(mockReview);
    });

    it("should return review by id with null userId if not authenticated", async () => {
      req.params.reviewId = "1";
      req.user = null;
      const mockReview = {
        id: 1,
        user_id: 2,
        menu_item_id: 1,
        rating: 5,
        comment: "Great!",
      };

      Review.findById.mockResolvedValue(mockReview);

      await getReviewById(req, res);

      expect(Review.findById).toHaveBeenCalledWith("1", null);
      expect(res.json).toHaveBeenCalledWith(mockReview);
    });

    it("should return 404 if review not found", async () => {
      req.params.reviewId = "999";
      req.user = { userId: 1 };
      Review.findById.mockResolvedValue(null);

      await getReviewById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Review not found",
      });
    });

    it("should return 500 on database error", async () => {
      req.params.reviewId = "1";
      req.user = { userId: 1 };
      Review.findById.mockRejectedValue(new Error("Database error"));

      await getReviewById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch review",
      });
    });
  });

  describe("deleteReview", () => {
    it("should delete review successfully", async () => {
      req.user = { userId: 1 };
      req.params.reviewId = "1";

      Review.delete.mockResolvedValue({ id: 1 });

      await deleteReview(req, res);

      expect(Review.delete).toHaveBeenCalledWith(1, 1);
      expect(res.json).toHaveBeenCalledWith({
        message: "Review deleted successfully",
      });
    });

    it("should return 401 if user is not authenticated", async () => {
      req.user = null;
      req.params.reviewId = "1";

      await deleteReview(req, res);

      expect(Review.delete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "User not authenticated",
      });
    });

    it("should return 400 for invalid review ID", async () => {
      req.user = { userId: 1 };
      req.params.reviewId = "invalid";

      await deleteReview(req, res);

      expect(Review.delete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid review ID",
      });
    });

    it("should return 404 if review not found or no permission", async () => {
      req.user = { userId: 1 };
      req.params.reviewId = "999";

      const error = new Error(
        "Review not found or you don't have permission to delete it",
      );
      Review.delete.mockRejectedValue(error);

      await deleteReview(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: error.message,
      });
    });

    it("should return 500 on database error", async () => {
      req.user = { userId: 1 };
      req.params.reviewId = "1";

      Review.delete.mockRejectedValue(new Error("Database error"));

      await deleteReview(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to delete review",
      });
    });
  });
});
