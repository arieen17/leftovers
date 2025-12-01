const express = require("express");
const { authenticate } = require("../middleware/auth");
const Review = require("../models/Review");
const ReviewComment = require("../models/ReviewComment");

const router = express.Router();

// Like a review
router.post("/:reviewId/like", authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const reviewId = req.params.reviewId;
    
    if (!userId) {
      return res.status(401).json({ error: "User authentication failed" });
    }
    
    console.log(`🔵 User ${userId} attempting to like review ${reviewId}`);
    
    const updatedReview = await Review.likeReview(userId, reviewId);
    
    console.log(`✅ User ${userId} successfully liked review ${reviewId}`);
    res.json({ 
      message: "Review liked", 
      like_count: updatedReview.like_count,
      user_liked: updatedReview.user_liked
    });
    
  } catch (error) {
    const userId = req.user?.userId;
    const reviewId = req.params.reviewId;
    
    console.error(`❌ Like review error for user ${userId || 'unknown'}, review ${reviewId}:`, error);
    
    // Handle specific PostgreSQL errors
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ 
        error: "Already liked this review",
        details: "You have already liked this review"
      });
    } else if (error.code === '23503') { // Foreign key violation
      return res.status(404).json({ 
        error: "Review not found",
        details: "The specified review does not exist"
      });
    }
    
    res.status(500).json({ 
      error: "Failed to like review",
      details: error.message,
      code: error.code
    });
  }
});

// Unlike a review
router.delete("/:reviewId/like", authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const reviewId = req.params.reviewId;
    
    if (!userId) {
      return res.status(401).json({ error: "User authentication failed" });
    }
    
    console.log(`🔵 User ${userId} attempting to unlike review ${reviewId}`);
    
    const updatedReview = await Review.unlikeReview(userId, reviewId);
    
    console.log(`✅ User ${userId} successfully unliked review ${reviewId}`);
    res.json({ 
      message: "Review unliked", 
      like_count: updatedReview.like_count,
      user_liked: updatedReview.user_liked
    });
    
  } catch (error) {
    const userId = req.user?.userId;
    const reviewId = req.params.reviewId;
    
    console.error(`❌ Unlike review error for user ${userId || 'unknown'}, review ${reviewId}:`, error);
    res.status(500).json({ 
      error: "Failed to unlike review",
      details: error.message,
      code: error.code
    });
  }
});

// Add comment to review
router.post("/:reviewId/comments", authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const reviewId = req.params.reviewId;
    
    if (!userId) {
      return res.status(401).json({ error: "User authentication failed" });
    }
    
    console.log(`🔵 User ${userId} attempting to comment on review ${reviewId}`);
    
    const { comment } = req.body;
    
    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: "Comment text is required" });
    }
    
    const commentData = await ReviewComment.create({
      user_id: userId,
      review_id: reviewId,
      comment: comment.trim()
    });
    
    // Increment comment count in review
    const updatedReview = await Review.incrementCommentCount(reviewId);
    
    console.log(`✅ User ${userId} successfully commented on review ${reviewId}`);
    res.status(201).json({
      ...commentData,
      comment_count: updatedReview.comment_count
    });
    
  } catch (error) {
    const userId = req.user?.userId;
    const reviewId = req.params.reviewId;
    
    console.error(`❌ Add comment error for user ${userId || 'unknown'}, review ${reviewId}:`, error);
    
    // Handle specific PostgreSQL errors
    if (error.code === '23503') { // Foreign key violation
      return res.status(404).json({ 
        error: "Review not found",
        details: "The specified review does not exist"
      });
    }
    
    res.status(500).json({ 
      error: "Failed to add comment",
      details: error.message,
      code: error.code
    });
  }
});

// Get comments for a review
router.get("/:reviewId/comments", async (req, res) => {
  try {
    const userId = req.user?.userId;
    const reviewId = req.params.reviewId;
    
    console.log(`🔵 Fetching comments for review ${reviewId}, user: ${userId || 'not authenticated'}`);
    
    const comments = await ReviewComment.getByReviewId(reviewId, userId);
    
    console.log(`✅ Successfully fetched ${comments.length} comments for review ${reviewId}`);
    res.json(comments);
    
  } catch (error) {
    const reviewId = req.params.reviewId;
    
    console.error(`❌ Fetch comments error for review ${reviewId}:`, error);
    res.status(500).json({ 
      error: "Failed to fetch comments",
      details: error.message,
      code: error.code
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
      like
    });
    
  } catch (error) {
    const userId = req.user?.userId;
    const commentId = req.params.commentId;
    
    console.error(`❌ Like comment error for user ${userId || 'unknown'}, comment ${commentId}:`, error);
    
    // Handle specific PostgreSQL errors
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ 
        error: "Already liked this comment",
        details: "You have already liked this comment"
      });
    } else if (error.code === '23503') { // Foreign key violation
      return res.status(404).json({ 
        error: "Comment not found",
        details: "The specified comment does not exist"
      });
    }
    
    res.status(500).json({ 
      error: "Failed to like comment",
      details: error.message,
      code: error.code
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
      unlike
    });
    
  } catch (error) {
    const userId = req.user?.userId;
    const commentId = req.params.commentId;
    
    console.error(`❌ Unlike comment error for user ${userId || 'unknown'}, comment ${commentId}:`, error);
    res.status(500).json({ 
      error: "Failed to unlike comment",
      details: error.message,
      code: error.code
    });
  }
});

module.exports = router;