import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function CreateParty() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        logoUrl: ""
    });
    const [logoFile, setLogoFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            
            if (logoFile) {
                formDataToSend.append('logo', logoFile);
            }
            
            const response = await api.post("/parties", formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            
            console.log("Party created:", response.data);
            alert("Party created successfully!");
            navigate("/admin/dashboard");
        } catch (err) {
            console.error("Error creating party:", err);
            alert(err.response?.data?.message || "Error creating party");
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-bold text-white">Create New Party</h1>
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
                                Party Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Democratic Party"
                                className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 border border-purple-400/30"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-purple-200 text-sm font-medium mb-2">
                                Party Logo
                            </label>
                            <div className="space-y-3">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full p-3 rounded-lg bg-white/20 text-purple-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                                />
                                
                                {previewUrl && (
                                    <div className="mt-3">
                                        <p className="text-purple-200 text-sm mb-2">Logo Preview:</p>
                                        <img 
                                            src={previewUrl} 
                                            alt="Logo preview" 
                                            className="w-32 h-32 object-cover rounded-lg border-2 border-purple-400/30"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-purple-200 text-sm font-medium mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Provide a detailed description of the party's ideology, goals, and history..."
                                rows={4}
                                className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 border border-purple-400/30"
                            />
                        </div>

                        <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30">
                            <h3 className="text-white font-semibold mb-2">Party Information:</h3>
                            <ul className="text-purple-200 text-sm space-y-1">
                                <li>• Party name must be unique</li>
                                <li>• Logo should be a valid image file (JPG, PNG, GIF)</li>
                                <li>• Maximum file size: 5MB</li>
                                <li>• Description helps voters understand your party</li>
                            </ul>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white py-3 rounded-lg transition font-semibold"
                            >
                                {loading ? "Creating..." : "Create Party"}
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
