const express = require("express");
const { signup, login } = require("../controllers/authController");
const router = express.Router();
const pool = require("../../database/config");

// GET /api/auth/test
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working! 🎉" });
});

// POST /api/auth/signup
router.post("/signup", signup);

// Keep the other routes as placeholders for now
router.post("/login", login);

router.post("/verify-ucr-email", (req, res) => {
  res.json({ message: "UCR email verification - TODO" });
});

module.exports = router;
