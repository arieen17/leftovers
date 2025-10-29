const pool = require('../../database/config');
const bcrypt = require('bcryptjs');

class User {
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const result = await pool.query(
      `INSERT INTO users (email, password, name, tier) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name, tier, created_at`,
      [userData.email, hashedPassword, userData.name, 'Bronze']
    );
    
    return result.rows[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;