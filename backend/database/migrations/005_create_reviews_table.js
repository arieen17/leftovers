const pool = require("../config");

const createReviewsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      photos TEXT[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, menu_item_id) -- Prevent duplicate reviews
    )
  `;

  try {
    await pool.query(query);
    console.log("✅ Reviews table created");
  } catch (error) {
    console.error("❌ Error creating reviews table:", error);
  }
};

createReviewsTable();
