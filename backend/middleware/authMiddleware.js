const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    console.log("🔍 Auth middleware - checking token...");
    
    // 🔹 Get token from header
    const authHeader = req.headers.authorization;
    console.log("📋 Auth header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No token provided");
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("🎫 Token extracted:", token.substring(0, 20) + "...");

    // 🔹 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verified, user:", decoded);

    // 🔹 Attach user info to request
    req.user = decoded;

    next(); // proceed to next controller
  } catch (error) {
    console.log("❌ Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;