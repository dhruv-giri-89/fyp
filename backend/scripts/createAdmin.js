const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

async function createAdmin() {
    try {
        const username = "admin";
        const password = "admin123";

        // Check if admin already exists
        const existingAdmin = await prisma.admin.findUnique({
            where: { username }
        });

        if (existingAdmin) {
            console.log("Admin user already exists!");
            return;
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

        console.log("Admin created successfully!");
        console.log("Username:", admin.username);
        console.log("Password:", password);
        console.log("Please change the password after first login.");

    } catch (err) {
        console.error("Error creating admin:", err);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
