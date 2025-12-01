const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const mapsRoutes = require("./routes/maps");

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to R'ATE Backend API! 🍽️",
    status: "✅ Server is running",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      restaurants: "/api/restaurants",
      reviews: "/api/reviews",
      menuItems: "/api/menu-items",
      recommendations: "/api/recommendations",
      maps: "/api/maps",
    },
    documentation: "See backend/README.MD for full API documentation",
  });
});

// Auth routes
app.use("/api/auth", require("./routes/auth"));
// Restaurant routes
app.use("/api/restaurants", require("./routes/restaurants"));

// Review routes
app.use("/api/reviews", require("./routes/reviews"));

// Menu item routes
app.use("/api/menu-items", require("./routes/menuItems"));

app.use("/api/recommendations", require("./routes/recommendations"));

app.use("/api/reviews", require("./routes/reviewInteractions"));

app.use("/api/reviews", require("./routes/reviewInteractions"));

// Maps routes
app.use("/api/maps", require("./routes/maps"));

// User routes
app.use("/api/users", require("./routes/user"));

app.get("/api/health", (req, res) => {
  res.json({
    status: "✅ Backend is running!",
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `${req.method} ${req.originalUrl} does not exist on this server`,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 R'ATE backend running on port ${PORT}`);
});
