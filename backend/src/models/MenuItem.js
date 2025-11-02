const pool = require('../../database/config');

class MenuItem {
  static async findByRestaurant(restaurantId) {
    const result = await pool.query(
      'SELECT * FROM menu_items WHERE restaurant_id = $1 ORDER BY category, name',
      [restaurantId]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM menu_items WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async create(menuItemData) {
    const result = await pool.query(
      `INSERT INTO menu_items (restaurant_id, name, description, price, category, image_url, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [menuItemData.restaurant_id, menuItemData.name, menuItemData.description,
       menuItemData.price, menuItemData.category, menuItemData.image_url,
       menuItemData.tags]
    );
    return result.rows[0];
  }
}

module.exports = MenuItem;