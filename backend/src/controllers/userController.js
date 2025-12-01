const User = require("../models/User");

const updateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const authenticatedUserId = req.userId;
    const { name, birthday, phone_number, address } = req.body;

    if (userId !== authenticatedUserId) {
      return res
        .status(403)
        .json({ error: "You can only update your own profile" });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const updateData = {
      name: name.trim(),
      birthday: birthday || null,
      phone_number: phone_number || null,
      address: address || null,
    };

    const updatedUser = await User.update(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      ...updatedUser,
      email: existingUser.email,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user profile" });
  }
};

module.exports = {
  updateUser,
};
