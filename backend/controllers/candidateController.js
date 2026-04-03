const prisma = require("../config/prisma");
const { uploadToCloudinary } = require("../config/cloudinary");

// CREATE CANDIDATE
exports.createCandidate = async (req, res) => {
    try {
        const { name, age, bio, partyId, electionId } = req.body;
        let imageUrl = null;

        console.log("🔍 Candidate Creation Debug:");
        console.log("- Request body:", { name, age, bio, partyId, electionId });
        console.log("- File present:", !!req.file);
        console.log("- File details:", req.file ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            buffer: req.file.buffer ? `Buffer (${req.file.buffer.length} bytes)` : 'No buffer'
        } : 'No file');

        // Handle file upload
        if (req.file) {
            console.log("📁 File detected, attempting upload...");
            
            // Check if Cloudinary is configured
            if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
                console.warn("⚠️ Cloudinary not configured. Creating candidate without image.");
                imageUrl = null;
            } else {
                try {
                    console.log("☁️ Attempting Cloudinary upload...");
                    const uploadResult = await uploadToCloudinary(req.file);
                    imageUrl = uploadResult.secure_url;
                    console.log("✅ Image uploaded to Cloudinary:", imageUrl);
                } catch (uploadError) {
                    console.error("❌ Error uploading to Cloudinary:", uploadError);
                    console.error("Upload error details:", JSON.stringify(uploadError, null, 2));
                    // Continue without image instead of failing
                    console.warn("⚠️ Continuing without image due to upload error");
                    imageUrl = null;
                }
            }
        } else {
            console.log("📷 No file uploaded");
        }

        // Basic validation
        if (!name || !partyId || !electionId) {
            return res.status(400).json({ 
                message: "Name, party ID, and election ID are required" 
            });
        }

        // Validate party exists
        const party = await prisma.party.findUnique({
            where: { id: parseInt(partyId) }
        });

        if (!party) {
            return res.status(400).json({ message: "Party not found" });
        }

        // Validate election exists
        const election = await prisma.election.findUnique({
            where: { id: parseInt(electionId) }
        });

        if (!election) {
            return res.status(400).json({ message: "Election not found" });
        }

        // Validate age if provided
        if (age && (age < 18 || age > 100)) {
            return res.status(400).json({ 
                message: "Age must be between 18 and 100" 
            });
        }

        // Create candidate
        console.log("💾 Creating candidate with imageUrl:", imageUrl);
        const candidate = await prisma.candidate.create({
            data: {
                name,
                age: age ? parseInt(age) : null,
                bio: bio || null,
                imageUrl: imageUrl || null,
                partyId: parseInt(partyId),
                electionId: parseInt(electionId)
            },
            include: {
                party: {
                    select: {
                        id: true,
                        name: true,
                        logoUrl: true
                    }
                },
                election: {
                    select: {
                        id: true,
                        title: true,
                        startTime: true,
                        endTime: true
                    }
                }
            }
        });

        console.log("✅ Candidate created successfully:", candidate.name);
        
        const message = imageUrl ? 
            "Candidate created successfully with image" : 
            "Candidate created successfully (without image)";
        
        res.status(201).json({
            message,
            candidate
        });

    } catch (err) {
        console.error("❌ Error creating candidate:", err);
        res.status(500).json({ message: "Error creating candidate: " + err.message });
    }
};

