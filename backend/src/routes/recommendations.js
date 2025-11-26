const express = require('express');
const router = express.Router();
const axios = require('axios');

const RECOMMENDATION_SERVICE = 'http://localhost:8000';

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = req.query.limit || 10;

    const response = await axios.post(`${RECOMMENDATION_SERVICE}/recommend`, {
      user_id: parseInt(userId),
      limit: parseInt(limit)
    });

    res.json(response.data);
  } catch (error) {
    console.error('Recommendation service error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get recommendations',
      details: error.message 
    });
  }
});

module.exports = router;