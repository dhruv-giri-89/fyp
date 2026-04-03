const express = require("express");
const router = express.Router();
const {
    createParty,
    getAllParties,
    getPartyById,
    updateParty,
    deleteParty,
    uploadPartyLogo
} = require("../controllers/partyController");
const { authenticateAdmin } = require("../middleware/adminauthMiddleware");
const { upload } = require("../config/cloudinary");

// Public routes (no authentication required)
router.get("/", getAllParties);
router.get("/:id", getPartyById);

// Admin routes (authentication required)
router.post("/", authenticateAdmin, upload.single('logo'), createParty);
router.put("/:id", authenticateAdmin, upload.single('logo'), updateParty);
router.delete("/:id", authenticateAdmin, deleteParty);

// Logo upload route (separate endpoint)
router.post("/upload-logo", authenticateAdmin, upload.single('logo'), uploadPartyLogo);

module.exports = router;
