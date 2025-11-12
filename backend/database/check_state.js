const pool = require('./config');

async function checkCurrentState() {
    try {
        console.log('🔍 Checking current database state...');
        
        // Check if restaurants table exists
        const tableCheck = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'restaurants'
        `);
        
        if (tableCheck.rows.length > 0) {
            console.log('✅ Restaurants table already exists');
            
            // Check if there's any data
            const dataCheck = await pool.query('SELECT COUNT(*) as count FROM restaurants');
            console.log(`📊 Restaurants in database: ${dataCheck.rows[0].count}`);
            
            // Show a sample of restaurants
            const sample = await pool.query('SELECT name, latitude, longitude FROM restaurants LIMIT 3');
            console.log('🍕 Sample restaurants:');
            sample.rows.forEach(row => {
                console.log(`   - ${row.name} (${row.latitude}, ${row.longitude})`);
            });
        } else {
            console.log('❌ Restaurants table does not exist yet');
        }
        
    } catch (error) {
        console.error('Error checking database:', error);
    } finally {
        pool.end();
    }
}

checkCurrentState();