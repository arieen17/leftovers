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
}

module.exports = Review;
