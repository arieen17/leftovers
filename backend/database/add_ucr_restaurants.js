const pool = require('./config');

async function addUCRRestaurants() {
    const ucrRestaurants = [
        {
            name: "The Habit Burger Grill",
            address: "900 University Ave, Riverside, CA 92507",
            latitude: 33.9737,
            longitude: -117.3281,
            cuisine_type: "American"
        },
        {
            name: "Subway", 
            address: "1201 University Ave, Riverside, CA 92507",
            latitude: 33.9740,
            longitude: -117.3275,
            cuisine_type: "Sandwiches"
        },
        {
            name: "Starbucks",
            address: "1101 University Ave, Riverside, CA 92507", 
            latitude: 33.9735,
            longitude: -117.3285,
            cuisine_type: "Coffee"
        },
        {
            name: "Panda Express",
            address: "1150 University Ave, Riverside, CA 92507",
            latitude: 33.9739,
            longitude: -117.3278,
            cuisine_type: "Chinese"
        },
        {
            name: "Glasgow Dining Hall",
            address: "900 University Ave, Riverside, CA 92507",
            latitude: 33.9742,
            longitude: -117.3268,
            cuisine_type: "Cafeteria"
        }
    ];

    console.log('🍕 Adding UCR restaurants to database...');
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const restaurant of ucrRestaurants) {
        try {
            // Check if restaurant already exists
            const existing = await pool.query(
                'SELECT id FROM restaurants WHERE name = $1', 
                [restaurant.name]
            );
            
            if (existing.rows.length === 0) {
                // Restaurant doesn't exist, add it
                await pool.query(
                    `INSERT INTO restaurants (name, address, latitude, longitude, cuisine_type) 
                     VALUES ($1, $2, $3, $4, $5)`,
                    [restaurant.name, restaurant.address, restaurant.latitude, 
                     restaurant.longitude, restaurant.cuisine_type]
                );
                console.log(`✅ Added: ${restaurant.name}`);
                addedCount++;
            } else {
                console.log(`⚠️  Already exists: ${restaurant.name}`);
                skippedCount++;
            }
        } catch (error) {
            console.log(`❌ Error adding ${restaurant.name}:`, error.message);
        }
    }
    
    console.log(`🎉 Added ${addedCount} new restaurants, ${skippedCount} already existed`);
    pool.end();
}

addUCRRestaurants();