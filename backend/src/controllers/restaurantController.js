const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
};

const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
};

const getRestaurantMenu = async (req, res) => {
  try {
    const menuItems = await MenuItem.findByRestaurant(req.params.id);
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
};

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  getRestaurantMenu
};