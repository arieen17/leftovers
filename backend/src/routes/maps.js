const express = require('express');
const router = express.Router();
const pool = require('../../database/config');

// GET /api/maps/restaurants
router.get('/restaurants', async (req, res) => {
    try {
        console.log('📍 Fetching all restaurants for maps...');
        
        // Simple query - just get all restaurants with coordinates
        const result = await pool.query(`
            SELECT 
                id, name, address, latitude, longitude, 
                cuisine_type
            FROM restaurants 
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL
            ORDER BY name
        `);
        
        console.log(`✅ Found ${result.rows.length} restaurants for maps`);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching restaurants for maps:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
    }
});

module.exports = router;