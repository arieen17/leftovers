const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: "rateapp.c98oqscikd1q.us-east-2.rds.amazonaws.com",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "RateApp2024!",
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Database connected successfully");
  }
});

module.exports = pool;
