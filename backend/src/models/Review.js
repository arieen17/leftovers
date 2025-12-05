const pool = require("../../database/config");

class Review {
  static async create(reviewData) {
    const result = await pool.query(
      `INSERT INTO reviews (user_id, menu_item_id, rating, comment, photos, like_count, comment_count)
       VALUES ($1, $2, $3, $4, $5, 0, 0)
       RETURNING *`,
      [
        reviewData.user_id,
        reviewData.menu_item_id,
        reviewData.rating,
        reviewData.comment,
        reviewData.photos,
      ]
    );
    return result.rows[0];
  }

  static async findByMenuItem(menuItemId, userId = null) {
    let query = `
    SELECT 
      reviews.*, 
      users.name as user_name, 
      users.tier as user_tier,
      (SELECT COUNT(*) FROM review_likes WHERE review_id = reviews.id) as like_count
  `;

    if (userId) {
      query += `,
      EXISTS(SELECT 1 FROM review_likes WHERE review_id = reviews.id AND user_id = $2) as user_liked
    `;
    } else {
      query += `, false as user_liked`;
    }

    query += `
    FROM reviews 
    JOIN users ON reviews.user_id = users.id
    WHERE menu_item_id = $1 
    ORDER BY created_at DESC
  `;

    const params = userId ? [menuItemId, userId] : [menuItemId];
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findByUser(userId) {
    const result = await pool.query(
      `SELECT 
        reviews.*, 
        menu_items.name as menu_item_name, 
        restaurants.name as restaurant_name,
        (SELECT COUNT(*) FROM review_likes WHERE review_id = reviews.id) as like_count,
        EXISTS(SELECT 1 FROM review_likes WHERE review_id = reviews.id AND user_id = $1) as user_liked
       FROM reviews 
       JOIN menu_items ON reviews.menu_item_id = menu_items.id
       JOIN restaurants ON menu_items.restaurant_id = restaurants.id
       WHERE reviews.user_id = $1 
       ORDER BY reviews.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async findById(reviewId, userId = null) {
    let query = `
      SELECT 
        reviews.*, 
        users.name as user_name, 
        users.tier as user_tier,
        menu_items.name as menu_item_name,
        menu_items.tags as menu_item_tags,
        restaurants.name as restaurant_name,
        (SELECT COUNT(*) FROM review_likes WHERE review_id = reviews.id) as like_count
    `;

    if (userId) {
      query += `,
        EXISTS(SELECT 1 FROM review_likes WHERE review_id = reviews.id AND user_id = $2) as user_liked
      `;
    } else {
      query += `, false as user_liked`;
    }

    query += `
      FROM reviews 
      JOIN users ON reviews.user_id = users.id
      JOIN menu_items ON reviews.menu_item_id = menu_items.id
      JOIN restaurants ON menu_items.restaurant_id = restaurants.id
      WHERE reviews.id = $1
    `;

    const params = userId ? [reviewId, userId] : [reviewId];
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }

  static async getAverageRating(menuItemId) {
    const result = await pool.query(
      "SELECT AVG(rating) as average_rating, COUNT(*) as review_count FROM reviews WHERE menu_item_id = $1",
      [menuItemId]
    );
    return result.rows[0];
  }

  // In Review.js
  static async likeReview(userId, reviewId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // First check if already liked
      const existingLike = await client.query(
        `SELECT * FROM review_likes WHERE user_id = $1 AND review_id = $2`,
        [userId, reviewId]
      );

      if (existingLike.rows.length > 0) {
        // Already liked - unlike instead
        await client.query("ROLLBACK");
        return await this.unlikeReview(userId, reviewId);
      }

      // Insert the like
      await client.query(
        `INSERT INTO review_likes (user_id, review_id) VALUES ($1, $2)`,
        [userId, reviewId]
      );

      // Get updated counts
      const likeCountResult = await client.query(
        `SELECT COUNT(*) as like_count FROM review_likes WHERE review_id = $1`,
        [reviewId]
      );

      await client.query("COMMIT");

      return {
        like_count: parseInt(likeCountResult.rows[0].like_count),
        user_liked: true,
      };
    } catch (error) {
      await client.query("ROLLBACK");

      // Handle specific errors
      if (error.code === "23505") {
        // Unique violation
        const customError = new Error("User has already liked this review");
        customError.code = "ALREADY_LIKED";
        throw customError;
      } else if (error.code === "23503") {
        // Foreign key violation
        const customError = new Error("Review not found");
        customError.code = "REVIEW_NOT_FOUND";
        throw customError;
      }

      throw error;
    } finally {
      client.release();
    }
  }

  static async unlikeReview(userId, reviewId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // First check if like exists
      const existingLike = await client.query(
        `SELECT * FROM review_likes WHERE user_id = $1 AND review_id = $2`,
        [userId, reviewId]
      );

      if (existingLike.rows.length === 0) {
        // Not liked yet - like instead
        await client.query("ROLLBACK");
        return await this.likeReview(userId, reviewId);
      }

      // Delete the like
      const deleteResult = await client.query(
        `DELETE FROM review_likes WHERE user_id = $1 AND review_id = $2 RETURNING *`,
        [userId, reviewId]
      );

      // Get updated counts
      const likeCountResult = await client.query(
        `SELECT COUNT(*) as like_count FROM review_likes WHERE review_id = $1`,
        [reviewId]
      );

      await client.query("COMMIT");

      return {
        like_count: parseInt(likeCountResult.rows[0].like_count),
        user_liked: false,
      };
    } catch (error) {
      await client.query("ROLLBACK");

      // Handle specific errors
      if (error.code === "23503") {
        // Foreign key violation
        const customError = new Error("Review not found");
        customError.code = "REVIEW_NOT_FOUND";
        throw customError;
      }

      throw error;
    } finally {
      client.release();
    }
  }

  static async incrementCommentCount(reviewId) {
    const result = await pool.query(
      `UPDATE reviews SET comment_count = comment_count + 1 WHERE id = $1 RETURNING *`,
      [reviewId]
    );
    return result.rows[0];
  }

  static async delete(reviewId, userId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const reviewResult = await client.query(
        `SELECT * FROM reviews WHERE id = $1 AND user_id = $2`,
        [reviewId, userId]
      );

      if (reviewResult.rows.length === 0) {
        await client.query("ROLLBACK");
        throw new Error(
          "Review not found or you don't have permission to delete it"
        );
      }

      await client.query(`DELETE FROM review_likes WHERE review_id = $1`, [
        reviewId,
      ]);

      await client.query(`DELETE FROM review_comments WHERE review_id = $1`, [
        reviewId,
      ]);

      const deleteResult = await client.query(
        `DELETE FROM reviews WHERE id = $1 RETURNING *`,
        [reviewId]
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

module.exports = Review;