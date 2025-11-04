const pool = require('../../database/config');

class Restaurant {
  static async findAll() {
    const result = await pool.query(`
      SELECT * FROM restaurants ORDER BY name
    `);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM restaurants WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByLocation(latitude, longitude, radius = 1) {
    const result = await pool.query(`
      SELECT * FROM restaurants 
      WHERE latitude BETWEEN $1 - $3 AND $1 + $3
      AND longitude BETWEEN $2 - $3 AND $2 + $3
    `, [latitude, longitude, radius]);
    return result.rows;
  }

  static async create(restaurantData) {
    const result = await pool.query(
      `INSERT INTO restaurants (name, address, latitude, longitude, cuisine_type, hours, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [restaurantData.name, restaurantData.address, restaurantData.latitude, 
       restaurantData.longitude, restaurantData.cuisine_type, restaurantData.hours, 
       restaurantData.image_url]
    );
    return result.rows[0];
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `
      UPDATE restaurants 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM restaurants WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  // GET ALL menu items for a restaurant WITH ratings
  static async getMenuWithRatings(restaurantId) {
    const result = await pool.query(
      `SELECT menu_items.*, 
              COALESCE(AVG(reviews.rating), 0) as average_rating,
              COUNT(reviews.id) as review_count
       FROM menu_items 
       LEFT JOIN reviews ON menu_items.id = reviews.menu_item_id
       WHERE restaurant_id = $1 
       GROUP BY menu_items.id
       ORDER BY category, name`,
      [restaurantId]
    );
    return result.rows;
  }

  // Get overall average rating for the entire restaurant
  static async getAverageRating(restaurantId) {
    const result = await pool.query(
      `SELECT AVG(reviews.rating) as average_rating, 
              COUNT(reviews.id) as review_count
       FROM reviews 
       JOIN menu_items ON reviews.menu_item_id = menu_items.id 
       WHERE menu_items.restaurant_id = $1`,
      [restaurantId]
    );
    return result.rows[0];
  }
}

module.exports = Restaurant;