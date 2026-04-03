const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// ADMIN LOGIN
exports.adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Basic validation
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        // Find admin by username
        const admin = await prisma.admin.findUnique({
            where: { username }
        });

        if (!admin) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: admin.id, username: admin.username, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: "Login successful",
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                createdAt: admin.createdAt
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error during login" });
    }
};

// CREATE ADMIN (for initial setup)
exports.createAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Basic validation
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // Check if admin already exists
        const existingAdmin = await prisma.admin.findUnique({
            where: { username }
        });

        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin
        const admin = await prisma.admin.create({
            data: {
                username,
                password: hashedPassword
            }
        });

        res.status(201).json({
            message: "Admin created successfully",
            admin: {
                id: admin.id,
                username: admin.username,
                createdAt: admin.createdAt
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating admin" });
    }
};

// GET ADMIN PROFILE
exports.getAdminProfile = async (req, res) => {
    try {
        const admin = await prisma.admin.findUnique({
            where: { id: req.admin.id },
            select: {
                id: true,
                username: true,
                createdAt: true
            }
        });

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.json({ admin });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching admin profile" });
    }
};