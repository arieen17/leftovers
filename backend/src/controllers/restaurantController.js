const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");

const getAllRestaurants = async (req, res) => {
  try {
    console.log("🍽️ GET /api/restaurants - Fetching all restaurants...");
    const restaurants = await Restaurant.findAll();
    console.log(`✅ Found ${restaurants?.length || 0} restaurants`);
    if (restaurants?.length > 0) {
      console.log(
        "   Restaurant names:",
        restaurants.map((r) => r.name),
      );
    } else {
      console.log("⚠️  No restaurants found in database");
    }
    res.json(restaurants);
  } catch (error) {
    console.error("❌ Error fetching restaurants:", error);
    console.error("   Error message:", error.message);
    console.error("   Error stack:", error.stack);
    res
      .status(500)
      .json({ error: "Failed to fetch restaurants", details: error.message });
  }
};

const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch restaurant" });
  }
};

const getRestaurantMenu = async (req, res) => {
  try {
    // Use Restaurant.getMenuWithRatings() instead of MenuItem.findByRestaurant()
    const menuItems = await Restaurant.getMenuWithRatings(req.params.id);
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch menu" });
  }
};

const createRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ error: "Failed to create restaurant" });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.update(req.params.id, req.body);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: "Failed to update restaurant" });
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.delete(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    res.json({ message: "Restaurant deleted successfully", restaurant });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete restaurant" });
  }
};

const searchRestaurantsAndItems = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") {
      return res.json({ restaurants: [], menuItems: [] });
    }

    const restaurants = await Restaurant.search(q);
    const menuItems = await MenuItem.search(q);

    res.json({ restaurants, menuItems });
  } catch (error) {
    console.error("❌ Error searching:", error);
    res.status(500).json({ error: "Failed to search", details: error.message });
  }
};

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  searchRestaurantsAndItems,
};
