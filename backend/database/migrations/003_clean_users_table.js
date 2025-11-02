const pool = require('../config');

const createCleanUsersTable = async () => {
  const query = `
    DROP TABLE IF EXISTS users CASCADE;
    
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      tier VARCHAR(50) DEFAULT 'Bronze',
      total_reviews INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log('✅ Created clean users table with proper schema');
  } catch (error) {
    console.error('❌ Error creating clean table:', error);
  }
};

createCleanUsersTable();