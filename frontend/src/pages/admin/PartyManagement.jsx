import { useState, useEffect } from "react";
import api from "../../services/api";

export default function PartyManagement() {
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedParty, setSelectedParty] = useState(null);
    const [partyDetails, setPartyDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        fetchParties();
    }, []);

    const fetchParties = async () => {
        setLoading(true);
        try {
            const response = await api.get("/parties");
            setParties(response.data.parties || []);
        } catch (err) {
            console.error("Error fetching parties:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePartyClick = async (party) => {
        setSelectedParty(party);
        setDetailsLoading(true);
        try {
            const response = await api.get(`/parties/${party.id}`);
            setPartyDetails(response.data.party);
        } catch (err) {
            console.error("Error fetching party details:", err);
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeDetails = () => {
        setSelectedParty(null);
        setPartyDetails(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Registered Parties</h2>
                <div className="bg-purple-900/30 text-purple-200 px-4 py-2 rounded-lg border border-purple-500/30 text-sm">
                    {parties.length} Total
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-6 gap-4">
                    {parties.length === 0 ? (
                        <div className="col-span-full bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-purple-500/20 text-center">
                            <p className="text-purple-200">No parties found.</p>
                        </div>
                    ) : (
                        parties.map((party) => (
                            <div 
                                key={party.id} 
                                onClick={() => handlePartyClick(party)}
                                className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-purple-500/30 cursor-pointer hover:bg-white/20 transition hover:scale-105 transform duration-200 shadow-xl flex items-center space-x-4"
                            >
                                {party.logoUrl ? (
                                    <img 
                                        src={party.logoUrl} 
                                        alt={party.name} 
                                        className="w-16 h-16 rounded-full object-cover border-2 border-purple-400"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300 border-2 border-purple-500/30 text-xl font-bold">
                                        {party.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-xl font-bold text-white">{party.name}</h3>
                                    <p className="text-purple-300 text-sm mt-1">{party._count?.candidates || 0} Candidates</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal for detail view */}
            {selectedParty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-8 rounded-2xl shadow-2xl border border-purple-400/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6 border-b border-purple-500/30 pb-4">
                            <div className="flex items-center space-x-4">
                                {selectedParty.logoUrl ? (
                                    <img 
                                        src={selectedParty.logoUrl} 
                                        alt={selectedParty.name} 
                                        className="w-16 h-16 rounded-lg object-cover border-2 border-purple-400"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-purple-600/30 flex items-center justify-center text-purple-300 border-2 border-purple-500/30 text-2xl font-bold">
                                        {selectedParty.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-3xl font-bold text-white">{selectedParty.name}</h2>
                                    <p className="text-purple-300 mt-1">Party Information</p>
                                </div>
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
                        ) : partyDetails ? (
                            <div className="space-y-6">
                                {partyDetails.description && (
                                    <div className="bg-white/5 p-4 rounded-xl border border-purple-500/20">
                                        <h3 className="text-purple-300 text-sm mb-2">Description</h3>
                                        <p className="text-white text-sm leading-relaxed">{partyDetails.description}</p>
                                    </div>
                                )}
                                
                                <div className="bg-white/5 p-4 rounded-xl border border-purple-500/20">
                                    <p className="text-purple-300 text-sm">Total Tracked Candidates</p>
                                    <p className="text-3xl font-bold text-white mt-1">
                                        {partyDetails.candidates ? partyDetails.candidates.length : 0}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">Registered Candidates</h3>
                                    <div className="space-y-3">
                                        {partyDetails.candidates && partyDetails.candidates.length > 0 ? (
                                            partyDetails.candidates.map((candidate) => (
                                                <div key={candidate.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-black/20 p-4 rounded-lg border border-purple-500/10">
                                                    <div className="flex items-center space-x-4 mb-3 sm:mb-0">
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
                                                            {candidate.election && (
                                                                <p className="text-purple-300 text-xs mt-0.5 max-w-[200px] truncate" title={candidate.election.title}>
                                                                    {candidate.election.title}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-left sm:text-right bg-white/5 p-2 rounded w-fit sm:w-auto">
                                                        <p className="text-white font-bold">{candidate.voteCount || 0}</p>
                                                        <p className="text-purple-400 text-xs">votes gained</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-center py-4 bg-black/10 rounded-lg">No candidates registered for this party yet.</p>
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
