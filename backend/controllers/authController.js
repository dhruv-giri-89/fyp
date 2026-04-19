const prisma = require("../config/prisma");
const { generateOTP } = require("../utils/otp");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// SEND OTP
exports.sendOTP = async (req, res) => {
    try {
        const { aadhaar } = req.body;
        
        // basic validation
        if (!aadhaar || aadhaar.length !== 12) {
            return res.status(400).send("Invalid Aadhaar");
        }

        let user = await prisma.user.findUnique({
            where: { aadhaar }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    aadhaar,
                    phone: "9999999999" // placeholder
                }
            });
        }

        const otp = generateOTP();
        const hashedOTP = await bcrypt.hash(otp, 10);

        // delete old OTPs
        await prisma.otp.deleteMany({ where: { aadhaar } });

        await prisma.otp.create({
            data: {
                aadhaar,
                otp: hashedOTP,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000)
            }
        });

        console.log("OTP (test):", otp);

        res.json({ message: "OTP sent" });

    } catch (err) {
        console.error(err);
        res.status(500).send("Error sending OTP");
    }
};

// VERIFY OTP
exports.verifyOTP = async (req, res) => {
    
    
    try {
        const { aadhaar, otp } = req.body;

        const record = await prisma.otp.findFirst({
            where: { aadhaar },
            orderBy: { id: "desc" }
        });

        if (!record) {
            return res.status(400).send("Invalid OTP");
        }

        if (record.expiresAt < new Date()) {
            return res.status(400).send("OTP expired");
        }

        const isMatch = await bcrypt.compare(otp, record.otp);

        if (!isMatch) {
            return res.status(400).send("Invalid OTP");
        }

        let user = await prisma.user.findUnique({
            where: { aadhaar }
        });

        if (!user) {
            user = await prisma.user.create({
                data: { aadhaar, phone: "9999999999" }
            });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );


        await prisma.otp.deleteMany({ where: { aadhaar } });

        res.json({
            message: "Login successful",
            token
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Error verifying OTP");
    }
};