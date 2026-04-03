import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function CreateCandidate() {
    const [formData, setFormData] = useState({
        name: "",
        age: "",
        bio: "",
        partyId: "",
        electionId: ""
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [parties, setParties] = useState([]);
    const [elections, setElections] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch parties and elections on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Set admin token for API calls
                const token = localStorage.getItem("adminToken");
                if (token) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                }

                // Fetch parties and elections
                const [partiesResponse, electionsResponse] = await Promise.all([
                    api.get("/parties"),
                    api.get("/elections")
                ]);

                setParties(partiesResponse.data.parties || []);
                setElections(electionsResponse.data.elections || []);
            } catch (err) {
                console.error("Error fetching data:", err);
                alert("Error loading parties and elections");
            } finally {
                setDataLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            
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
            formDataToSend.append('age', formData.age);
            formDataToSend.append('bio', formData.bio);
            formDataToSend.append('partyId', formData.partyId);
            formDataToSend.append('electionId', formData.electionId);
            
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }
            
            const response = await api.post("/candidates", formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            
            console.log("Candidate created:", response.data);
            alert(response.data.message || "Candidate created successfully!");
            navigate("/admin/dashboard");
        } catch (err) {
            console.error("Error creating candidate:", err);
            alert(err.response?.data?.message || "Error creating candidate");
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-bold text-white">Create New Candidate</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-purple-200">Admin</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {dataLoading ? (
                    <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-purple-500/30 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-white text-lg">Loading parties and elections...</p>
                    </div>
                ) : (
                    <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-purple-500/30">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-purple-200 text-sm font-medium mb-2">
                                        Candidate Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g., John Doe"
                                        className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 border border-purple-400/30"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-purple-200 text-sm font-medium mb-2">
                                        Age
                                    </label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        placeholder="e.g., 45"
                                        min="18"
                                        max="100"
                                        className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 border border-purple-400/30"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-purple-200 text-sm font-medium mb-2">
                                    Biography
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Provide information about the candidate's background, experience, and vision..."
                                    rows={4}
                                    className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 border border-purple-400/30"
                                />
                            </div>

                            <div>
                                <label className="block text-purple-200 text-sm font-medium mb-2">
                                    Profile Image
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
                                            <p className="text-purple-200 text-sm mb-2">Image Preview:</p>
                                            <img 
                                                src={previewUrl} 
                                                alt="Profile preview" 
                                                className="w-32 h-32 object-cover rounded-lg border-2 border-purple-400/30"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-purple-200 text-sm font-medium mb-2">
                                        Party *
                                    </label>
                                    <select
                                        name="partyId"
                                        value={formData.partyId}
                                        onChange={handleChange}
                                        className="w-full p-3 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 border border-purple-400/30"
                                        required
                                        disabled={dataLoading}
                                    >
                                        <option value="" className="bg-gray-800">
                                            {dataLoading ? "Loading parties..." : "Select a party"}
                                        </option>
                                        {parties.map((party) => (
                                            <option key={party.id} value={party.id} className="bg-gray-800">
                                                {party.name}
                                            </option>
                                        ))}
                                    </select>
                                    {parties.length === 0 && !dataLoading && (
                                        <p className="text-red-400 text-sm mt-1">No parties available. Please create a party first.</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-purple-200 text-sm font-medium mb-2">
                                        Election *
                                    </label>
                                    <select
                                        name="electionId"
                                        value={formData.electionId}
                                        onChange={handleChange}
                                        className="w-full p-3 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 border border-purple-400/30"
                                        required
                                        disabled={dataLoading}
                                    >
                                        <option value="" className="bg-gray-800">
                                            {dataLoading ? "Loading elections..." : "Select an election"}
                                        </option>
                                        {elections.map((election) => (
                                            <option key={election.id} value={election.id} className="bg-gray-800">
                                                {election.title}
                                            </option>
                                        ))}
                                    </select>
                                    {elections.length === 0 && !dataLoading && (
                                        <p className="text-red-400 text-sm mt-1">No elections available. Please create an election first.</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30">
                                <h3 className="text-white font-semibold mb-2">Candidate Requirements:</h3>
                                <ul className="text-purple-200 text-sm space-y-1">
                                    <li>• Candidate must be associated with a party</li>
                                    <li>• Candidate must be assigned to an election</li>
                                    <li>• Age should be between 18-100 years</li>
                                    <li>• Profile image should be a valid image file (JPG, PNG, GIF)</li>
                                    <li>• Maximum file size: 5MB</li>
                                    <li>• Biography helps voters understand the candidate</li>
                                </ul>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white py-3 rounded-lg transition font-semibold"
                                >
                                    {loading ? "Creating..." : "Create Candidate"}
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
                )}
            </main>
        </div>
    );
}
