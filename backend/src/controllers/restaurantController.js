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
    // Use Restaurant.getMenuWithRatings() instead of MenuItem.findByRestaurant()
    const menuItems = await Restaurant.getMenuWithRatings(req.params.id);
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
};

const createRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create restaurant' });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.update(req.params.id, req.body);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update restaurant' });
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.delete(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json({ message: 'Restaurant deleted successfully', restaurant });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete restaurant' });
  }
};

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
};