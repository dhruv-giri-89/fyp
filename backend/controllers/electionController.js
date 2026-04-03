const prisma = require("../config/prisma");

// CREATE ELECTION
exports.createElection = async (req, res) => {
    try {
        const { title, description, startTime, endTime } = req.body;

        // Basic validation
        if (!title || !startTime || !endTime) {
            return res.status(400).json({ message: "Title, start time, and end time are required" });
        }

        // Convert to Date objects
        const start = new Date(startTime);
        const end = new Date(endTime);

        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        if (start >= end) {
            return res.status(400).json({ message: "Start time must be before end time" });
        }

        // Create election
        const election = await prisma.election.create({
            data: {
                title,
                description: description || null,
                startTime: start,
                endTime: end
            },
            include: {
                candidates: {
                    include: {
                        party: true
                    }
                }
            }
        });

        res.status(201).json({
            message: "Election created successfully",
            election
        });

    } catch (err) {
        console.error("Error creating election:", err);
        res.status(500).json({ message: "Error creating election" });
    }
};

// GET ALL ELECTIONS
exports.getAllElections = async (req, res) => {
    try {
        const elections = await prisma.election.findMany({
            include: {
                candidates: {
                    include: {
                        party: true
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

        res.json({ elections });

    } catch (err) {
        console.error("Error fetching elections:", err);
        res.status(500).json({ message: "Error fetching elections" });
    }
};

// GET ELECTION BY ID
exports.getElectionById = async (req, res) => {
    try {
        const { id } = req.params;

        const election = await prisma.election.findUnique({
            where: { id: parseInt(id) },
            include: {
                candidates: {
                    include: {
                        party: true
                    },
                    orderBy: {
                        votes: 'desc'
                    }
                }
            }
        });

        if (!election) {
            return res.status(404).json({ message: "Election not found" });
        }

        res.json({ election });

    } catch (err) {
        console.error("Error fetching election:", err);
        res.status(500).json({ message: "Error fetching election" });
    }
};

// UPDATE ELECTION
exports.updateElection = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, startTime, endTime } = req.body;

        // Check if election exists
        const existingElection = await prisma.election.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingElection) {
            return res.status(404).json({ message: "Election not found" });
        }

        // Prepare update data
        const updateData = {};
        if (title) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        
        if (startTime || endTime) {
            const start = startTime ? new Date(startTime) : existingElection.startTime;
            const end = endTime ? new Date(endTime) : existingElection.endTime;

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({ message: "Invalid date format" });
            }

            if (start >= end) {
                return res.status(400).json({ message: "Start time must be before end time" });
            }

            updateData.startTime = start;
            updateData.endTime = end;
        }

        // Update election
        const election = await prisma.election.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                candidates: {
                    include: {
                        party: true
                    }
                }
            }
        });

        res.json({
            message: "Election updated successfully",
            election
        });

    } catch (err) {
        console.error("Error updating election:", err);
        res.status(500).json({ message: "Error updating election" });
    }
};

// DELETE ELECTION
exports.deleteElection = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if election exists
        const existingElection = await prisma.election.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: {
                    select: {
                        candidates: true
                    }
                }
            }
        });

        if (!existingElection) {
            return res.status(404).json({ message: "Election not found" });
        }

        // Check if election has candidates
        if (existingElection._count.candidates > 0) {
            return res.status(400).json({ 
                message: "Cannot delete election with candidates. Please remove all candidates first." 
            });
        }

        // Delete election
        await prisma.election.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: "Election deleted successfully" });

    } catch (err) {
        console.error("Error deleting election:", err);
        res.status(500).json({ message: "Error deleting election" });
    }
};

// GET ACTIVE ELECTIONS
exports.getActiveElections = async (req, res) => {
    try {
        const now = new Date();

        const activeElections = await prisma.election.findMany({
            where: {
                startTime: {
                    lte: now
                },
                endTime: {
                    gte: now
                }
            },
            include: {
                candidates: {
                    include: {
                        party: true
                    }
                }
            },
            orderBy: {
                endTime: 'asc'
            }
        });

        res.json({ activeElections });

    } catch (err) {
        console.error("Error fetching active elections:", err);
        res.status(500).json({ message: "Error fetching active elections" });
    }
};

// GET UPCOMING ELECTIONS
exports.getUpcomingElections = async (req, res) => {
    try {
        const now = new Date();

        const upcomingElections = await prisma.election.findMany({
            where: {
                startTime: {
                    gt: now
                }
            },
            include: {
                candidates: {
                    include: {
                        party: true
                    }
                },
                _count: {
                    select: {
                        candidates: true
                    }
                }
            },
            orderBy: {
                startTime: 'asc'
            }
        });

        res.json({ upcomingElections });

    } catch (err) {
        console.error("Error fetching upcoming elections:", err);
        res.status(500).json({ message: "Error fetching upcoming elections" });
    }
};

// GET COMPLETED ELECTIONS
exports.getCompletedElections = async (req, res) => {
    try {
        const now = new Date();

        const completedElections = await prisma.election.findMany({
            where: {
                endTime: {
                    lt: now
                }
            },
            include: {
                candidates: {
                    include: {
                        party: true
                    },
                    orderBy: {
                        votes: 'desc'
                    }
                }
            },
            orderBy: {
                endTime: 'desc'
            }
        });

        res.json({ completedElections });

    } catch (err) {
        console.error("Error fetching completed elections:", err);
        res.status(500).json({ message: "Error fetching completed elections" });
    }
};
