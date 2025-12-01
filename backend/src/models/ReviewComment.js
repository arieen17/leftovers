const pool = require("../../database/config");

class ReviewComment {
  static async create(commentData) {
    const result = await pool.query(
      `INSERT INTO review_comments (user_id, review_id, comment) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [commentData.user_id, commentData.review_id, commentData.comment],
    );
    return result.rows[0];
  }

  static async getByReviewId(reviewId) {
    const result = await pool.query(
      `SELECT 
        rc.*,
        u.name as user_name,
        u.tier as user_tier,
        COUNT(DISTINCT cl.id) as like_count,
        EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = rc.id AND user_id = $2) as user_liked
      FROM review_comments rc
      LEFT JOIN users u ON rc.user_id = u.id
      LEFT JOIN comment_likes cl ON rc.id = cl.comment_id
      WHERE rc.review_id = $1
      GROUP BY rc.id, u.name, u.tier
      ORDER BY rc.created_at ASC`,
      [reviewId, userId], // userId for checking if current user liked comment
    );
    return result.rows;
  }

  static async likeComment(userId, commentId) {
    const result = await pool.query(
      `INSERT INTO comment_likes (user_id, comment_id) 
       VALUES ($1, $2) 
       RETURNING *`,
      [userId, commentId],
    );
    return result.rows[0];
  }

  static async unlikeComment(userId, commentId) {
    const result = await pool.query(
      `DELETE FROM comment_likes 
       WHERE user_id = $1 AND comment_id = $2 
       RETURNING *`,
      [userId, commentId],
    );
    return result.rows[0];
  }

  static async update(commentId, commentText) {
    const result = await pool.query(
      `UPDATE review_comments 
       SET comment = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [commentText, commentId],
    );
    return result.rows[0];
  }

  static async delete(commentId) {
    const result = await pool.query(
      `DELETE FROM review_comments WHERE id = $1 RETURNING *`,
      [commentId],
    );
    return result.rows[0];
  }
}

module.exports = ReviewComment;
