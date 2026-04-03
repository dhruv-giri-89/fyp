const express = require("express");
const router = express.Router();
const {
    getActiveElections,
    getVotingHistory,
    getVoterProfile,
    castVote,
    getElectionDetails
} = require("../controllers/voterController");
const authMiddleware = require("../middleware/authMiddleware");

// Apply user authentication to all voter routes
router.use(authMiddleware);

// GET voter profile
router.get("/profile", getVoterProfile);

// GET active elections
router.get("/elections/active", getActiveElections);

// GET voting history
router.get("/history", getVotingHistory);

// GET election details for voting
router.get("/elections/:electionId", getElectionDetails);

// POST cast vote
router.post("/vote", castVote);

module.exports = router;
