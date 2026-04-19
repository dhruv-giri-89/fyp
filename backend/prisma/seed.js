const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {

    const otpPlain = "123456";
    const hashedOtp = await bcrypt.hash(otpPlain, 10);

    // Clear old OTPs (avoid duplicates)
    await prisma.otp.deleteMany();



    // ================= OTP 1 =================
    await prisma.otp.create({
        data: {
            aadhaar: "123456789012",
            otp: hashedOtp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
    });

    // ================= OTP 2 =================
    const otpPlain2 = "654321";
    const hashedOtp2 = await bcrypt.hash(otpPlain2, 10);

    await prisma.otp.create({
        data: {
            aadhaar: "987654321098",
            otp: hashedOtp2,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
    });

    console.log("👉 Aadhaar 1: 123456789012  |  OTP 1: 123456");
    console.log("👉 Aadhaar 2: 987654321098  |  OTP 2: 654321");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });