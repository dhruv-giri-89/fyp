import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import api from "../services/api";

const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const VOTING_ABI = [
  "function getVotes(uint256 _electionId, uint256 _candidateId) public view returns (uint256)"
];
// Optional: Use a public JSON-RPC node instead of requiring MetaMask for read-only!
const HTTP_PROVIDER_URL = "http://127.0.0.1:8545"; 

export default function Results() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [election, setElection] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [totalVotes, setTotalVotes] = useState(0);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                // 1. Fetch Election Data from Database
                const response = await api.get(`/voter/elections/${id}`);
                const electionData = response.data.election;
                setElection(electionData);

                // 2. Fetch Verified Votes from Blockchain
                const provider = new ethers.JsonRpcProvider(HTTP_PROVIDER_URL);
                const contract = new ethers.Contract(CONTRACT_ADDRESS, VOTING_ABI, provider);

                // Map through candidates and fetch their blockchain tally
                let tallySum = 0;
                const enrichedCandidates = await Promise.all(
                    electionData.candidates.map(async (candidate) => {
                        let blockchainVotes = 0;
                        try {
                            const votesBigInt = await contract.getVotes(id, candidate.id);
                            blockchainVotes = Number(votesBigInt);
                        } catch (err) {
                            console.error(`Failed to fetch on-chain votes for candidate ${candidate.id}`, err);
                        }

                        tallySum += blockchainVotes;

                        return {
                            ...candidate,
                            blockchainVotes,
                            // Fallback to database votes if blockchain is somehow unreachable
                            displayedVotes: Math.max(blockchainVotes, candidate.voteCount || 0)
                        };
                    })
                );

                // Sort by highest votes first
                enrichedCandidates.sort((a, b) => b.displayedVotes - a.displayedVotes);
                
                setTotalVotes(tallySum);
                setResults(enrichedCandidates);

            } catch (err) {
                console.error("Error fetching results:", err);
                setErrorMessage("Failed to load election results.");
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="ml-4 text-indigo-300 font-semibold tracking-wider animate-pulse">Syncing with Blockchain...</p>
            </div>
        );
    }

    if (!election) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 p-4 text-center">
                <h1 className="text-3xl font-bold text-red-400 mb-2">Results Not Found</h1>
                <p className="text-indigo-200 mb-6">{errorMessage}</p>
                <button onClick={() => navigate("/dashboard")} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">Back to Dashboard</button>
            </div>
        );
    }

    const isActive = new Date() >= new Date(election.startTime) && new Date() <= new Date(election.endTime);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 p-4 sm:p-8">
            <button 
                onClick={() => navigate("/dashboard")}
                className="mb-8 flex items-center text-indigo-300 hover:text-white transition font-medium"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Dashboard
            </button>
            
            <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
                {/* Left Column: Election Details */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-indigo-500/30 shadow-2xl">
                        <div className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                            Election Results
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-4 leading-tight">{election.title}</h1>
                        <p className="text-indigo-200 mb-8 leading-relaxed text-sm">{election.description}</p>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
                                <span className="text-indigo-300 text-sm">Status</span>
                                <span className={`font-bold ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                                    {isActive ? 'Ongoing' : 'Concluded'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
                                <span className="text-indigo-300 text-sm">Total Votes</span>
                                <span className="font-bold text-white text-xl">{totalVotes}</span>
                            </div>
                        </div>
                        
                        <div className="mt-8 flex items-center p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                            <svg className="w-8 h-8 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="text-xs text-green-200">
                                Results displayed here are independently verified purely through our decentralized smart contract counting system.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Leaderboard */}
                <div className="w-full lg:w-2/3">
                    <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-indigo-500/30 shadow-2xl h-full">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <svg className="w-6 h-6 mr-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            Leaderboard
                        </h2>
                        
                        <div className="space-y-4">
                            {results.map((candidate, index) => {
                                const percentage = totalVotes > 0 ? ((candidate.displayedVotes / totalVotes) * 100).toFixed(1) : 0;
                                const isWinner = index === 0 && candidate.displayedVotes > 0;
                                
                                return (
                                    <div key={candidate.id} className={`p-5 rounded-2xl border transition-all duration-300 ${isWinner ? 'bg-gradient-to-r from-indigo-600/40 to-purple-600/40 border-indigo-400/60 shadow-[0_0_20px_rgba(99,102,241,0.2)] scale-[1.02]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                                        <div className="flex items-center gap-4 mb-4">
                                            {/* Rank Badge */}
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${isWinner ? 'bg-yellow-400 text-yellow-900' : 'bg-slate-700 text-slate-300'}`}>
                                                #{index + 1}
                                            </div>
                                            
                                            {/* Candidate Info */}
                                            <div className="flex-grow">
                                                <div className="flex items-center space-x-3">
                                                    {candidate.imageUrl && (
                                                        <img 
                                                            src={candidate.imageUrl} 
                                                            alt={candidate.name} 
                                                            className="w-12 h-12 rounded-full object-cover border border-indigo-500/30" 
                                                        />
                                                    )}
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                            {candidate.name}
                                                            {isWinner && (
                                                                <svg className="w-5 h-5 text-yellow-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" /></svg>
                                                            )}
                                                        </h3>
                                                        <p className="text-indigo-300 text-sm">{candidate.party?.name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Vote Count */}
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-white">{candidate.displayedVotes}</div>
                                                <div className="text-xs text-indigo-300 uppercase tracking-wider">Votes</div>
                                            </div>
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${isWinner ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-right mt-1">
                                            <span className="text-xs font-semibold text-indigo-200">{percentage}%</span>
                                        </div>
                                    </div>
                                );
                            })}

                            {results.length === 0 && (
                                <div className="text-center py-12 text-indigo-300">
                                    No candidates found for this election.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
