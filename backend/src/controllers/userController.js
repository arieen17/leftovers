const User = require("../models/User");

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, birthday, phone_number, address } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const updateData = {
      name,
      email,
      birthday: birthday || null,
      phone_number: phone_number || null,
      address: address || null,
    };

    const updatedUser = await User.update(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user profile" });
  }
};
const getUserStats = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.getUserProfile(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({
      xp: user.xp || 0,
      likes_received: user.likes_received || 0
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
};
module.exports = {
  updateUser,
  getUserStats,
};
