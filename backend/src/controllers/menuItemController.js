const MenuItem = require('../models/MenuItem');

const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.create(req.body);
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create menu item' });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.update(req.params.id, req.body);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update menu item' });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.delete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully', menuItem });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};

const getMenuItemRating = async (req, res) => {
  try {
    const ratingStats = await MenuItem.getAverageRating(req.params.id);
    res.json(ratingStats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu item rating' });
  }
};

module.exports = {
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItemRating
};