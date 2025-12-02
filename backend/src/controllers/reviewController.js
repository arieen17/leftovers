const Review = require("../models/Review");

const createReview = async (req, res) => {
  try {
    // Get user_id from authenticated request
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const reviewData = {
      ...req.body,
      user_id: userId, // Override user_id from request body with authenticated user
    };
    const review = await Review.create(reviewData);
    res.status(201).json(review);
  } catch (error) {
    console.error("Review creation error:", error);
    if (error.code === "23505") {
      // Unique violation
      return res
        .status(400)
        .json({ error: "You have already reviewed this menu item" });
    }
    if (error.code === "23503") {
      // Foreign key violation
      return res.status(400).json({ error: "Invalid user_id or menu_item_id" });
    }
    res.status(500).json({ error: "Failed to create review" });
  }
};

const getMenuItemReviews = async (req, res) => {
  try {
    const reviews = await Review.findByMenuItem(req.params.menuItemId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.findByUser(req.params.userId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user reviews" });
  }
};

const getReviewById = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    console.log(`🔵 Fetching review by ID: ${reviewId}`);
    const userId = req.user?.userId || null;
    const review = await Review.findById(reviewId, userId);
    if (!review) {
      console.log(`❌ Review ${reviewId} not found`);
      return res.status(404).json({ error: "Review not found" });
    }
    console.log(`✅ Successfully fetched review ${reviewId}`);
    res.json(review);
  } catch (error) {
    console.error("Error fetching review:", error);
    res.status(500).json({ error: "Failed to fetch review" });
  }
};

const deleteReview = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const reviewId = req.params.reviewId;
    if (!reviewId || isNaN(reviewId)) {
      return res.status(400).json({ error: "Invalid review ID" });
    }

    console.log(`🔵 User ${userId} deleting review ${reviewId}`);
    await Review.delete(parseInt(reviewId), userId);
    console.log(`✅ User ${userId} deleted review ${reviewId}`);
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    if (
      error.message.includes("not found") ||
      error.message.includes("permission")
    ) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to delete review" });
  }
};

module.exports = {
  createReview,
  getMenuItemReviews,
  getUserReviews,
  getReviewById,
  deleteReview,
};
