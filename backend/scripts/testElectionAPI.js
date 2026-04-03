const api = require('axios');

const BASE_URL = 'http://localhost:5001/api';

// Test admin login to get token
async function getAdminToken() {
    try {
        const response = await api.post(`${BASE_URL}/admin/login`, {
            username: 'admin',
            password: 'admin123'
        });
        return response.data.token;
    } catch (err) {
        console.error('Error getting admin token:', err.response?.data || err.message);
        return null;
    }
}

// Test creating an election
async function testCreateElection(token) {
    try {
        const electionData = {
            title: 'Test Election 2024',
            description: 'This is a test election for API testing',
            startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
            endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Next week
        };

        const response = await api.post(`${BASE_URL}/elections`, electionData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Election created successfully:');
        console.log(JSON.stringify(response.data, null, 2));
        return response.data.election.id;
    } catch (err) {
        console.error('❌ Error creating election:', err.response?.data || err.message);
        return null;
    }
}

// Test getting all elections
async function testGetAllElections() {
    try {
        const response = await api.get(`${BASE_URL}/elections`);
        console.log('✅ All elections fetched successfully:');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (err) {
        console.error('❌ Error fetching elections:', err.response?.data || err.message);
    }
}

// Test getting active elections
async function testGetActiveElections() {
    try {
        const response = await api.get(`${BASE_URL}/elections/active`);
        console.log('✅ Active elections fetched successfully:');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (err) {
        console.error('❌ Error fetching active elections:', err.response?.data || err.message);
    }
}

// Test getting election by ID
async function testGetElectionById(electionId) {
    try {
        const response = await api.get(`${BASE_URL}/elections/${electionId}`);
        console.log('✅ Election fetched by ID successfully:');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (err) {
        console.error('❌ Error fetching election by ID:', err.response?.data || err.message);
    }
}

// Main test function
async function runTests() {
    console.log('🚀 Starting Election API Tests...\n');

    // Get admin token
    const token = await getAdminToken();
    if (!token) {
        console.log('❌ Cannot proceed without admin token');
        return;
    }
    console.log('✅ Admin token obtained\n');

    // Test creating election
    const electionId = await testCreateElection(token);
    console.log('');

    // Test getting all elections
    await testGetAllElections();
    console.log('');

    // Test getting active elections
    await testGetActiveElections();
    console.log('');

    // Test getting election by ID (if we have one)
    if (electionId) {
        await testGetElectionById(electionId);
    }

    console.log('\n🎉 Election API tests completed!');
}

// Run the tests
runTests().catch(console.error);
