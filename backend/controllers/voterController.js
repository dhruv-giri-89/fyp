const prisma = require("../config/prisma");

// GET ACTIVE ELECTIONS FOR VOTER
exports.getActiveElections = async (req, res) => {
    try {
        const voterId = req.user.id; // From auth middleware
        
        // Get current date and time
        const now = new Date();
        console.log("🔍 Active Elections Debug:");
        console.log("- Current time:", now.toISOString());
        console.log("- Current time (local):", now.toLocaleString());
        
        // Find elections that are currently active (startTime <= now <= endTime)
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
                        party: {
                            select: {
                                id: true,
                                name: true,
                                logoUrl: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                endTime: 'asc'
            }
        });
        
        console.log("- Found elections:", activeElections.length);
        console.log("- Election details:");
        activeElections.forEach((election, index) => {
            console.log(`  ${index + 1}. ${election.title}`);
            console.log(`     Start: ${election.startTime} (${new Date(election.startTime) <= now ? 'PASSED' : 'FUTURE'})`);
            console.log(`     End: ${election.endTime} (${now <= new Date(election.endTime) ? 'ACTIVE' : 'EXPIRED'})`);
        });

        // Check which elections the voter has already voted in
        const votedElectionIds = await prisma.vote.findMany({
            where: {
                voterId: voterId
            },
            select: {
                electionId: true
            }
        });

        const votedIds = votedElectionIds.map(vote => vote.electionId);

        // Add voting status to each election
        const electionsWithStatus = activeElections.map(election => ({
            ...election,
            hasVoted: votedIds.includes(election.id),
            timeRemaining: Math.max(0, new Date(election.endTime) - now)
        }));

        res.json({ 
            elections: electionsWithStatus,
            count: electionsWithStatus.length
        });

    } catch (err) {
        console.error("Error fetching active elections:", err);
        res.status(500).json({ message: "Error fetching active elections" });
    }
};

// GET VOTER'S VOTING HISTORY
exports.getVotingHistory = async (req, res) => {
    try {
        const voterId = req.user.id;
        
        // Get all elections the voter has voted in
        const votedElections = await prisma.vote.findMany({
            where: {
                voterId: voterId
            },
            include: {
                election: {
                    include: {
                        candidates: {
                            include: {
                                party: {
                                    select: {
                                        id: true,
                                        name: true,
                                        logoUrl: true
                                    }
                                }
                            }
                        }
                    }
                },
                candidate: {
                    include: {
                        party: {
                            select: {
                                id: true,
                                name: true,
                                logoUrl: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Format the response
        const votingHistory = votedElections.map(vote => ({
            id: vote.election.id,
            title: vote.election.title,
            description: vote.election.description,
            votedAt: vote.createdAt,
            candidateVoted: {
                id: vote.candidate.id,
                name: vote.candidate.name,
                party: vote.candidate.party
            },
            election: vote.election
        }));

        res.json({ 
            votingHistory,
            count: votingHistory.length
        });

    } catch (err) {
        console.error("Error fetching voting history:", err);
        res.status(500).json({ message: "Error fetching voting history" });
    }
};

// GET VOTER PROFILE
exports.getVoterProfile = async (req, res) => {
    try {
        console.log("🔍 Voter Profile Debug:");
        console.log("- req.user:", req.user);
        console.log("- req.user.id:", req.user?.id);
        
        const voterId = req.user.id;
        
        if (!voterId) {
            console.log("❌ No voter ID found in request");
            return res.status(400).json({ message: "Invalid user data in token" });
        }
        
        console.log("- Looking for voter with ID:", voterId);
        
        const voter = await prisma.user.findUnique({
            where: { id: voterId },
            select: {
                id: true,
                aadhaar: true,
                phone: true
            }
        });

        console.log("- Found voter:", voter);

        if (!voter) {
            console.log("❌ Voter not found in database");
            return res.status(404).json({ message: "Voter not found" });
        }

        // Mask Aadhaar number for privacy
        const maskedAadhaar = voter.aadhaar.replace(/(\d{4})\d{8}(\d{4})/, '$1XXXXXXXX$2');

        console.log("✅ Voter profile retrieved successfully");

        res.json({
            voter: {
                ...voter,
                aadhaar: maskedAadhaar
            }
        });

    } catch (err) {
        console.error("Error fetching voter profile:", err);
        res.status(500).json({ message: "Error fetching voter profile" });
    }
};

// CAST VOTE
exports.castVote = async (req, res) => {
    try {
        const voterId = req.user.id;
        const { electionId, candidateId } = req.body;

        // Validate input
        if (!electionId || !candidateId) {
            return res.status(400).json({ 
                message: "Election ID and Candidate ID are required" 
            });
        }

        // Check if election exists and is active
        const election = await prisma.election.findUnique({
            where: { id: parseInt(electionId) }
        });

        if (!election) {
            return res.status(404).json({ message: "Election not found" });
        }

        const now = new Date();
        if (now < election.startTime || now > election.endTime) {
            return res.status(400).json({ 
                message: "Election is not active for voting" 
            });
        }

        // Check if candidate exists and belongs to the election
        const candidate = await prisma.candidate.findUnique({
            where: { id: parseInt(candidateId) }
        });

        if (!candidate || candidate.electionId !== parseInt(electionId)) {
            return res.status(400).json({ 
                message: "Invalid candidate for this election" 
            });
        }

        // Check if voter has already voted in this election
        const existingVote = await prisma.vote.findFirst({
            where: {
                voterId: voterId,
                electionId: parseInt(electionId)
            }
        });

        if (existingVote) {
            return res.status(400).json({ 
                message: "You have already voted in this election" 
            });
        }

        // Cast the vote
        const vote = await prisma.vote.create({
            data: {
                voterId: voterId,
                electionId: parseInt(electionId),
                candidateId: parseInt(candidateId)
            },
            include: {
                candidate: {
                    include: {
                        party: true
                    }
                },
                election: true
            }
        });

        // Update candidate vote count
        await prisma.candidate.update({
            where: { id: parseInt(candidateId) },
            data: {
                voteCount: {
                    increment: 1
                }
            }
        });

        console.log("✅ Vote cast successfully:", {
            voterId,
            electionId,
            candidateId,
            timestamp: vote.createdAt
        });

        res.status(201).json({
            message: "Vote cast successfully",
            vote: {
                id: vote.id,
                electionTitle: vote.election.title,
                candidateName: vote.candidate.name,
                partyName: vote.candidate.party.name,
                votedAt: vote.createdAt
            }
        });

    } catch (err) {
        console.error("Error casting vote:", err);
        res.status(500).json({ message: "Error casting vote" });
    }
};

// GET ELECTION DETAILS FOR VOTING
exports.getElectionDetails = async (req, res) => {
    try {
        const { electionId } = req.params;
        const voterId = req.user.id;

        const election = await prisma.election.findUnique({
            where: { id: parseInt(electionId) },
            include: {
                candidates: {
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
                        voteCount: 'desc'
                    }
                }
            }
        });

        if (!election) {
            return res.status(404).json({ message: "Election not found" });
        }

        // Check if voter has already voted
        const existingVote = await prisma.vote.findFirst({
            where: {
                voterId: voterId,
                electionId: parseInt(electionId)
            }
        });

        const now = new Date();
        const isActive = now >= election.startTime && now <= election.endTime;

        res.json({
            election: {
                ...election,
                isActive,
                hasVoted: !!existingVote,
                timeRemaining: Math.max(0, new Date(election.endTime) - now)
            }
        });

    } catch (err) {
        console.error("Error fetching election details:", err);
        res.status(500).json({ message: "Error fetching election details" });
    }
};
