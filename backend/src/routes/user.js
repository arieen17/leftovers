const express = require("express");
const { updateUser } = require("../controllers/userController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "User routes are working!" });
});

router.put("/:id", authenticate, updateUser);

module.exports = router;
