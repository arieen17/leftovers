const pool = require("../config");

const addReviewTags = async () => {
  const query = `
    ALTER TABLE reviews 
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'
  `;

  try {
    await pool.query(query);
    console.log("✅ Added tags column to reviews table");
  } catch (error) {
    console.error("❌ Error adding tags column to reviews table:", error);
  }
};

module.exports = { addReviewTags };
