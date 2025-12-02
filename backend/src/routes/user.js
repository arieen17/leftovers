const express = require("express");
const { authenticate } = require("../middleware/auth");
const { updateUser, getUserStats } = require("../controllers/userController"); 

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "User routes are working!" });
});
router.get("/:id/stats", getUserStats); 
// PUT /api/users/:id - Update user profile
router.put("/:id", authenticate, updateUser);

module.exports = router;
