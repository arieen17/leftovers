const pool = require("../config");

async function run_migrations() {
  try {
    console.log("🚀 Starting database migrations...");

    // Run restaurant tables migration
    const {
      createRestaurantTables,
    } = require("../migrations/004_create_restaurant_tables");
    await createRestaurantTables();

    // Run reviews table migration
    const {
      createReviewsTable,
    } = require("../migrations/005_create_reviews_table");
    await createReviewsTable();

    console.log("✅ All migrations completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

run_migrations();
