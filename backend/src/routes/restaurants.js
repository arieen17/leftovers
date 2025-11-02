const express = require('express');
const {
  getAllRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
} = require('../controllers/restaurantController');
const pool = require('../../database/config'); 

const router = express.Router();

// GET /api/restaurants
router.get('/', getAllRestaurants);

// GET /api/restaurants/:id
router.get('/:id', getRestaurantById);

// GET /api/restaurants/:id/menu
router.get('/:id/menu', getRestaurantMenu);

// POST /api/restaurants - Create new restaurant
router.post('/', createRestaurant);

// PUT /api/restaurants/:id - Update restaurant
router.put('/:id', updateRestaurant);

// DELETE /api/restaurants/:id - Delete restaurant
router.delete('/:id', deleteRestaurant);

module.exports = router;