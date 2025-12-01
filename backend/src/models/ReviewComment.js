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

  static async getByReviewId(reviewId, userId = null) {
    let query = `
      SELECT 
        rc.*,
        u.name as user_name,
        u.tier as user_tier
    `;

    if (userId) {
      query += `,
        EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = rc.id AND user_id = $2) as user_liked
      `;
    } else {
      query += `, false as user_liked`;
    }

    query += `
      FROM review_comments rc
      LEFT JOIN users u ON rc.user_id = u.id
      WHERE rc.review_id = $1
      ORDER BY rc.created_at ASC
    `;

    const params = userId ? [reviewId, userId] : [reviewId];
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async likeComment(userId, commentId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check if already liked
    const existingLike = await client.query(
      `SELECT * FROM comment_likes WHERE user_id = $1 AND comment_id = $2`,
      [userId, commentId]
    );
    
    if (existingLike.rows.length > 0) {
      await client.query('ROLLBACK');
      return await this.unlikeComment(userId, commentId);
    }
    
    // Insert the like
    await client.query(
      `INSERT INTO comment_likes (user_id, comment_id) VALUES ($1, $2)`,
      [userId, commentId]
    );
    
    // Increment like count
    await client.query(
      `UPDATE review_comments SET like_count = like_count + 1 WHERE id = $1`,
      [commentId]
    );
    
    // Get updated comment
    const commentResult = await client.query(
      `SELECT *, true as user_liked FROM review_comments WHERE id = $1`,
      [commentId]
    );
    
    if (commentResult.rows.length === 0) {
      throw new Error('Comment not found');
    }
    
    await client.query('COMMIT');
    
    return {
      like_count: commentResult.rows[0].like_count,
      user_liked: true
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    
    if (error.code === '23505') {
      const customError = new Error('User has already liked this comment');
      customError.code = 'ALREADY_LIKED';
      throw customError;
    } else if (error.code === '23503') {
      const customError = new Error('Comment not found');
      customError.code = 'COMMENT_NOT_FOUND';
      throw customError;
    }
    
    throw error;
  } finally {
    client.release();
  }
}

static async unlikeComment(userId, commentId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check if like exists
    const existingLike = await client.query(
      `SELECT * FROM comment_likes WHERE user_id = $1 AND comment_id = $2`,
      [userId, commentId]
    );
    
    if (existingLike.rows.length === 0) {
      await client.query('ROLLBACK');
      return await this.likeComment(userId, commentId);
    }
    
    // Delete the like
    await client.query(
      `DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2`,
      [userId, commentId]
    );
    
    // Decrement like count (ensure it doesn't go below 0)
    await client.query(
      `UPDATE review_comments SET like_count = GREATEST(0, like_count - 1) WHERE id = $1`,
      [commentId]
    );
    
    // Get updated comment
    const commentResult = await client.query(
      `SELECT *, false as user_liked FROM review_comments WHERE id = $1`,
      [commentId]
    );
    
    if (commentResult.rows.length === 0) {
      throw new Error('Comment not found');
    }
    
    await client.query('COMMIT');
    
    return {
      like_count: commentResult.rows[0].like_count,
      user_liked: false
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    
    if (error.code === '23503') {
      const customError = new Error('Comment not found');
      customError.code = 'COMMENT_NOT_FOUND';
      throw customError;
    }
    
    throw error;
  } finally {
    client.release();
  }
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
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Get the comment to know which review to update
      const commentResult = await client.query(
        `SELECT * FROM review_comments WHERE id = $1`,
        [commentId],
      );

      if (commentResult.rows.length === 0) {
        throw new Error("Comment not found");
      }

      const comment = commentResult.rows[0];

      // Delete the comment
      const deleteResult = await client.query(
        `DELETE FROM review_comments WHERE id = $1 RETURNING *`,
        [commentId],
      );

      // Decrement the review's comment count
      await client.query(
        `UPDATE reviews SET comment_count = GREATEST(0, comment_count - 1) WHERE id = $1`,
        [comment.review_id],
      );

      await client.query("COMMIT");
      return deleteResult.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = ReviewComment;