// GET ALL CANDIDATES
exports.getAllCandidates = async (req, res) => {
    try {
        const { electionId, partyId } = req.query;
        
        const whereClause = {};
        if (electionId) whereClause.electionId = parseInt(electionId);
        if (partyId) whereClause.partyId = parseInt(partyId);
        
        const candidates = await prisma.candidate.findMany({
            where: whereClause,
            include: {
                party: {
                    select: {
                        id: true,
                        name: true,
                        logoUrl: true
                    }
                },
                election: {
                    select: {
                        id: true,
                        title: true,
                        startTime: true,
                        endTime: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({ candidates });

    } catch (err) {
        console.error("Error fetching candidates:", err);
        res.status(500).json({ message: "Error fetching candidates" });
    }
};

// GET CANDIDATE BY ID
exports.getCandidateById = async (req, res) => {
    try {
        const { id } = req.params;

        const candidate = await prisma.candidate.findUnique({
            where: { id: parseInt(id) },
            include: {
                party: {
                    select: {
                        id: true,
                        name: true,
                        logoUrl: true,
                        description: true
                    }
                },
                election: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        startTime: true,
                        endTime: true
                    }
                }
            }
        });

        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        res.json({ candidate });

    } catch (err) {
        console.error("Error fetching candidate:", err);
        res.status(500).json({ message: "Error fetching candidate" });
    }
};

// UPDATE CANDIDATE
exports.updateCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, age, bio, partyId, electionId } = req.body;
        let imageUrl = req.file ? undefined : undefined;

        // Check if candidate exists
        const existingCandidate = await prisma.candidate.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingCandidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        // Handle file upload if new image provided
        if (req.file) {
            // Check if Cloudinary is configured
            if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
                console.warn("⚠️ Cloudinary not configured. Skipping image upload.");
                imageUrl = null;
            } else {
                try {
                    console.log("☁️ Attempting Cloudinary upload for updated candidate...");
                    const uploadResult = await uploadToCloudinary(req.file);
                    imageUrl = uploadResult.secure_url;
                    console.log("✅ Image uploaded to Cloudinary:", imageUrl);
                } catch (uploadError) {
                    console.error("❌ Error uploading to Cloudinary:", uploadError);
                    // Keep existing image instead of failing
                    console.warn("⚠️ Keeping existing image due to upload error");
                    imageUrl = existingCandidate.imageUrl;
                }
            }
        }

        // Validate party if provided
        if (partyId) {
            const party = await prisma.party.findUnique({
                where: { id: parseInt(partyId) }
            });

            if (!party) {
                return res.status(400).json({ message: "Party not found" });
            }
        }

        // Validate election if provided
        if (electionId) {
            const election = await prisma.election.findUnique({
                where: { id: parseInt(electionId) }
            });

            if (!election) {
                return res.status(400).json({ message: "Election not found" });
            }
        }

        // Validate age if provided
        if (age && (age < 18 || age > 100)) {
            return res.status(400).json({ 
                message: "Age must be between 18 and 100" 
            });
        }

        // Prepare update data
        const updateData = {};
        if (name) updateData.name = name;
        if (age !== undefined) updateData.age = parseInt(age);
        if (bio !== undefined) updateData.bio = bio;
        if (partyId !== undefined) updateData.partyId = parseInt(partyId);
        if (electionId !== undefined) updateData.electionId = parseInt(electionId);
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

        // Update candidate
        const candidate = await prisma.candidate.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                party: {
                    select: {
                        id: true,
                        name: true,
                        logoUrl: true
                    }
                },
                election: {
                    select: {
                        id: true,
                        title: true,
                        startTime: true,
                        endTime: true
                    }
                }
            }
        });

        res.json({
            message: "Candidate updated successfully",
            candidate
        });

    } catch (err) {
        console.error("Error updating candidate:", err);
        res.status(500).json({ message: "Error updating candidate" });
    }
};

// DELETE CANDIDATE
exports.deleteCandidate = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if candidate exists
        const existingCandidate = await prisma.candidate.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingCandidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        // Delete candidate
        await prisma.candidate.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: "Candidate deleted successfully" });

    } catch (err) {
        console.error("Error deleting candidate:", err);
        res.status(500).json({ message: "Error deleting candidate" });
    }
};

// GET CANDIDATES BY ELECTION
exports.getCandidatesByElection = async (req, res) => {
    try {
        const { electionId } = req.params;

        const candidates = await prisma.candidate.findMany({
            where: { electionId: parseInt(electionId) },
            include: {
                party: {
                    select: {
                        id: true,
                        name: true,
                        logoUrl: true
                    }
                }
            },
            orderBy: {
                votes: 'desc'
            }
        });

        res.json({ candidates });

    } catch (err) {
        console.error("Error fetching candidates by election:", err);
        res.status(500).json({ message: "Error fetching candidates by election" });
    }
};

// GET CANDIDATES BY PARTY
exports.getCandidatesByParty = async (req, res) => {
    try {
        const { partyId } = req.params;

        const candidates = await prisma.candidate.findMany({
            where: { partyId: parseInt(partyId) },
            include: {
                election: {
                    select: {
                        id: true,
                        title: true,
                        startTime: true,
                        endTime: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({ candidates });

    } catch (err) {
        console.error("Error fetching candidates by party:", err);
        res.status(500).json({ message: "Error fetching candidates by party" });
    }
};
