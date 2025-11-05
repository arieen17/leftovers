const express = require("express");
const { authenticate } = require("../middleware/auth");
const {
  createReview,
  getMenuItemReviews,
  getUserReviews,
} = require("../controllers/reviewController");

const router = express.Router();

// POST /api/reviews - Create new review (requires auth)
router.post("/", authenticate, createReview);

// GET /api/reviews/menu-item/:menuItemId - Get reviews for a menu item
router.get("/menu-item/:menuItemId", getMenuItemReviews);

// GET /api/reviews/user/:userId - Get reviews by a user
router.get("/user/:userId", getUserReviews);

module.exports = router;
