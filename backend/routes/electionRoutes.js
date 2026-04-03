const express = require("express");
const router = express.Router();
const {
    createElection,
    getAllElections,
    getElectionById,
    updateElection,
    deleteElection,
    getActiveElections,
    getUpcomingElections,
    getCompletedElections
} = require("../controllers/electionController");
const { authenticateAdmin } = require("../middleware/adminauthMiddleware");

// Public routes (no authentication required)
router.get("/", getAllElections);
router.get("/active", getActiveElections);
router.get("/upcoming", getUpcomingElections);
router.get("/completed", getCompletedElections);
router.get("/:id", getElectionById);

// Admin routes (authentication required)
router.post("/", authenticateAdmin, createElection);
router.put("/:id", authenticateAdmin, updateElection);
router.delete("/:id", authenticateAdmin, deleteElection);

module.exports = router;
