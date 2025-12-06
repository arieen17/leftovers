const request = require("supertest");
const express = require("express");
const reviewsRouter = require("../../routes/reviews");
const {
  createReview,
  getMenuItemReviews,
  getUserReviews,
  getReviewById,
  deleteReview,
} = require("../../controllers/reviewController");

jest.mock("../../controllers/reviewController");
jest.mock("../../middleware/auth", () => ({
  authenticate: (req, res, next) => {
    req.user = { userId: 1 };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use("/api/reviews", reviewsRouter);

describe("Reviews Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/reviews", () => {
    it("should call createReview controller with authentication", async () => {
      createReview.mockImplementation((req, res) => {
        res.status(201).json({ id: 1, rating: 5 });
      });

      await request(app)
        .post("/api/reviews")
        .send({ menu_item_id: 1, rating: 5 })
        .expect(201);

      expect(createReview).toHaveBeenCalled();
    });
  });

  describe("GET /api/reviews/menu-item/:menuItemId", () => {
    it("should call getMenuItemReviews controller", async () => {
      getMenuItemReviews.mockImplementation((req, res) => {
        res.json([]);
      });

      await request(app).get("/api/reviews/menu-item/1").expect(200);

      expect(getMenuItemReviews).toHaveBeenCalled();
    });
  });

  describe("GET /api/reviews/user/:userId", () => {
    it("should call getUserReviews controller", async () => {
      getUserReviews.mockImplementation((req, res) => {
        res.json([]);
      });

      await request(app).get("/api/reviews/user/1").expect(200);

      expect(getUserReviews).toHaveBeenCalled();
    });
  });

  describe("GET /api/reviews/:reviewId", () => {
    it("should call getReviewById controller", async () => {
      getReviewById.mockImplementation((req, res) => {
        res.json({ id: 1, rating: 5 });
      });

      await request(app).get("/api/reviews/1").expect(200);

      expect(getReviewById).toHaveBeenCalled();
    });
  });

  describe("DELETE /api/reviews/:reviewId", () => {
    it("should call deleteReview controller with authentication", async () => {
      deleteReview.mockImplementation((req, res) => {
        res.json({ message: "Review deleted" });
      });

      await request(app).delete("/api/reviews/1").expect(200);

      expect(deleteReview).toHaveBeenCalled();
    });
  });
});
