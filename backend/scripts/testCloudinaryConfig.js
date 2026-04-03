const { cloudinary } = require('../config/cloudinary');

async function testCloudinaryConfig() {
    console.log("🔍 Testing Cloudinary Configuration...\n");
    
    // Check environment variables
    console.log("Environment Variables:");
    console.log("- CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ SET" : "❌ NOT SET");
    console.log("- CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "✅ SET" : "❌ NOT SET");
    console.log("- CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✅ SET" : "❌ NOT SET");
    
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.log("\n❌ Cloudinary is not properly configured!");
        console.log("Please add the missing environment variables to your .env file");
        return;
    }
    
    console.log("\n🔧 Cloudinary Configuration:");
    console.log("- Cloud Name:", cloudinary.config().cloud_name);
    console.log("- API Key:", cloudinary.config().api_key ? "✅ SET" : "❌ NOT SET");
    console.log("- API Secret:", cloudinary.config().api_secret ? "✅ SET" : "❌ NOT SET");
    
    // Test API connection
    try {
        console.log("\n🌐 Testing Cloudinary API connection...");
        const result = await cloudinary.api.resources({ max_results: 1 });
        console.log("✅ Cloudinary API connection successful!");
        console.log("- Total resources:", result.total_count);
    } catch (error) {
        console.error("❌ Cloudinary API connection failed:");
        console.error("- Error:", error.message);
        
        if (error.message.includes('Invalid credentials')) {
            console.log("\n💡 Possible solutions:");
            console.log("1. Check your Cloudinary API credentials");
            console.log("2. Make sure your Cloudinary account is active");
            console.log("3. Verify the cloud name is correct");
        }
    }
}

testCloudinaryConfig().catch(console.error);
