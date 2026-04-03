const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Debug: Check if dotenv is working
console.log("🔍 Environment Debug:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Current working directory:", process.cwd());
console.log("Looking for .env file at:", process.cwd() + '/.env');

// Load environment variables explicitly
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

// Debug after loading
console.log("After loading .env:");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ SET" : "❌ NOT SET");
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "✅ SET" : "❌ NOT SET");
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✅ SET" : "❌ NOT SET");

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Custom file upload handler
const uploadToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        console.log("🔍 Uploading to Cloudinary (minimal approach):");
        console.log("- File:", file.originalname);
        console.log("- Size:", file.size);
        console.log("- Type:", file.mimetype);
        
        // Use the most basic upload possible - no custom parameters
        cloudinary.uploader.upload_stream(
            { resource_type: 'auto' }, // Minimal parameters only
            (error, result) => {
                if (error) {
                    console.error("❌ Cloudinary upload error:", error);
                    console.error("Error details:", {
                        message: error.message,
                        http_code: error.http_code,
                        name: error.name
                    });
                    return reject(error);
                }
                console.log("✅ Cloudinary upload successful:", result.secure_url);
                resolve(result);
            }
        ).end(file.buffer);
    });
};

// Multer middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

module.exports = { cloudinary, upload, uploadToCloudinary };
