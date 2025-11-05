const pool = require('../config');

const addUserFields = async () => {
  const query = `
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS birthday DATE,
    ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
    ADD COLUMN IF NOT EXISTS address TEXT;
  `;

  try {
    await pool.query(query);
    console.log('✅ Added birthday, phone_number, and address fields to users table');
  } catch (error) {
    console.error('❌ Error adding user fields:', error);
  }
};

addUserFields();