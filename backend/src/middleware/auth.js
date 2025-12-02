const { verifyToken } = require("../utils/jwt");

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    console.log("🔐 Auth header received:", authHeader ? "Present" : "Missing");

    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      console.log("❌ No token provided in Authorization header");
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    console.log("🔑 Token received:", token.substring(0, 20) + "...");
    const decoded = verifyToken(token);
    console.log("✅ Token verified successfully, userId:", decoded.userId);
    req.user = decoded; // This should set req.user with userId
    next();
  } catch (error) {
    console.error("❌ Authentication error:", error.message);
    res.status(401).json({ error: "Invalid token", message: error.message });
  }
};

module.exports = { authenticate };
