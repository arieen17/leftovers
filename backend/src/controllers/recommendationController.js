const { getRecommendations } = require("../algorithms/recommendations");

const getUserRecommendations = async (req, res) => {
  try {
    const userId = parseInt(req.query.user_id);
    const recommendations = await getRecommendations(userId);
    res.json({ user_id: userId, recommendations });
  } catch (error) {
    res.status(500).json({ error: "Failed to get recommendations" });
  }
};

module.exports = { getUserRecommendations };
