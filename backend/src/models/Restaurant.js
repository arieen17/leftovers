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
    // Simple distance calculation (will enhance later with PostGIS)
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
}

module.exports = Restaurant;