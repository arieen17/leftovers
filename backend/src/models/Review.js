const pool = require("../../database/config");

class Review {
  static async create(reviewData) {
    const result = await pool.query(
      `INSERT INTO reviews (user_id, menu_item_id, rating, comment, photos)
       VALUES ($1, $2, $3, $4, $5)
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

  static async findByMenuItem(menuItemId) {
    const result = await pool.query(
      `SELECT reviews.*, users.name as user_name, users.tier as user_tier
       FROM reviews 
       JOIN users ON reviews.user_id = users.id
       WHERE menu_item_id = $1 
       ORDER BY created_at DESC`,
      [menuItemId],
    );
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
  static async getReviewWithLikesAndComments(reviewId) {
    const result = await pool.query(
      `SELECT 
      r.*,
      u.name as user_name,
      u.tier as user_tier,
      COUNT(DISTINCT rl.id) as like_count,
      COUNT(DISTINCT rc.id) as comment_count,
      EXISTS(SELECT 1 FROM review_likes WHERE review_id = r.id AND user_id = $2) as user_liked
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.id
    LEFT JOIN review_likes rl ON r.id = rl.review_id
    LEFT JOIN review_comments rc ON r.id = rc.review_id
    WHERE r.id = $1
    GROUP BY r.id, u.name, u.tier`,
      [reviewId, userId], // userId for checking if current user liked it
    );
    return result.rows[0];
  }

  static async likeReview(userId, reviewId) {
    const result = await pool.query(
      `INSERT INTO review_likes (user_id, review_id) 
     VALUES ($1, $2) 
     RETURNING *`,
      [userId, reviewId],
    );
    return result.rows[0];
  }

  static async unlikeReview(userId, reviewId) {
    const result = await pool.query(
      `DELETE FROM review_likes 
     WHERE user_id = $1 AND review_id = $2 
     RETURNING *`,
      [userId, reviewId],
    );
    return result.rows[0];
  }
}

module.exports = Review;
