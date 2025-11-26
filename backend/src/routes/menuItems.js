const express = require("express");
const {
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItemRating,
  getPopularMenuItems,
} = require("../controllers/menuItemController");

const router = express.Router();

// GET /api/menu-items/popular - Get popular menu items across all restaurants
router.get("/popular", getPopularMenuItems);

// GET /api/menu-items/:id - Get specific menu item with ratings
router.get("/:id", getMenuItemById);

// POST /api/menu-items - Create new menu item
router.post("/", createMenuItem);

// PUT /api/menu-items/:id - Update menu item
router.put("/:id", updateMenuItem);

// DELETE /api/menu-items/:id - Delete menu item
router.delete("/:id", deleteMenuItem);

// GET /api/menu-items/:id/rating - Get rating stats for menu item
router.get("/:id/rating", getMenuItemRating);

module.exports = router;