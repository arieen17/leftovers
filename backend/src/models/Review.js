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
      ],
    );
    return result.rows[0];
  }

  static async findByMenuItem(menuItemId, userId = null) {
  let query = `
    SELECT 
      reviews.*, 
      users.name as user_name, 
      users.tier as user_tier
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
      `SELECT reviews.*, menu_items.name as menu_item_name, restaurants.name as restaurant_name
       FROM reviews 
       JOIN menu_items ON reviews.menu_item_id = menu_items.id
       JOIN restaurants ON menu_items.restaurant_id = restaurants.id
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  static async getAverageRating(menuItemId) {
    const result = await pool.query(
      "SELECT AVG(rating) as average_rating, COUNT(*) as review_count FROM reviews WHERE menu_item_id = $1",
      [menuItemId],
    );
    return result.rows[0];
  }

  static async likeReview(userId, reviewId) {
    // Use transaction to ensure both operations succeed
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Insert the like
      const likeResult = await client.query(
        `INSERT INTO review_likes (user_id, review_id) 
         VALUES ($1, $2) 
         RETURNING *`,
        [userId, reviewId]
      );
      
      // Increment the like count
      await client.query(
        `UPDATE reviews SET like_count = like_count + 1 WHERE id = $1`,
        [reviewId]
      );
      
      await client.query('COMMIT');
      
      // Get updated review with counts
      const reviewResult = await client.query(
        `SELECT *, 
         EXISTS(SELECT 1 FROM review_likes WHERE review_id = $1 AND user_id = $2) as user_liked
         FROM reviews WHERE id = $1`,
        [reviewId, userId]
      );
      
      return reviewResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async unlikeReview(userId, reviewId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Delete the like
      const unlikeResult = await client.query(
        `DELETE FROM review_likes 
         WHERE user_id = $1 AND review_id = $2 
         RETURNING *`,
        [userId, reviewId]
      );
      
      // Decrement the like count
      await client.query(
        `UPDATE reviews SET like_count = GREATEST(0, like_count - 1) WHERE id = $1`,
        [reviewId]
      );
      
      await client.query('COMMIT');
      
      // Get updated review with counts
      const reviewResult = await client.query(
        `SELECT *, 
         EXISTS(SELECT 1 FROM review_likes WHERE review_id = $1 AND user_id = $2) as user_liked
         FROM reviews WHERE id = $1`,
        [reviewId, userId]
      );
      
      return reviewResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
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
}

module.exports = Review;