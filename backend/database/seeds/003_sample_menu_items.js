const pool = require('../config');

const seedMenuItems = async () => {
  try {
    // Get the restaurant IDs we just created
    const restaurantResult = await pool.query('SELECT id FROM restaurants ORDER BY id');
    const restaurantIds = restaurantResult.rows.map(row => row.id);
    
    // Generic menu items for each restaurant
    const menuItems = [
      // Restaurant 1 - American
      {
        restaurant_id: restaurantIds[0],
        name: "Classic Burger",
        description: "Juicy beef patty with lettuce, tomato, and special sauce",
        price: 12.99,
        category: "Main Course",
        tags: ["beef", "popular"]
      },
      {
        restaurant_id: restaurantIds[0], 
        name: "Caesar Salad",
        description: "Fresh romaine lettuce with parmesan and croutons",
        price: 8.99,
        category: "Salads",
        tags: ["vegetarian", "healthy"]
      },
      {
        restaurant_id: restaurantIds[0],
        name: "Chocolate Milkshake", 
        description: "Creamy chocolate milkshake with whipped cream",
        price: 5.99,
        category: "Drinks",
        tags: ["dessert", "sweet"]
      },

      // Restaurant 2 - Italian
      {
        restaurant_id: restaurantIds[1],
        name: "Margherita Pizza",
        description: "Classic pizza with tomato sauce, mozzarella, and basil",
        price: 14.99,
        category: "Pizza",
        tags: ["vegetarian", "popular"]
      },
      {
        restaurant_id: restaurantIds[1],
        name: "Spaghetti Carbonara",
        description: "Pasta with creamy sauce, pancetta, and parmesan",
        price: 13.99,
        category: "Pasta", 
        tags: ["creamy", "favorite"]
      },
      {
        restaurant_id: restaurantIds[1],
        name: "Tiramisu",
        description: "Classic Italian coffee-flavored dessert",
        price: 7.99,
        category: "Desserts",
        tags: ["coffee", "sweet"]
      },

      // Restaurant 3 - Asian
      {
        restaurant_id: restaurantIds[2],
        name: "Chicken Teriyaki",
        description: "Grilled chicken with teriyaki sauce and rice",
        price: 11.99,
        category: "Main Course",
        tags: ["chicken", "popular"]
      },
      {
        restaurant_id: restaurantIds[2],
        name: "Vegetable Spring Rolls",
        description: "Crispy spring rolls with assorted vegetables",
        price: 6.99,
        category: "Appetizers",
        tags: ["vegetarian", "crispy"]
      },
      {
        restaurant_id: restaurantIds[2],
        name: "Green Tea Ice Cream",
        description: "Refreshing green tea flavored ice cream",
        price: 4.99,
        category: "Desserts",
        tags: ["sweet", "refreshing"]
      }
    ];

    for (const item of menuItems) {
      await pool.query(
        `INSERT INTO menu_items (restaurant_id, name, description, price, category, tags)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [item.restaurant_id, item.name, item.description, item.price, item.category, item.tags]
      );
    }
    console.log('✅ Added sample menu items');
  } catch (error) {
    console.error('❌ Error seeding menu items:', error);
  }
};

seedMenuItems();