const Review = require("../../models/Review");
const pool = require("../../../database/config");

jest.mock("../../../database/config");

describe("Review Model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new review", async () => {
      const reviewData = {
        user_id: 1,
        menu_item_id: 1,
        rating: 5,
        comment: "Great food!",
        photos: ["photo1.jpg"],
      };
      const mockReview = {
        id: 1,
        ...reviewData,
        like_count: 0,
        comment_count: 0,
      };
      pool.query.mockResolvedValue({ rows: [mockReview] });

      const result = await Review.create(reviewData);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO reviews"),
        [
          reviewData.user_id,
          reviewData.menu_item_id,
          reviewData.rating,
          reviewData.comment,
          reviewData.photos,
        ],
      );
      expect(result).toEqual(mockReview);
    });
  });

  describe("findByMenuItem", () => {
    it("should find reviews by menu item without userId", async () => {
      const mockReviews = [
        { id: 1, menu_item_id: 1, rating: 5, user_name: "John" },
      ];
      pool.query.mockResolvedValue({ rows: mockReviews });

      const result = await Review.findByMenuItem(1);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [1],
      );
      expect(result).toEqual(mockReviews);
    });

    it("should find reviews by menu item with userId", async () => {
      const mockReviews = [
        { id: 1, menu_item_id: 1, rating: 5, user_liked: false },
      ];
      pool.query.mockResolvedValue({ rows: mockReviews });

      const result = await Review.findByMenuItem(1, 2);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [1, 2],
      );
      expect(result).toEqual(mockReviews);
    });
  });

  describe("findByUser", () => {
    it("should find reviews by user", async () => {
      const mockReviews = [
        {
          id: 1,
          user_id: 1,
          menu_item_name: "Burger",
          restaurant_name: "Restaurant 1",
        },
      ];
      pool.query.mockResolvedValue({ rows: mockReviews });

      const result = await Review.findByUser(1);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [1],
      );
      expect(result).toEqual(mockReviews);
    });
  });

  describe("findById", () => {
    it("should find review by id without userId", async () => {
      const mockReview = { id: 1, rating: 5, user_name: "John" };
      pool.query.mockResolvedValue({ rows: [mockReview] });

      const result = await Review.findById(1);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [1],
      );
      expect(result).toEqual(mockReview);
    });

    it("should find review by id with userId", async () => {
      const mockReview = { id: 1, rating: 5, user_liked: true };
      pool.query.mockResolvedValue({ rows: [mockReview] });

      const result = await Review.findById(1, 2);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [1, 2],
      );
      expect(result).toEqual(mockReview);
    });

    it("should return null when review not found", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await Review.findById(999);

      expect(result).toBeNull();
    });
  });

  describe("getAverageRating", () => {
    it("should get average rating for menu item", async () => {
      const mockRating = { average_rating: 4.5, review_count: 10 };
      pool.query.mockResolvedValue({ rows: [mockRating] });

      const result = await Review.getAverageRating(1);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT AVG(rating)"),
        [1],
      );
      expect(result).toEqual(mockRating);
    });
  });

  describe("likeReview", () => {
    it("should like a review", async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // existingLike check
        .mockResolvedValueOnce({}) // INSERT
        .mockResolvedValueOnce({ rows: [{ like_count: "5" }] }) // like count
        .mockResolvedValueOnce({}); // COMMIT

      const result = await Review.likeReview(1, 1);

      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
      expect(result).toEqual({ like_count: 5, user_liked: true });
      expect(mockClient.release).toHaveBeenCalled();
    });

    it("should unlike if already liked", async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // existingLike found
        .mockResolvedValueOnce({}); // ROLLBACK

      const originalUnlikeReview = Review.unlikeReview;
      Review.unlikeReview = jest.fn().mockResolvedValue({
        like_count: 4,
        user_liked: false,
      });

      const result = await Review.likeReview(1, 1);

      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
      expect(Review.unlikeReview).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual({ like_count: 4, user_liked: false });

      Review.unlikeReview = originalUnlikeReview;
    });
  });

  describe("unlikeReview", () => {
    it("should unlike a review", async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // existingLike found
        .mockResolvedValueOnce({ rows: [{}] }) // DELETE
        .mockResolvedValueOnce({ rows: [{ like_count: "3" }] }) // like count
        .mockResolvedValueOnce({}); // COMMIT

      const result = await Review.unlikeReview(1, 1);

      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
      expect(result).toEqual({ like_count: 3, user_liked: false });
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe("incrementCommentCount", () => {
    it("should increment comment count", async () => {
      const mockReview = { id: 1, comment_count: 5 };
      pool.query.mockResolvedValue({ rows: [mockReview] });

      const result = await Review.incrementCommentCount(1);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE reviews SET comment_count"),
        [1],
      );
      expect(result).toEqual(mockReview);
    });
  });

  describe("delete", () => {
    it("should delete review", async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const result = await Review.delete(1, 1);

      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
      expect(result).toEqual({ id: 1 });
      expect(mockClient.release).toHaveBeenCalled();
    });

    it("should throw error if review not found", async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [] }); // review not found

      await expect(Review.delete(1, 1)).rejects.toThrow(
        "Review not found or you don't have permission to delete it",
      );
      expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    });
  });
});
