const { Pool } = require('pg');

const pool = new Pool({
    host: 'rateapp.c98oqscikd1q.us-east-2.rds.amazonaws.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres', 
    password: 'RateApp2024!',
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
});

async function testConnection() {
    console.log('🔄 Attempting SSL connection to:', pool.options.host);
    
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time');
        console.log('✅ Database connected successfully!');
        console.log('Current time:', result.rows[0].current_time);
        client.release();
    } catch (error) {
        console.error('❌ Connection failed:');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
    } finally {
        await pool.end();
    }
}

testConnection();