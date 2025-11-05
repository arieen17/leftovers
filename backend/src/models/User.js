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
  // Use userData.password directly (already hashed in controller)
  const result = await pool.query(
    `INSERT INTO users (email, password, name, birthday, phone_number, address) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING id, email, name, tier, birthday, phone_number, address, created_at`,
    [
      userData.email, 
      userData.password,  // ← Use the already-hashed password from controller
      userData.name, 
      userData.birthday, 
      userData.phone_number, 
      userData.address
    ]
  );
  
  return result.rows[0];
}

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;