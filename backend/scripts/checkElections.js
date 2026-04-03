const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkElections() {
    console.log("🔍 Checking Elections in Database...\n");
    
    try {
        // Get all elections
        const allElections = await prisma.election.findMany({
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
            }
        });
        
        console.log(`📋 Found ${allElections.length} elections in database:\n`);
        
        if (allElections.length === 0) {
            console.log("❌ No elections found in database!");
            console.log("💡 You need to create elections first via the admin dashboard.");
            return;
        }
        
        // Get current time
        const now = new Date();
        console.log(`🕐 Current Server Time: ${now.toISOString()}`);
        console.log(`🕐 Current Local Time: ${now.toLocaleString()}\n`);
        
        allElections.forEach((election, index) => {
            const startTime = new Date(election.startTime);
            const endTime = new Date(election.endTime);
            const isActive = startTime <= now && now <= endTime;
            
            console.log(`${index + 1}. 📊 ${election.title}`);
            console.log(`   ID: ${election.id}`);
            console.log(`   Description: ${election.description || 'None'}`);
            console.log(`   Start Time: ${startTime.toISOString()} (${startTime.toLocaleString()})`);
            console.log(`   End Time: ${endTime.toISOString()} (${endTime.toLocaleString()})`);
            console.log(`   Candidates: ${election.candidates.length}`);
            console.log(`   Status: ${isActive ? '🟢 ACTIVE' : '🔴 INACTIVE'}`);
            
            if (startTime > now) {
                console.log(`   ⏰ Starts in: ${Math.round((startTime - now) / (1000 * 60 * 60))} hours`);
            } else if (endTime < now) {
                console.log(`   ⏰ Ended: ${Math.round((now - endTime) / (1000 * 60 * 60))} hours ago`);
            } else {
                console.log(`   ⏰ Ends in: ${Math.round((endTime - now) / (1000 * 60 * 60))} hours`);
            }
            console.log('');
        });
        
        // Test the exact query from the controller
        console.log("🎯 Testing Active Elections Query (from controller):");
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
                },
                _count: {
                    select: {
                        candidates: true
                    }
                }
            }
        });
        
        console.log(`✅ Found ${activeElections.length} active elections:`);
        activeElections.forEach((election, index) => {
            console.log(`   ${index + 1}. ${election.title} (${election.candidates.length} candidates)`);
        });
        
        if (activeElections.length === 0) {
            console.log("\n💡 No active elections found. To make an election active:");
            console.log("   1. Set start time to before current time");
            console.log("   2. Set end time to after current time");
            console.log("   3. Make sure the election has candidates assigned");
        }
        
    } catch (error) {
        console.error("❌ Error checking elections:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkElections();
