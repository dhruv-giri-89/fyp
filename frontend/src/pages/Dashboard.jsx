import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [activeElections, setActiveElections] = useState([]);
    const [votedElections, setVotedElections] = useState([]);
    const [completedElectionsCount, setCompletedElectionsCount] = useState(0);
    const [nearestDeadlineHours, setNearestDeadlineHours] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Get user info and elections
        const token = localStorage.getItem("token");
        
        if (!token) {
            navigate("/");
            return;
        }

        const fetchVoterData = async () => {
            try {
                console.log("🔍 Fetching voter data...");
                
                // Fetch voter profile
                const profileResponse = await api.get("/voter/profile");
                setUser(profileResponse.data.voter);

                // Fetch active elections
                const activeResponse = await api.get("/voter/elections/active");
                const active = activeResponse.data.elections || [];
                setActiveElections(active);

                // Fetch voting history
                const historyResponse = await api.get("/voter/history");
                setVotedElections(historyResponse.data.votingHistory);

                // Fetch completed elections for results count
                const completedResponse = await api.get("/elections/completed");
                setCompletedElectionsCount(completedResponse.data.completedElections?.length || 0);

                // Calculate nearest deadline for Time Left widget
                if (active.length > 0) {
                    const now = new Date();
                    const nearest = active.reduce((acc, curr) => {
                        const currEnd = new Date(curr.endTime);
                        const accEnd = new Date(acc.endTime);
                        return currEnd < accEnd ? curr : acc;
                    });
                    const hoursLeft = Math.max(0, Math.floor((new Date(nearest.endTime) - now) / (1000 * 60 * 60)));
                    setNearestDeadlineHours(hoursLeft);
                } else {
                    setNearestDeadlineHours(null);
                }
            } catch (err) {
                console.error("❌ Error fetching voter data:", err);
                navigate("/"); // the axios interceptor should handle this, but as a fallback redirect
            } finally {
                setLoading(false);
            }
        };

        fetchVoterData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const handleVote = (electionId) => {
        navigate(`/vote/${electionId}`);
    };

    const handleViewResults = (electionId) => {
        navigate(`/results/${electionId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
            {/* Header */}
            <header className="bg-black/30 backdrop-blur-lg border-b border-indigo-500/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-bold text-white">Voter Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-indigo-200 text-sm">Welcome back,</p>
                                <p className="text-white font-semibold">{user?.name || "Verified Voter"}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition text-sm font-semibold"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* User Profile Card */}
                <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-indigo-500/30 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mr-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{user?.name || "Verified Voter"}</h2>
                                <p className="text-indigo-200 font-mono">ID: {user?.aadhaar}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="bg-green-600/20 px-4 py-2 rounded-lg border border-green-500/30">
                                <p className="text-green-300 text-sm">Verified</p>
                                <p className="text-white font-semibold">Voter</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-indigo-500/30 hover:bg-white/20 transition cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-3xl font-bold text-white">{activeElections.length}</span>
                        </div>
                        <h3 className="text-white font-semibold">Active Elections</h3>
                        <p className="text-indigo-200 text-sm">Available to vote</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-green-500/30 hover:bg-white/20 transition cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-3xl font-bold text-white">{votedElections.length}</span>
                        </div>
                        <h3 className="text-white font-semibold">Voted</h3>
                        <p className="text-green-200 text-sm">Completed</p>
                    </div>

                    <div 
                        className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-purple-500/30 hover:bg-white/20 transition cursor-pointer"
                        onClick={() => navigate('/results')}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <span className="text-3xl font-bold text-white">{completedElectionsCount}</span>
                        </div>
                        <h3 className="text-white font-semibold">Results</h3>
                        <p className="text-purple-200 text-sm">Past elections</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-yellow-500/30 hover:bg-white/20 transition cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-3xl font-bold text-white">{nearestDeadlineHours !== null ? `${nearestDeadlineHours}l` : '--'}</span>
                        </div>
                        <h3 className="text-white font-semibold">Time Left</h3>
                        <p className="text-yellow-200 text-sm">{nearestDeadlineHours !== null ? 'Next election ends' : 'No active elections'}</p>
                    </div>
                </div>

                {/* Active Elections */}
                <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-indigo-500/30 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Active Elections</h2>
                    {console.log("🔍 Rendering active elections:", activeElections)}
                    {console.log("📊 Active elections length:", activeElections.length)}
                    {activeElections.length > 0 ? (
                        <div className="space-y-4">
                            {activeElections.map((election) => (
                                <div key={election.id} className="bg-white/5 p-4 rounded-lg border border-indigo-500/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">{election.title}</h3>
                                            <p className="text-indigo-200 text-sm">
                                                {election.description && `Description: ${election.description}`}
                                            </p>
                                            <p className="text-indigo-200 text-sm">Ends: {new Date(election.endTime).toLocaleDateString()}</p>
                                            <div className="flex items-center mt-2 space-x-4">
                                                <span className="text-sm text-indigo-300">
                                                    {election.candidates?.length || 0} candidates
                                                </span>
                                                {election.hasVoted && (
                                                    <span className="bg-green-600/20 px-2 py-1 rounded-full border border-green-500/30">
                                                        <span className="text-green-300 text-xs font-semibold">Voted</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex space-x-3">
                                            {!election.hasVoted ? (
                                                <button
                                                    onClick={() => handleVote(election.id)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition font-semibold"
                                                >
                                                    Vote Now
                                                </button>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg cursor-not-allowed font-semibold"
                                                >
                                                    Already Voted
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleViewResults(election.id)}
                                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition font-semibold"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <svg className="w-16 h-16 text-indigo-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-indigo-200 text-lg">No active elections at the moment</p>
                            <p className="text-indigo-300 text-sm mt-2">Check back later for new voting opportunities</p>
                        </div>
                    )}
                </div>

                {/* Voting History */}
                <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-green-500/30">
                    <h2 className="text-2xl font-bold text-white mb-6">Voting History</h2>
                    {votedElections.length > 0 ? (
                        <div className="space-y-4">
                            {votedElections.map((election) => (
                                <div key={election.id} className="bg-white/5 p-4 rounded-lg border border-green-500/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">{election.title}</h3>
                                            <p className="text-green-200 text-sm">Voted on: {new Date(election.votedAt).toLocaleDateString()}</p>
                                            {election.candidateVoted && (
                                                <p className="text-green-300 text-sm">
                                                    Voted for: {election.candidateVoted.name} ({election.candidateVoted.party?.name})
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center">
                                            <div className="bg-green-600/20 px-3 py-1 rounded-full border border-green-500/30 mr-3">
                                                <span className="text-green-300 text-sm font-semibold">Completed</span>
                                            </div>
                                            <button
                                                onClick={() => handleViewResults(election.id)}
                                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition font-semibold"
                                            >
                                                View Results
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-green-200 text-lg">No voting history yet</p>
                            <p className="text-green-300 text-sm mt-2">Participate in active elections to build your voting record</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}