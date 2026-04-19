import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import api from "../services/api";

// Use the newly deployed contract address
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// Minimal ABI to interact with our Voting contract
const VOTING_ABI = [
  "function vote(uint256 _electionId, uint256 _candidateId) public",
  "function hasUserVoted(uint256 _electionId, address _user) public view returns (bool)",
  "event VoteCast(address voter, uint electionId, uint candidateId)"
];

export default function Vote() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [election, setElection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [walletAddress, setWalletAddress] = useState("");
    const [votingStatus, setVotingStatus] = useState(null); // 'connecting', 'signing', 'saving', 'error', 'success'
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchElection = async () => {
            try {
                const response = await api.get(`/voter/elections/${id}`);
                setElection(response.data.election);
            } catch (err) {
                console.error("Error fetching election:", err);
                setErrorMessage("Failed to load election details.");
            } finally {
                setLoading(false);
            }
        };

        fetchElection();
    }, [id]);

    const handleVote = async (candidateId) => {
        setErrorMessage("");
        
        // 1. Check for MetaMask
        if (!window.ethereum) {
            setErrorMessage("MetaMask is not installed. Please install it to vote.");
            return;
        }

        try {
            setVotingStatus('connecting');
            
            // 2. Connect to MetaMask
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setWalletAddress(address);
            
            const contract = new ethers.Contract(CONTRACT_ADDRESS, VOTING_ABI, signer);
            
            // 3. Optional: Ensure the network is Localhost if we want strictness, 
            // but we'll assume they're connected to the right chain for this demo.

            // 4. Verify wallet hasn't already voted in this election on the smart contract
            const hasVotedOnChain = await contract.hasUserVoted(id, address);
            if (hasVotedOnChain) {
                setErrorMessage("Your connected wallet has already voted in this election!");
                setVotingStatus(null);
                return;
            }

            setVotingStatus('signing');

            // 5. Submit Transaction to Blockchain
            const tx = await contract.vote(id, candidateId);
            
            setVotingStatus('confirming');
            // Wait for transaction to be mined
            const receipt = await tx.wait();

            if (receipt.status !== 1) {
                throw new Error("Transaction failed on the blockchain.");
            }

            setVotingStatus('saving');

            // 6. Save vote to the Backend (Prisma DB)
            await api.post('/voter/vote', {
                electionId: parseInt(id),
                candidateId: parseInt(candidateId)
            });

            setVotingStatus('success');

            // 7. Redirect back to dashboard after a short delay
            setTimeout(() => {
                navigate("/dashboard");
            }, 3000);

        } catch (error) {
            console.error("Voting error:", error);
            // Handle user rejecting the transaction gracefully
            if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
                setErrorMessage("Transaction was cancelled.");
            } else {
                setErrorMessage(error?.response?.data?.message || error.message || "An error occurred during voting.");
            }
            setVotingStatus(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!election) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 p-4 text-center">
                <h1 className="text-3xl font-bold text-red-400 mb-2">Election Not Found</h1>
                <p className="text-indigo-200 mb-6">{errorMessage}</p>
                <button onClick={() => navigate("/dashboard")} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">Back to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 p-4 sm:p-8">
            <button 
                onClick={() => navigate("/dashboard")}
                className="mb-6 flex items-center text-indigo-300 hover:text-white transition"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Dashboard
            </button>
            
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-indigo-500/30 shadow-2xl mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">{election.title}</h1>
                    <p className="text-indigo-200 text-lg mb-6">{election.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="bg-white/5 px-4 py-2 rounded-lg border border-indigo-500/20 text-indigo-100">
                            <strong>Ends:</strong> {new Date(election.endTime).toLocaleString()}
                        </div>
                        {election.hasVoted && (
                            <div className="bg-green-600/20 px-4 py-2 rounded-lg border border-green-500/30 text-green-300 font-semibold flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                You have already voted via DB
                            </div>
                        )}
                    </div>
                </div>

                {errorMessage && (
                    <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 flex items-center">
                        <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {errorMessage}
                    </div>
                )}

                {votingStatus === 'success' && (
                    <div className="mb-8 p-6 bg-green-500/20 border border-green-500/50 rounded-xl text-center">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-green-300 mb-2">Vote Submitted Successfully!</h3>
                        <p className="text-green-100">Your vote has been indelibly recorded on the blockchain and the database.</p>
                        <p className="text-sm text-green-400 mt-4 animate-pulse">Redirecting to dashboard...</p>
                    </div>
                )}

                {!votingStatus && !election.hasVoted && election.isActive && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {election.candidates.map((candidate) => (
                            <div key={candidate.id} className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-indigo-500/30 hover:border-indigo-400/60 transition shadow-xl flex flex-col">
                                <div className="p-6 flex-grow text-center">
                                    {candidate.imageUrl ? (
                                        <img 
                                            src={candidate.imageUrl} 
                                            alt={candidate.name} 
                                            className="w-24 h-24 mx-auto rounded-xl mb-4 object-cover border-2 border-indigo-500/50 shadow-lg" 
                                        />
                                    ) : candidate.party?.logoUrl ? (
                                        <img 
                                            src={candidate.party.logoUrl} 
                                            alt={candidate.party.name} 
                                            className="w-20 h-20 mx-auto rounded-full mb-4 object-cover border-2 border-indigo-500/50" 
                                        />
                                    ) : (
                                        <div className="w-20 h-20 bg-indigo-600/50 mx-auto rounded-full mb-4 flex items-center justify-center border-2 border-indigo-500/50 text-white font-bold text-xl">
                                            {candidate.party?.name?.charAt(0) || '?'}
                                        </div>
                                    )}
                                    <h3 className="text-xl font-bold text-white mb-1">{candidate.name}</h3>
                                    <div className="flex items-center justify-center space-x-2 mb-3">
                                        {candidate.party?.logoUrl && !candidate.imageUrl && (
                                            <img src={candidate.party.logoUrl} alt="" className="w-5 h-5 rounded-full" />
                                        )}
                                        <p className="text-indigo-300 font-semibold">{candidate.party?.name}</p>
                                    </div>
                                    <p className="text-indigo-200 text-sm line-clamp-3 px-2">{candidate.bio || "No biography provided."}</p>
                                </div>
                                <div className="p-4 bg-black/20 border-t border-indigo-500/20">
                                    <button 
                                        onClick={() => handleVote(candidate.id)}
                                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-white rounded-xl shadow-lg transform transition hover:-translate-y-0.5"
                                    >
                                        Cast Vote
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {votingStatus && votingStatus !== 'success' && (
                    <div className="mb-8 p-8 bg-indigo-900/40 border border-indigo-500/50 rounded-2xl text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-500 mx-auto mb-6"></div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                            {votingStatus === 'connecting' && "Connecting to MetaMask..."}
                            {votingStatus === 'signing' && "Please confirm the transaction in MetaMask..."}
                            {votingStatus === 'confirming' && "Waiting for blockchain confirmation..."}
                            {votingStatus === 'saving' && "Securing vote in database..."}
                        </h3>
                        <p className="text-indigo-200">
                            {votingStatus === 'connecting' && "Approve the connection request in your browser extension."}
                            {votingStatus === 'signing' && "Review the gas fee and approve the transaction."}
                            {votingStatus === 'confirming' && "Your vote is being mined onto the local testnet. This might take a few seconds."}
                            {votingStatus === 'saving' && "Almost done! Syncing status with our systems."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
