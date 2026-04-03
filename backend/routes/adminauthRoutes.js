const express = require("express");
const router = express.Router();
const { adminLogin, createAdmin, getAdminProfile } = require("../controllers/adminauthController");
const { authenticateAdmin } = require("../middleware/adminauthMiddleware");

// POST /api/admin/login - Admin login
router.post("/login", adminLogin);

// POST /api/admin/create - Create admin (for initial setup)
router.post("/create", createAdmin);

// GET /api/admin/profile - Get admin profile (protected)
router.get("/profile", authenticateAdmin, getAdminProfile);

module.exports = router;