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

<<<<<<< HEAD
// POST /api/auth/login
=======
>>>>>>> df3f53951ecad7805d52d9e5e5ed348ca4d74471
router.post("/login", login);

router.post("/verify-ucr-email", (req, res) => {
  res.json({ message: "UCR email verification - TODO" });
});

module.exports = router;
