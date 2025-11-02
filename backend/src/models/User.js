const pool = require('../../database/config');
const bcrypt = require('bcryptjs');

class User {
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0]; // Return undefined if no user found
  }

  static async create(userData) {
  // Remove bcrypt.hash from here - controller already hashed it!
  const result = await pool.query(
    `INSERT INTO users (email, password, name) 
     VALUES ($1, $2, $3) 
     RETURNING id, email, name, tier, created_at, password`,
    [userData.email, userData.password, userData.name] // Use the already-hashed password
  );
  
  return result.rows[0];
}

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;