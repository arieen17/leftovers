const express = require("express");
const { authenticate } = require("../middleware/auth");
const Review = require("../models/Review");
const ReviewComment = require("../models/ReviewComment");

const router = express.Router();

// Like a review
router.post("/:reviewId/like", authenticate, async (req, res) => {
  try {
    const like = await Review.likeReview(req.user.userId, req.params.reviewId);
    res.json({ message: "Review liked", like });
  } catch (error) {
    res.status(500).json({ error: "Failed to like review" });
  }
});

// Unlike a review
router.delete("/:reviewId/like", authenticate, async (req, res) => {
  try {
    const unlike = await Review.unlikeReview(
      req.user.userId,
      req.params.reviewId,
    );
    res.json({ message: "Review unliked", unlike });
  } catch (error) {
    res.status(500).json({ error: "Failed to unlike review" });
  }
});

// Add comment to review
router.post("/:reviewId/comments", authenticate, async (req, res) => {
  try {
    const comment = await ReviewComment.create({
      user_id: req.user.userId,
      review_id: req.params.reviewId,
      comment: req.body.comment,
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Get comments for a review
router.get("/:reviewId/comments", async (req, res) => {
  try {
    const comments = await ReviewComment.getByReviewId(
      req.params.reviewId,
      req.user?.userId,
    );
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// Like a comment
router.post("/comments/:commentId/like", authenticate, async (req, res) => {
  try {
    const like = await ReviewComment.likeComment(
      req.user.userId,
      req.params.commentId,
    );
    res.json({ message: "Comment liked", like });
  } catch (error) {
    res.status(500).json({ error: "Failed to like comment" });
  }
});

// Unlike a comment
router.delete("/comments/:commentId/like", authenticate, async (req, res) => {
  try {
    const unlike = await ReviewComment.unlikeComment(
      req.user.userId,
      req.params.commentId,
    );
    res.json({ message: "Comment unliked", unlike });
  } catch (error) {
    res.status(500).json({ error: "Failed to unlike comment" });
  }
});

module.exports = router;
