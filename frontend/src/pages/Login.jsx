import { useState } from "react";
import api from "../services/api";

export default function Login() {
    const [aadhaar, setAadhaar] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const sendOtp = async () => {
        setLoading(true);
        try {
            await api.post("/auth/send-otp", { aadhaar });
            setStep(2);
        } catch (err) {
            console.error("Backend error:", err);
            alert("Error sending OTP. (Dev Tip: Use 'Bypass' to proceed anyway)");
        }
        setLoading(false);
    };

    const verifyOtp = async () => {
        setLoading(true);
        try {
            const res = await api.post("/auth/verify-otp", { aadhaar, otp });
            const token = res.data.token;
            console.log("🔐 Received JWT Token:", token);
            localStorage.setItem("token", token);
            console.log("💾 Token stored in localStorage");
            window.location.href = "/dashboard";
        } catch {
            alert("Invalid OTP. (Try 123456 as seeded)");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
                <h1 className="text-3xl font-bold text-white text-center mb-6">Secure Login</h1>

                {step === 1 && (
                    <div className="space-y-4">
                        <input
                            value={aadhaar}
                            onChange={(e) => setAadhaar(e.target.value)}
                            placeholder="Enter Aadhaar"
                            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <button
                            onClick={sendOtp}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition font-semibold"
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>

                        {/* Dev Bypass Button */}
                        <div className="text-center">
                            <button
                                onClick={() => setStep(2)}
                                className="text-xs text-indigo-300 hover:underline opacity-50"
                            >
                                Dev: Skip to OTP Field
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <div className="text-sm text-indigo-200 text-center mb-2">
                            OTP sent to Aadhaar ending in {aadhaar.slice(-4)}
                        </div>
                        <input
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 text-center text-2xl tracking-widest"
                        />
                        <button
                            onClick={verifyOtp}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition font-semibold"
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                        <button
                            onClick={() => setStep(1)}
                            className="w-full text-sm text-gray-300 hover:text-white transition"
                        >
                            ← Change Aadhaar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
