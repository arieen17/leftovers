const Review = require("../models/Review");

const createReview = async (req, res) => {
  try {
    const review = await Review.create(req.body);
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

module.exports = {
  createReview,
  getMenuItemReviews,
  getUserReviews,
};
