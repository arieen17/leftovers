const express = require("express");
const { authenticate } = require("../middleware/auth");
const {
  createReview,
  getMenuItemReviews,
  getUserReviews,
  getReviewById,
  deleteReview,
} = require("../controllers/reviewController");

const router = express.Router();

// POST /api/reviews - Create new review (requires auth)
router.post("/", authenticate, createReview);

// GET /api/reviews/menu-item/:menuItemId - Get reviews for a menu item
router.get("/menu-item/:menuItemId", getMenuItemReviews);

// GET /api/reviews/user/:userId - Get reviews by a user
router.get("/user/:userId", getUserReviews);

// DELETE /api/reviews/:reviewId - Delete a review (requires auth, must be owner)
router.delete("/:reviewId", authenticate, deleteReview);

// GET /api/reviews/:reviewId - Get a single review by ID
router.get("/:reviewId", getReviewById);

module.exports = router;
