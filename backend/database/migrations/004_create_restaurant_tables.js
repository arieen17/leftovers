const pool = require("../config");

const createRestaurantTables = async () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS restaurants (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address TEXT NOT NULL,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      cuisine_type VARCHAR(100),
      hours JSONB,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS menu_items (
      id SERIAL PRIMARY KEY,
      restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2),
      category VARCHAR(100),
      image_url TEXT,
      tags TEXT[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  try {
    for (const query of queries) {
      await pool.query(query);
    }
    console.log("✅ Restaurant and menu tables created");
  } catch (error) {
    console.error("❌ Error creating restaurant tables:", error);
  }
};

module.exports = { createRestaurantTables };
