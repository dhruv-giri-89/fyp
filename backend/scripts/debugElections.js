const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugElections() {
    console.log("🔍 Debugging Elections...\n");
    
    try {
        // Get all elections
        const allElections = await prisma.election.findMany();
        console.log("📋 All Elections in Database:");
        allElections.forEach((election, index) => {
            console.log(`${index + 1}. ${election.title}`);
            console.log(`   ID: ${election.id}`);
            console.log(`   Start: ${election.startTime}`);
            console.log(`   End: ${election.endTime}`);
            console.log(`   Created: ${election.createdAt}`);
            console.log(`   Description: ${election.description || 'None'}`);
            console.log('');
        });
        
        // Check current time
        const now = new Date();
        console.log(`🕐 Current Time: ${now.toISOString()}`);
        console.log(`🕐 Current Time (Local): ${now.toLocaleString()}\n`);
        
        // Check which elections should be active
        console.log("🔍 Checking Active Elections Logic:");
        allElections.forEach((election) => {
            const startTime = new Date(election.startTime);
            const endTime = new Date(election.endTime);
            const isActive = startTime <= now && now <= endTime;
            
            console.log(`\n📊 Election: ${election.title}`);
            console.log(`   Start Time: ${startTime.toISOString()} (${startTime <= now ? 'PASSED' : 'FUTURE'})`);
            console.log(`   End Time: ${endTime.toISOString()} (${now <= endTime ? 'ACTIVE' : 'EXPIRED'})`);
            console.log(`   Is Active: ${isActive ? 'YES ✅' : 'NO ❌'}`);
        });
        
        // Test the actual query used in controller
        console.log("\n🎯 Testing Active Elections Query:");
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
                },
                _count: {
                    select: {
                        candidates: true
                    }
                }
            },
            orderBy: {
                endTime: 'asc'
            }
        });
        
        console.log(`Found ${activeElections.length} active elections:`);
        activeElections.forEach((election, index) => {
            console.log(`${index + 1}. ${election.title} (${election.candidates.length} candidates)`);
        });
        
    } catch (error) {
        console.error("❌ Error debugging elections:", error);
    } finally {
        await prisma.$disconnect();
    }
}

debugElections();
