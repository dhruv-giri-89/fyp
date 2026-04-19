import { useState, useEffect } from "react";
import api from "../../services/api";

export default function ElectionManagement() {
    const [activeSection, setActiveSection] = useState("ongoing"); // 'ongoing', 'past', 'future'
    const [elections, setElections] = useState({
        ongoing: [],
        past: [],
        future: []
    });
    const [loading, setLoading] = useState(true);
    const [selectedElection, setSelectedElection] = useState(null);
    const [electionDetails, setElectionDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        fetchElections();
    }, []);

    const fetchElections = async () => {
        setLoading(true);
        try {
            const [activeRes, upcomingRes, completedRes] = await Promise.all([
                api.get("/elections/active"),
                api.get("/elections/upcoming"),
                api.get("/elections/completed")
            ]);

            setElections({
                ongoing: activeRes.data.activeElections || [],
                future: upcomingRes.data.upcomingElections || [],
                past: completedRes.data.completedElections || []
            });
        } catch (err) {
            console.error("Error fetching elections:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleElectionClick = async (election) => {
        setSelectedElection(election);
        setDetailsLoading(true);
        try {
            const response = await api.get(`/elections/${election.id}`);
            setElectionDetails(response.data.election);
        } catch (err) {
            console.error("Error fetching election details:", err);
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeDetails = () => {
        setSelectedElection(null);
        setElectionDetails(null);
    };

    // Helper to calculate total votes
    const getTotalVotes = (candidates) => {
        if (!candidates) return 0;
        return candidates.reduce((total, c) => total + (c.voteCount || 0), 0);
    };

    // Helper to determine the winner
    const getWinner = (candidates) => {
        if (!candidates || candidates.length === 0) return null;
        let highest = candidates[0];
        for (let i = 1; i < candidates.length; i++) {
            if (candidates[i].voteCount > highest.voteCount) {
                highest = candidates[i];
            }
        }
        return highest;
    };

    return (
        <div className="space-y-6">
            {/* Section tabs */}
            <div className="flex space-x-2 bg-black/20 p-1 rounded-lg w-full max-w-md">
                {["ongoing", "future", "past"].map((section) => (
                    <button
                        key={section}
                        onClick={() => setActiveSection(section)}
                        className={`flex-1 py-2 px-4 rounded-md transition capitalize ${
                            activeSection === section
                                ? "bg-purple-600 text-white shadow"
                                : "text-purple-300 hover:text-white hover:bg-white/10"
                        }`}
                    >
                        {section}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {elections[activeSection].length === 0 ? (
                        <div className="col-span-full bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-purple-500/20 text-center">
                            <p className="text-purple-200">No {activeSection} elections found.</p>
                        </div>
                    ) : (
                        elections[activeSection].map((election) => (
                            <div 
                                key={election.id} 
                                onClick={() => handleElectionClick(election)}
                                className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-purple-500/30 cursor-pointer hover:bg-white/20 transition hover:scale-105 transform duration-200 shadow-xl"
                            >
                                <h3 className="text-xl font-bold text-white mb-2">{election.title}</h3>
                                {election.description && (
                                    <p className="text-purple-200 text-sm mb-4 line-clamp-2">{election.description}</p>
                                )}
                                <div className="space-y-2 text-sm text-gray-300">
                                    <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                                        <span>Start:</span>
                                        <span className="font-medium text-white">{new Date(election.startTime).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                                        <span>End:</span>
                                        <span className="font-medium text-white">{new Date(election.endTime).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal for detail view */}
            {selectedElection && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-8 rounded-2xl shadow-2xl border border-purple-400/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6 border-b border-purple-500/30 pb-4">
                            <div>
                                <h2 className="text-3xl font-bold text-white">{selectedElection.title}</h2>
                                <p className="text-purple-300 mt-1 capitalize">{activeSection} Election</p>
                            </div>
                            <button 
                                onClick={closeDetails}
                                className="text-gray-400 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {detailsLoading ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                            </div>
                        ) : electionDetails ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-xl border border-purple-500/20">
                                        <p className="text-purple-300 text-sm">Total Candidates</p>
                                        <p className="text-3xl font-bold text-white mt-1">
                                            {electionDetails.candidates ? electionDetails.candidates.length : 0}
                                        </p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-purple-500/20">
                                        <p className="text-purple-300 text-sm">Total Votes Cast</p>
                                        <p className="text-3xl font-bold text-white mt-1">
                                            {getTotalVotes(electionDetails.candidates)}
                                        </p>
                                    </div>
                                </div>

                                {activeSection === "past" && electionDetails.candidates && electionDetails.candidates.length > 0 && (
                                    <div className="bg-yellow-500/20 border border-yellow-500/40 p-6 rounded-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-20">
                                            <svg className="w-24 h-24 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <h3 className="text-yellow-400 font-bold mb-2 flex items-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                            Election Winner
                                        </h3>
                                        <div className="flex items-center space-x-4 z-10 relative">
                                            {getWinner(electionDetails.candidates)?.imageUrl ? (
                                                <img 
                                                    src={getWinner(electionDetails.candidates).imageUrl} 
                                                    alt="Winner" 
                                                    className="w-16 h-16 rounded-full border-2 border-yellow-400 object-cover"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-full bg-yellow-600/50 flex items-center justify-center border-2 border-yellow-400 border-dashed">
                                                    <span className="text-yellow-200 text-xs">No img</span>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-2xl font-bold text-white">{getWinner(electionDetails.candidates)?.name}</p>
                                                <p className="text-yellow-200">{getWinner(electionDetails.candidates)?.party?.name || 'Independent'}</p>
                                                <p className="text-white mt-1 bg-black/30 inline-block px-2 py-0.5 rounded text-sm">
                                                    {getWinner(electionDetails.candidates)?.voteCount} votes
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">All Candidates</h3>
                                    <div className="space-y-3">
                                        {electionDetails.candidates && electionDetails.candidates.length > 0 ? (
                                            electionDetails.candidates.map((candidate, idx) => (
                                                <div key={candidate.id} className="flex items-center justify-between bg-black/20 p-4 rounded-lg border border-purple-500/10">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-8 flex justify-center text-purple-400 font-bold">
                                                            #{idx + 1}
                                                        </div>
                                                        {candidate.imageUrl ? (
                                                            <img 
                                                                src={candidate.imageUrl} 
                                                                alt={candidate.name} 
                                                                className="w-10 h-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300">
                                                                {candidate.name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-white font-medium">{candidate.name}</p>
                                                            <p className="text-purple-300 text-sm">{candidate.party?.name || 'Independent'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-white font-bold">{candidate.voteCount}</p>
                                                        <p className="text-purple-400 text-xs">votes</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-center py-4 bg-black/10 rounded-lg">No candidates registered for this election.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
