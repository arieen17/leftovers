const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes
app.use('/api/auth', require('./routes/auth'));
// Restaurant routes
app.use('/api/restaurants', require('./routes/restaurants'));
// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: '✅ Backend is running!', 
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 R'ATE backend running on port ${PORT}`);
});