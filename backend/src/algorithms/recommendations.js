const getRecommendations = async (userId) => {
  const userRecommendations = {
    1: [1, 4, 7, 3, 9],
    2: [2, 8, 9, 2, 8],  
    3: [1, 4, 7, 6, 8]
  };

  const defaultRecs = [1, 4, 2, 3, 7];
  const itemIds = userRecommendations[userId] || defaultRecs;
  
  return itemIds.map((id, index) => ({
    menu_item_id: id,
    score: (5 - index) * 0.2
  }));
};

module.exports = { getRecommendations };