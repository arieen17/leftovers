const express = require("express");
const { authenticate } = require("../middleware/auth");
const Review = require("../models/Review");
const ReviewComment = require("../models/ReviewComment");

const router = express.Router();

// Like a review
// Like/Unlike a review
router.post("/:reviewId/like", authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const reviewId = req.params.reviewId;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required",
        message: "You must be logged in to like reviews",
      });
    }

    if (!reviewId || isNaN(reviewId)) {
      return res.status(400).json({
        error: "Invalid review ID",
        message: "Please provide a valid review ID",
      });
    }

    console.log(`🔵 User ${userId} toggling like for review ${reviewId}`);

    // Determine action based on current state from query param or body
    const action = req.query.action || req.body.action; // 'like' or 'unlike'

    let result;
    if (action === "unlike") {
      result = await Review.unlikeReview(userId, reviewId);
    } else {
      result = await Review.likeReview(userId, reviewId);
    }

    console.log(`✅ User ${userId} toggled like for review ${reviewId}`);

    res.json({
      success: true,
      message: result.user_liked ? "Review liked" : "Review unliked",
      like_count: result.like_count,
      user_liked: result.user_liked,
    });
  } catch (error) {
    const userId = req.user?.userId;
    const reviewId = req.params.reviewId;

    console.error(
      `❌ Review like error for user ${userId || "unknown"}, review ${reviewId}:`,
      error.message,
    );

    // Handle specific errors
    if (error.code === "ALREADY_LIKED") {
      return res.status(400).json({
        error: "Already liked",
        message: "You have already liked this review",
      });
    }

    if (error.code === "REVIEW_NOT_FOUND") {
      return res.status(404).json({
        error: "Review not found",
        message: "The review you're trying to like does not exist",
      });
    }

    if (error.code === "23505") {
      return res.status(400).json({
        error: "Duplicate like",
        message: "You have already liked this review",
      });
    }

    if (error.code === "23503") {
      return res.status(404).json({
        error: "Review not found",
        message: "The review you're trying to like does not exist",
      });
    }

    // Generic error
    res.status(500).json({
      error: "Server error",
      message: "An unexpected error occurred",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Like/Unlike a comment
router.post("/comments/:commentId/like", authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const commentId = req.params.commentId;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required",
        message: "You must be logged in to like comments",
      });
    }

    if (!commentId || isNaN(commentId)) {
      return res.status(400).json({
        error: "Invalid comment ID",
        message: "Please provide a valid comment ID",
      });
    }

    console.log(`🔵 User ${userId} toggling like for comment ${commentId}`);

    const action = req.query.action || req.body.action;

    let result;
    if (action === "unlike") {
      result = await ReviewComment.unlikeComment(userId, commentId);
    } else {
      result = await ReviewComment.likeComment(userId, commentId);
    }

    console.log(`✅ User ${userId} toggled like for comment ${commentId}`);

    res.json({
      success: true,
      message: result.user_liked ? "Comment liked" : "Comment unliked",
      like_count: result.like_count,
      user_liked: result.user_liked,
    });
  } catch (error) {
    const userId = req.user?.userId;
    const commentId = req.params.commentId;

    console.error(
      `❌ Comment like error for user ${userId || "unknown"}, comment ${commentId}:`,
      error.message,
    );

    // Handle specific errors
    if (error.code === "ALREADY_LIKED") {
      return res.status(400).json({
        error: "Already liked",
        message: "You have already liked this comment",
      });
    }

    if (error.code === "COMMENT_NOT_FOUND") {
      return res.status(404).json({
        error: "Comment not found",
        message: "The comment you're trying to like does not exist",
      });
    }

    if (error.code === "23505") {
      return res.status(400).json({
        error: "Duplicate like",
        message: "You have already liked this comment",
      });
    }

    if (error.code === "23503") {
      return res.status(404).json({
        error: "Comment not found",
        message: "The comment you're trying to like does not exist",
      });
    }

    // Generic error
    res.status(500).json({
      error: "Server error",
      message: "An unexpected error occurred",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Add comment to review
router.post("/:reviewId/comments", authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const reviewId = req.params.reviewId;
    const { comment } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required",
        message: "You must be logged in to comment",
      });
    }

    if (!reviewId || isNaN(reviewId)) {
      return res.status(400).json({
        error: "Invalid review ID",
        message: "Please provide a valid review ID",
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        error: "Comment required",
        message: "Please provide comment text",
      });
    }

    if (comment.trim().length > 1000) {
      return res.status(400).json({
        error: "Comment too long",
        message: "Comment must be less than 1000 characters",
      });
    }

    console.log(`🔵 User ${userId} commenting on review ${reviewId}`);

    // Verify review exists
    const reviewExists = await pool.query(
      `SELECT id FROM reviews WHERE id = $1`,
      [reviewId],
    );

    if (reviewExists.rows.length === 0) {
      return res.status(404).json({
        error: "Review not found",
        message: "The review you're trying to comment on does not exist",
      });
    }

    const commentData = await ReviewComment.create({
      user_id: userId,
      review_id: reviewId,
      comment: comment.trim(),
    });

    // Increment comment count
    const updatedReview = await Review.incrementCommentCount(reviewId);

    console.log(`✅ User ${userId} commented on review ${reviewId}`);

    // Fetch user details for the response
    const userResult = await pool.query(
      `SELECT name, tier FROM users WHERE id = $1`,
      [userId],
    );

    const user = userResult.rows[0];

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: {
        ...commentData,
        user_name: user?.name || "User",
        user_tier: user?.tier || "Bronze",
        like_count: 0,
        user_liked: false,
      },
      comment_count: updatedReview.comment_count,
    });
  } catch (error) {
    const userId = req.user?.userId;
    const reviewId = req.params.reviewId;

    console.error(
      `❌ Add comment error for user ${userId || "unknown"}, review ${reviewId}:`,
      error.message,
    );

    if (error.code === "23503") {
      return res.status(404).json({
        error: "Review not found",
        message: "The review you're trying to comment on does not exist",
      });
    }

    res.status(500).json({
      error: "Server error",
      message: "Failed to add comment",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get comments for a review
router.get("/:reviewId/comments", async (req, res) => {
  try {
    const userId = req.user?.userId;
    const reviewId = req.params.reviewId;

    console.log(
      `🔵 Fetching comments for review ${reviewId}, user: ${userId || "not authenticated"}`,
    );

    const comments = await ReviewComment.getByReviewId(reviewId, userId);

    console.log(
      `✅ Successfully fetched ${comments.length} comments for review ${reviewId}`,
    );
    res.json(comments);
  } catch (error) {
    const reviewId = req.params.reviewId;

    console.error(`❌ Fetch comments error for review ${reviewId}:`, error);
    res.status(500).json({
      error: "Failed to fetch comments",
      details: error.message,
      code: error.code,
    });
  }
});

// Like a comment
router.post("/comments/:commentId/like", authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const commentId = req.params.commentId;

    if (!userId) {
      return res.status(401).json({ error: "User authentication failed" });
    }

    console.log(`🔵 User ${userId} attempting to like comment ${commentId}`);

    const like = await ReviewComment.likeComment(userId, commentId);

    console.log(`✅ User ${userId} successfully liked comment ${commentId}`);
    res.json({
      message: "Comment liked",
      like,
    });
  } catch (error) {
    const userId = req.user?.userId;
    const commentId = req.params.commentId;

    console.error(
      `❌ Like comment error for user ${userId || "unknown"}, comment ${commentId}:`,
      error,
    );

    // Handle specific PostgreSQL errors
    if (error.code === "23505") {
      // Unique violation
      return res.status(400).json({
        error: "Already liked this comment",
        details: "You have already liked this comment",
      });
    } else if (error.code === "23503") {
      // Foreign key violation
      return res.status(404).json({
        error: "Comment not found",
        details: "The specified comment does not exist",
      });
    }

    res.status(500).json({
      error: "Failed to like comment",
      details: error.message,
      code: error.code,
    });
  }
});

// Unlike a comment
router.delete("/comments/:commentId/like", authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const commentId = req.params.commentId;

    if (!userId) {
      return res.status(401).json({ error: "User authentication failed" });
    }

    console.log(`🔵 User ${userId} attempting to unlike comment ${commentId}`);

    const unlike = await ReviewComment.unlikeComment(userId, commentId);

    console.log(`✅ User ${userId} successfully unliked comment ${commentId}`);
    res.json({
      message: "Comment unliked",
      unlike,
    });
  } catch (error) {
    const userId = req.user?.userId;
    const commentId = req.params.commentId;

    console.error(
      `❌ Unlike comment error for user ${userId || "unknown"}, comment ${commentId}:`,
      error,
    );
    res.status(500).json({
      error: "Failed to unlike comment",
      details: error.message,
      code: error.code,
    });
  }
});

module.exports = router;
