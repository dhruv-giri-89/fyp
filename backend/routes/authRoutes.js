const router = require("express").Router();
const { sendOTP, verifyOTP } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);





module.exports = router;