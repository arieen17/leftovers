const express = require('express');
const { signup, login } = require('../controllers/authController');
const router = express.Router();
const pool = require('../../database/config');

// GET /api/auth/test
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working! 🎉' });
});

// POST /api/auth/signup
router.post('/signup', signup);

// Keep the other routes as placeholders for now
router.post('/login', login);


// Add this route for debugging
router.get('/debug-users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json({ users: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify-ucr-email', (req, res) => {
  res.json({ message: 'UCR email verification - TODO' });
});

module.exports = router;