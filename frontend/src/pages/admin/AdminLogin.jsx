import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

export default function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const res = await api.post("/admin/login", { username, password });
            const token = res.data.token;
            const admin = res.data.admin;
            
            console.log("🔐 Admin Login Successful:", admin);
            localStorage.setItem("adminToken", token);
            localStorage.setItem("admin", JSON.stringify(admin));
            console.log("💾 Admin token stored in localStorage");
            
            navigate("/admin/dashboard");
        } catch (err) {
            console.error("Admin login error:", err);
            alert(err.response?.data?.message || "Invalid credentials. Please try again.");
        }
        
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
                    <p className="text-purple-200 text-sm">Enter your credentials to access the admin dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-purple-200 text-sm font-medium mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter admin username"
                            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 border border-purple-400/30"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-purple-200 text-sm font-medium mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter admin password"
                            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 border border-purple-400/30"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white py-3 rounded-lg transition font-semibold flex items-center justify-center"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a 
                        href="/login" 
                        className="text-purple-300 hover:text-white text-sm transition"
                    >
                        ← Back to User Login
                    </a>
                </div>
            </div>
        </div>
    );
}
