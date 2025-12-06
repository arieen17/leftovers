const request = require("supertest");
const express = require("express");
const reviewInteractionsRouter = require("../../routes/reviewInteractions");
const Review = require("../../models/Review");
const ReviewComment = require("../../models/ReviewComment");
const User = require("../../models/User");
const pool = require("../../../database/config");

jest.mock("../../models/Review");
jest.mock("../../models/ReviewComment");
jest.mock("../../models/User");
jest.mock("../../../database/config");
jest.mock("../../middleware/auth", () => ({
  authenticate: (req, res, next) => {
    req.user = { userId: 1 };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use("/api/review-interactions", reviewInteractionsRouter);

describe("ReviewInteractions Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("POST /api/review-interactions/:reviewId/like", () => {
    it("should like a review successfully", async () => {
      Review.likeReview.mockResolvedValue({
        like_count: 5,
        user_liked: true,
      });
      pool.query.mockResolvedValue({
        rows: [{ user_id: 2 }],
      });
      User.incrementLikes.mockResolvedValue({});

      const response = await request(app)
        .post("/api/review-interactions/1/like")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user_liked).toBe(true);
    });

    it("should return 400 for invalid review ID", async () => {
      const response = await request(app)
        .post("/api/review-interactions/invalid/like")
        .expect(400);

      expect(response.body.error).toBe("Invalid review ID");
    });
  });

  describe("POST /api/review-interactions/comments/:commentId/like", () => {
    it("should like a comment successfully", async () => {
      ReviewComment.likeComment.mockResolvedValue({
        like_count: 3,
        user_liked: true,
      });
      pool.query.mockResolvedValue({
        rows: [{ user_id: 2 }],
      });
      User.incrementLikes.mockResolvedValue({});

      const response = await request(app)
        .post("/api/review-interactions/comments/1/like")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user_liked).toBe(true);
    });

    it("should return 400 for invalid comment ID", async () => {
      const response = await request(app)
        .post("/api/review-interactions/comments/invalid/like")
        .expect(400);

      expect(response.body.error).toBe("Invalid comment ID");
    });
  });

  describe("POST /api/review-interactions/:reviewId/comments", () => {
    it("should add comment to review successfully", async () => {
      const mockComment = {
        id: 1,
        review_id: 1,
        comment: "Great review!",
        user_id: 1,
      };
      ReviewComment.create.mockResolvedValue(mockComment);
      Review.incrementCommentCount.mockResolvedValue({
        id: 1,
        comment_count: 5,
      });
      pool.query
        .mockResolvedValueOnce({
          rows: [{ id: 1 }],
        })
        .mockResolvedValueOnce({
          rows: [{ name: "Test User", tier: "bronze" }],
        });

      const response = await request(app)
        .post("/api/review-interactions/1/comments")
        .send({ comment: "Great review!" })
        .expect(201);

      expect(response.body.comment).toBe("Great review!");
    });

    it("should return 400 when comment is missing", async () => {
      const response = await request(app)
        .post("/api/review-interactions/1/comments")
        .send({})
        .expect(400);

      expect(response.body.error).toBe("Comment required");
    });
  });

  describe("GET /api/review-interactions/:reviewId/comments", () => {
    it("should get comments for review", async () => {
      const mockComments = [{ id: 1, comment: "Nice!", user_name: "John" }];
      ReviewComment.getByReviewId.mockResolvedValue(mockComments);

      const response = await request(app)
        .get("/api/review-interactions/1/comments")
        .expect(200);

      expect(response.body).toEqual(mockComments);
    });
  });
});
