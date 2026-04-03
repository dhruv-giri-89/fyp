const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {

    const otpPlain = "123456";
    const hashedOtp = await bcrypt.hash(otpPlain, 10);

    // Clear old OTPs (avoid duplicates)
    await prisma.otp.deleteMany();



    // ================= OTP =================
    await prisma.otp.create({
        data: {
            aadhaar: "123456789012",
            otp: hashedOtp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
    });

    console.log("👉 Aadhaar: 123456789012");
    console.log("👉 OTP: 123456");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });