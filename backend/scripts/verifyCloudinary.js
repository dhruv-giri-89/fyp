const { cloudinary } = require('../config/cloudinary');

async function verifyCloudinaryCredentials() {
    console.log("🔍 Verifying Cloudinary Credentials...\n");
    
    // Check if credentials are set
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    console.log("Environment Variables:");
    console.log("- CLOUDINARY_CLOUD_NAME:", cloudName ? `✅ ${cloudName}` : "❌ NOT SET");
    console.log("- CLOUDINARY_API_KEY:", apiKey ? `✅ ${apiKey.substring(0, 8)}...` : "❌ NOT SET");
    console.log("- CLOUDINARY_API_SECRET:", apiSecret ? "✅ SET" : "❌ NOT SET");
    
    if (!cloudName || !apiKey || !apiSecret) {
        console.log("\n❌ Please set all Cloudinary environment variables in your .env file");
        return false;
    }
    
    // Test API connection with a simple ping
    try {
        console.log("\n🌐 Testing Cloudinary API connection...");
        
        // Try to get account info (this tests the credentials)
        const result = await cloudinary.api.ping();
        console.log("✅ Cloudinary API connection successful!");
        console.log("- Response:", result);
        
        return true;
    } catch (error) {
        console.error("❌ Cloudinary API connection failed:");
        console.error("- Error:", error.message);
        
        if (error.message.includes('Invalid credentials') || error.http_code === 401) {
            console.log("\n💡 Possible solutions:");
            console.log("1. Double-check your Cloudinary API credentials");
            console.log("2. Make sure you copied the correct values from Cloudinary dashboard");
            console.log("3. Check that your Cloudinary account is active and not suspended");
            console.log("4. Verify the cloud name matches your account");
        }
        
        return false;
    }
}

// Test upload with a simple buffer
async function testUpload() {
    console.log("\n📤 Testing upload with sample data...");
    
    try {
        // Create a simple test image buffer (1x1 pixel PNG)
        const testImageBuffer = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            'base64'
        );
        
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    folder: 'test',
                    public_id: 'test-upload-' + Date.now()
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            ).end(testImageBuffer);
        });
        
        console.log("✅ Test upload successful!");
        console.log("- URL:", result.secure_url);
        
        // Clean up - delete the test image
        await cloudinary.uploader.destroy(result.public_id);
        console.log("🧹 Test image cleaned up");
        
        return true;
    } catch (error) {
        console.error("❌ Test upload failed:");
        console.error("- Error:", error.message);
        return false;
    }
}

async function runTests() {
    const credentialsOk = await verifyCloudinaryCredentials();
    
    if (credentialsOk) {
        await testUpload();
    }
    
    console.log("\n🎯 Summary:");
    console.log(credentialsOk ? "✅ Cloudinary is working correctly" : "❌ Cloudinary needs configuration");
}

runTests().catch(console.error);
