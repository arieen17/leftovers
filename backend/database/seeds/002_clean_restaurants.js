const pool = require('../config');

const cleanAndReseed = async () => {
  try {
    // Delete all existing restaurants (cascade will delete menu items too)
    await pool.query('DELETE FROM restaurants');
    console.log('✅ Cleared existing restaurant data');
    
    // Add generic examples
    const genericRestaurants = [
      {
        name: "Example Restaurant 1",
        address: "123 University Drive, Riverside, CA 92507",
        latitude: 33.9750,
        longitude: -117.3290,
        cuisine_type: "American",
        hours: { 
          monday: "8:00 AM - 9:00 PM", 
          tuesday: "8:00 AM - 9:00 PM",
          wednesday: "8:00 AM - 9:00 PM",
          thursday: "8:00 AM - 9:00 PM", 
          friday: "8:00 AM - 10:00 PM",
          saturday: "9:00 AM - 10:00 PM",
          sunday: "9:00 AM - 8:00 PM"
        },
        image_url: ""
      },
      {
        name: "Example Restaurant 2", 
        address: "456 Campus Lane, Riverside, CA 92507",
        latitude: 33.9740,
        longitude: -117.3280,
        cuisine_type: "Italian",
        hours: {
          monday: "11:00 AM - 9:00 PM",
          tuesday: "11:00 AM - 9:00 PM",
          wednesday: "11:00 AM - 9:00 PM",
          thursday: "11:00 AM - 9:00 PM",
          friday: "11:00 AM - 10:00 PM",
          saturday: "12:00 PM - 10:00 PM",
          sunday: "12:00 PM - 8:00 PM"
        },
        image_url: ""
      },
      {
        name: "Example Restaurant 3",
        address: "789 College Avenue, Riverside, CA 92507",
        latitude: 33.9735,
        longitude: -117.3270,
        cuisine_type: "Asian",
        hours: {
          monday: "10:00 AM - 8:00 PM",
          tuesday: "10:00 AM - 8:00 PM",
          wednesday: "10:00 AM - 8:00 PM",
          thursday: "10:00 AM - 8:00 PM",
          friday: "10:00 AM - 9:00 PM",
          saturday: "11:00 AM - 9:00 PM",
          sunday: "Closed"
        },
        image_url: ""
      }
    ];

    for (const restaurant of genericRestaurants) {
      await pool.query(
        `INSERT INTO restaurants (name, address, latitude, longitude, cuisine_type, hours, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [restaurant.name, restaurant.address, restaurant.latitude, restaurant.longitude,
         restaurant.cuisine_type, restaurant.hours, restaurant.image_url]
      );
    }
    console.log('✅ Added generic restaurant examples');
  } catch (error) {
    console.error('❌ Error cleaning and reseeding:', error);
  }
};

cleanAndReseed();