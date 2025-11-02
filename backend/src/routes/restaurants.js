const express = require('express');
const {
  getAllRestaurants,
  getRestaurantById,
  getRestaurantMenu
} = require('../controllers/restaurantController');
const pool = require('../../database/config');

const router = express.Router();

// GET /api/restaurants
router.get('/', getAllRestaurants);

// GET /api/restaurants/:id
router.get('/:id', getRestaurantById);

// GET /api/restaurants/:id/menu
router.get('/:id/menu', getRestaurantMenu);

router.get('/debug/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM restaurants ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;