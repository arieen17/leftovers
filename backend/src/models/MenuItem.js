const pool = require("../../database/config");

class MenuItem {
  // Get ONE specific menu item with its ratings
  static async findById(id) {
    const result = await pool.query(
      `SELECT menu_items.*, 
              COALESCE(AVG(reviews.rating), 0) as average_rating,
              COUNT(reviews.id) as review_count
       FROM menu_items 
       LEFT JOIN reviews ON menu_items.id = reviews.menu_item_id
       WHERE menu_items.id = $1 
       GROUP BY menu_items.id`,
      [id],
    );
    return result.rows[0];
  }

  // Create ONE menu item
  static async create(menuItemData) {
    const result = await pool.query(
      `INSERT INTO menu_items (restaurant_id, name, description, price, category, image_url, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        menuItemData.restaurant_id,
        menuItemData.name,
        menuItemData.description,
        menuItemData.price,
        menuItemData.category,
        menuItemData.image_url,
        menuItemData.tags,
      ],
    );
    return result.rows[0];
  }

  // Update ONE menu item
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
      throw new Error("No fields to update");
    }

    values.push(id);
    const query = `
      UPDATE menu_items 
      SET ${fields.join(", ")} 
      WHERE id = $${paramCount} 
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete ONE menu item
  static async delete(id) {
    const result = await pool.query(
      "DELETE FROM menu_items WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0];
  }

  // Get rating stats for ONE menu item
  static async getAverageRating(menuItemId) {
    const result = await pool.query(
      "SELECT AVG(rating) as average_rating, COUNT(*) as review_count FROM reviews WHERE menu_item_id = $1",
      [menuItemId],
    );
    return result.rows[0];
  }

  // Search menu items by name, description, category, or tags
  static async search(query) {
    const searchTerm = `%${query}%`;
    const result = await pool.query(
      `SELECT menu_items.*, 
              COALESCE(AVG(reviews.rating), 0) as average_rating,
              COUNT(reviews.id) as review_count
       FROM menu_items 
       LEFT JOIN reviews ON menu_items.id = reviews.menu_item_id
       WHERE LOWER(menu_items.name) LIKE LOWER($1) 
       OR LOWER(menu_items.description) LIKE LOWER($1)
       OR LOWER(menu_items.category) LIKE LOWER($1)
       OR EXISTS (
         SELECT 1 FROM unnest(menu_items.tags) AS tag 
         WHERE LOWER(tag) LIKE LOWER($1)
       )
       GROUP BY menu_items.id
       ORDER BY menu_items.name`,
      [searchTerm],
    );
    return result.rows;
  }

  // Get popular menu items across all restaurants
  static async getPopularItems(limit = 10) {
    const result = await pool.query(
      `SELECT 
        menu_items.*,
        restaurants.name as restaurant_name,
        COALESCE(AVG(reviews.rating), 0) as average_rating,
        COUNT(reviews.id) as review_count
      FROM menu_items 
      LEFT JOIN reviews ON menu_items.id = reviews.menu_item_id
      LEFT JOIN restaurants ON menu_items.restaurant_id = restaurants.id
      GROUP BY menu_items.id, restaurants.name
      HAVING COUNT(reviews.id) >= 1
      ORDER BY average_rating DESC, review_count DESC
      LIMIT $1`,
      [limit],
    );
    return result.rows;
  }
}

module.exports = MenuItem;