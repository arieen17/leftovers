const express = require("express");
const { updateUser } = require("../controllers/userController");
const { authenticate } = require("../middleware/auth"); // If you have auth middleware

const router = express.Router();

// PUT /api/users/:id - Update user profile
router.put("/:id", updateUser); // Add authenticate middleware if needed

module.exports = router;