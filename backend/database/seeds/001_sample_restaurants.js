const pool = require('../config');

const seedSampleData = async () => {
  // Sample UCR-area restaurants
  const restaurants = [
    {
      name: "The Getaway Cafe",
      address: "1240 W. University Ave, Riverside, CA 92507",
      latitude: 33.9756,
      longitude: -117.3289,
      cuisine_type: "American",
      hours: { 
        monday: "7:00 AM - 9:00 PM", 
        tuesday: "7:00 AM - 9:00 PM",
        wednesday: "7:00 AM - 9:00 PM",
        thursday: "7:00 AM - 9:00 PM", 
        friday: "7:00 AM - 10:00 PM",
        saturday: "8:00 AM - 10:00 PM",
        sunday: "8:00 AM - 8:00 PM"
      },
      image_url: "https://example.com/getaway.jpg"
    },
    {
      name: "Subway",
      address: "900 University Ave, Riverside, CA 92507",
      latitude: 33.9738,
      longitude: -117.3281,
      cuisine_type: "Sandwiches",
      hours: {
        monday: "8:00 AM - 10:00 PM",
        tuesday: "8:00 AM - 10:00 PM", 
        wednesday: "8:00 AM - 10:00 PM",
        thursday: "8:00 AM - 10:00 PM",
        friday: "8:00 AM - 11:00 PM",
        saturday: "9:00 AM - 11:00 PM", 
        sunday: "10:00 AM - 9:00 PM"
      },
      image_url: "https://example.com/subway.jpg"
    },
    {
      name: "Starbucks",
      address: "1100 University Ave, Riverside, CA 92507", 
      latitude: 33.9742,
      longitude: -117.3275,
      cuisine_type: "Coffee",
      hours: {
        monday: "5:30 AM - 9:00 PM",
        tuesday: "5:30 AM - 9:00 PM",
        wednesday: "5:30 AM - 9:00 PM", 
        thursday: "5:30 AM - 9:00 PM",
        friday: "5:30 AM - 9:00 PM",
        saturday: "6:00 AM - 9:00 PM",
        sunday: "6:00 AM - 8:00 PM"
      },
      image_url: "https://example.com/starbucks.jpg"
    }
  ];

  try {
    for (const restaurant of restaurants) {
      await pool.query(
        `INSERT INTO restaurants (name, address, latitude, longitude, cuisine_type, hours, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [restaurant.name, restaurant.address, restaurant.latitude, restaurant.longitude,
         restaurant.cuisine_type, restaurant.hours, restaurant.image_url]
      );
    }
    console.log('✅ Sample restaurants added');
  } catch (error) {
    console.error('❌ Error seeding restaurants:', error);
  }
};

seedSampleData();