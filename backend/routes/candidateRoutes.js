const express = require("express");
const router = express.Router();
const {
    createCandidate,
    getAllCandidates,
    getCandidateById,
    updateCandidate,
    deleteCandidate,
    getCandidatesByElection,
    getCandidatesByParty
} = require("../controllers/candidateController");
const { authenticateAdmin } = require("../middleware/adminauthMiddleware");
const { upload } = require("../config/cloudinary");

// Public routes (no authentication required)
router.get("/", getAllCandidates);
router.get("/:id", getCandidateById);
router.get("/election/:electionId", getCandidatesByElection);
router.get("/party/:partyId", getCandidatesByParty);

// Admin routes (authentication required)
router.post("/", authenticateAdmin, upload.single('image'), createCandidate);
router.put("/:id", authenticateAdmin, upload.single('image'), updateCandidate);
router.delete("/:id", authenticateAdmin, deleteCandidate);

module.exports = router;
