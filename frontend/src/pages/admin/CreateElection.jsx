import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function CreateElection() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startTime: "",
        endTime: ""
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await api.post("/elections", formData);
            
            console.log("Election created:", response.data);
            alert("Election created successfully!");
            navigate("/admin/dashboard");
        } catch (err) {
            console.error("Error creating election:", err);
            alert(err.response?.data?.message || "Error creating election");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
            {/* Header - Same as AdminDashboard */}
            <header className="bg-black/30 backdrop-blur-lg border-b border-purple-500/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate("/admin/dashboard")}
                                className="mr-3 text-purple-300 hover:text-white transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-bold text-white">Create New Election</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-purple-200">Admin</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-purple-500/30">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-purple-200 text-sm font-medium mb-2">
                                Election Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., General Election 2024"
                                className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 border border-purple-400/30"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-purple-200 text-sm font-medium mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Provide a detailed description of the election..."
                                rows={4}
                                className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 border border-purple-400/30"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-purple-200 text-sm font-medium mb-2">
                                    Start Date & Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 border border-purple-400/30"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-purple-200 text-sm font-medium mb-2">
                                    End Date & Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 border border-purple-400/30"
                                    required
                                />
                            </div>
                        </div>

                        <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30">
                            <h3 className="text-white font-semibold mb-2">Important Notes:</h3>
                            <ul className="text-purple-200 text-sm space-y-1">
                                <li>• Start time must be before end time</li>
                                <li>• Once created, election dates cannot be modified</li>
                                <li>• Make sure to add candidates before the election starts</li>
                            </ul>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white py-3 rounded-lg transition font-semibold"
                            >
                                {loading ? "Creating..." : "Create Election"}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/admin/dashboard")}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
