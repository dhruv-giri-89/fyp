import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import ElectionManagement from "./ElectionManagement";
import PartyManagement from "./PartyManagement";

export default function AdminDashboard() {
    const [admin, setAdmin] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalElections: 0,
        totalCandidates: 0,
        totalParties: 0,
        activeElections: 0
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const navigate = useNavigate();

    useEffect(() => {
        // Check admin authentication
        const token = localStorage.getItem("adminToken");
        const adminData = localStorage.getItem("admin");
        
        if (!token || !adminData) {
            navigate("/admin/login");
            return;
        }

        try {
            const parsedAdmin = JSON.parse(adminData);
            setAdmin(parsedAdmin);
        } catch (err) {
            console.error("Error parsing admin data:", err);
            navigate("/admin/login");
            return;
        }

        // Fetch dashboard stats
        fetchDashboardStats();
    }, [navigate]);

    const fetchDashboardStats = async () => {
        try {
            // Set the admin token in API headers
            const token = localStorage.getItem("adminToken");
            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }

            // Fetch real data from admin stats endpoint
            const response = await api.get("/admin/stats");
            setStats(response.data.stats);
        } catch (err) {
            console.error("Error fetching dashboard stats:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        navigate("/admin/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
                <div className="text-white text-xl">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
            {/* Header */}
            <header className="bg-black/30 backdrop-blur-lg border-b border-purple-500/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-purple-200">Welcome, {admin?.username}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="flex space-x-1 bg-black/20 p-1 rounded-lg">
                    {["overview", "elections", "parties"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 px-4 rounded-md transition capitalize ${
                                activeTab === tab
                                    ? "bg-purple-600 text-white"
                                    : "text-purple-300 hover:text-white hover:bg-white/10"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-purple-500/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-200 text-sm">Total Users</p>
                                        <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-purple-500/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-200 text-sm">Total Elections</p>
                                        <p className="text-2xl font-bold text-white">{stats.totalElections}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-purple-500/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-200 text-sm">Candidates</p>
                                        <p className="text-2xl font-bold text-white">{stats.totalCandidates}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-purple-500/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-200 text-sm">Parties</p>
                                        <p className="text-2xl font-bold text-white">{stats.totalParties}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-purple-500/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-200 text-sm">Active Elections</p>
                                        <p className="text-2xl font-bold text-white">{stats.activeElections}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-purple-500/30">
                            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button 
                                    onClick={() => navigate("/admin/create-election")}
                                    className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition"
                                >
                                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create New Election
                                </button>
                                <button 
                                    onClick={() => navigate("/admin/create-candidate")}
                                    className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition"
                                >
                                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    Add Candidate
                                </button>
                                <button 
                                    onClick={() => navigate("/admin/create-party")}
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition"
                                >
                                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Manage Parties
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Navigation Tabs Content */}
                {activeTab === "elections" && <ElectionManagement />}
                {activeTab === "parties" && <PartyManagement />}

                {/* Other tabs would have their respective content */}
                {activeTab !== "overview" && activeTab !== "elections" && activeTab !== "parties" && (
                    <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl border border-purple-500/30 text-center">
                        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 capitalize">{activeTab} Management</h3>
                        <p className="text-purple-200">This section is under development. Check back soon!</p>
                    </div>
                )}
            </main>
        </div>
    );
}
