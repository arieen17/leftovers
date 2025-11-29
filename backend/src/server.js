const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const mapsRoutes = require("./routes/maps");

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes
app.use("/api/auth", require("./routes/auth"));
// Restaurant routes
app.use("/api/restaurants", require("./routes/restaurants"));

// Review routes
app.use("/api/reviews", require("./routes/reviews"));

// Menu item routes
app.use("/api/menu-items", require("./routes/menuItems"));

app.use('/api/recommendations', require('./routes/recommendations'));

app.use("/api/reviews", require("./routes/reviewInteractions"));


// Maps routes
app.use("/api/maps", require("./routes/maps"));

app.get("/api/health", (req, res) => {
  res.json({
    status: "✅ Backend is running!",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 R'ATE backend running on port ${PORT}`);
  console.log(`📡 Listening on all network interfaces (0.0.0.0)`);
});
