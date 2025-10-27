const express = require('express');
const router = express.Router();


router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working! 🎉' });
});


// POST /api/auth/signup
router.post('/signup', (req, res) => {
  res.json({ message: 'Signup endpoint - TODO' });
});

// POST /api/auth/login  
router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint - TODO' });
});

// POST /api/auth/verify-ucr-email
router.post('/verify-ucr-email', (req, res) => {
  res.json({ message: 'UCR email verification - TODO' });
});

module.exports = router;