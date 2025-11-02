const pool = require('../config');

const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      tier VARCHAR(50) DEFAULT 'Bronze',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log('✅ Users table created/verified');
  } catch (error) {
    console.error('❌ Error creating users table:', error);
  }
};

// Run table creation
createUsersTable();

module.exports = { createUsersTable };