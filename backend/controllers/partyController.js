const prisma = require("../config/prisma");
const { uploadToCloudinary } = require("../config/cloudinary");

// CREATE PARTY
exports.createParty = async (req, res) => {
    try {
        const { name, description } = req.body;
        let logoUrl = null;

        console.log("🔍 Party Creation Debug:");
        console.log("- Request body:", { name, description });
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
                console.warn("⚠️ Cloudinary not configured. Creating party without logo.");
                logoUrl = null;
            } else {
                try {
                    console.log("☁️ Attempting Cloudinary upload...");
                    const uploadResult = await uploadToCloudinary(req.file);
                    logoUrl = uploadResult.secure_url;
                    console.log("✅ Logo uploaded to Cloudinary:", logoUrl);
                } catch (uploadError) {
                    console.error("❌ Error uploading to Cloudinary:", uploadError);
                    console.error("Upload error details:", JSON.stringify(uploadError, null, 2));
                    // Continue without logo instead of failing
                    console.warn("⚠️ Continuing without logo due to upload error");
                    logoUrl = null;
                }
            }
        } else {
            console.log("📷 No file uploaded");
        }

        // Basic validation
        if (!name) {
            return res.status(400).json({ message: "Party name is required" });
        }

        // Check if party already exists
        const existingParty = await prisma.party.findUnique({
            where: { name }
        });

        if (existingParty) {
            return res.status(400).json({ message: "Party with this name already exists" });
        }

        // Create party
        console.log("💾 Creating party with logoUrl:", logoUrl);
        const party = await prisma.party.create({
            data: {
                name,
                description: description || null,
                logoUrl: logoUrl || null
            },
            include: {
                candidates: {
                    include: {
                        election: true
                    }
                },
                _count: {
                    select: {
                        candidates: true
                    }
                }
            }
        });

        console.log("✅ Party created successfully:", party.name);
        
        const message = logoUrl ? 
            "Party created successfully with logo" : 
            "Party created successfully (without logo)";
        
        res.status(201).json({
            message,
            party
        });

    } catch (err) {
        console.error("❌ Error creating party:", err);
        res.status(500).json({ message: "Error creating party: " + err.message });
    }
};

// GET ALL PARTIES
exports.getAllParties = async (req, res) => {
    try {
        const parties = await prisma.party.findMany({
            include: {
                candidates: {
                    include: {
                        election: true
                    }
                },
                _count: {
                    select: {
                        candidates: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({ parties });

    } catch (err) {
        console.error("Error fetching parties:", err);
        res.status(500).json({ message: "Error fetching parties" });
    }
};

// GET PARTY BY ID
exports.getPartyById = async (req, res) => {
    try {
        const { id } = req.params;

        const party = await prisma.party.findUnique({
            where: { id: parseInt(id) },
            include: {
                candidates: {
                    include: {
                        election: true
                    },
                    orderBy: {
                        votes: 'desc'
                    }
                },
                _count: {
                    select: {
                        candidates: true
                    }
                }
            }
        });

        if (!party) {
            return res.status(404).json({ message: "Party not found" });
        }

        res.json({ party });

    } catch (err) {
        console.error("Error fetching party:", err);
        res.status(500).json({ message: "Error fetching party" });
    }
};

// UPDATE PARTY
exports.updateParty = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        let logoUrl = req.file ? req.file.path : undefined;

        // Check if party exists
        const existingParty = await prisma.party.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingParty) {
            return res.status(404).json({ message: "Party not found" });
        }

        // Check if new name conflicts with existing party
        if (name && name !== existingParty.name) {
            const nameConflict = await prisma.party.findUnique({
                where: { name }
            });

            if (nameConflict) {
                return res.status(400).json({ message: "Party with this name already exists" });
            }
        }

        // Prepare update data
        const updateData = {};
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (logoUrl !== undefined) updateData.logoUrl = logoUrl;

        // Update party
        const party = await prisma.party.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                candidates: {
                    include: {
                        election: true
                    }
                },
                _count: {
                    select: {
                        candidates: true
                    }
                }
            }
        });

        res.json({
            message: "Party updated successfully",
            party
        });

    } catch (err) {
        console.error("Error updating party:", err);
        res.status(500).json({ message: "Error updating party" });
    }
};

// DELETE PARTY
exports.deleteParty = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if party exists
        const existingParty = await prisma.party.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: {
                    select: {
                        candidates: true
                    }
                }
            }
        });

        if (!existingParty) {
            return res.status(404).json({ message: "Party not found" });
        }

        // Check if party has candidates
        if (existingParty._count.candidates > 0) {
            return res.status(400).json({ 
                message: "Cannot delete party with candidates. Please remove all candidates first." 
            });
        }

        // Delete party
        await prisma.party.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: "Party deleted successfully" });

    } catch (err) {
        console.error("Error deleting party:", err);
        res.status(500).json({ message: "Error deleting party" });
    }
};

// UPLOAD PARTY LOGO
exports.uploadPartyLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        res.json({
            message: "Logo uploaded successfully",
            logoUrl: req.file.path
        });

    } catch (err) {
        console.error("Error uploading logo:", err);
        res.status(500).json({ message: "Error uploading logo" });
    }
};
