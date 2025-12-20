import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Loader2, ShieldCheck, ArrowLeft, Star, CheckCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const VotePresident = () => {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState(null);

  // ✅ FIX 1: Convert to string immediately to avoid comparison errors
  const hasVoted = user?.hasVoted;
  const votedForId = user?.votedFor?.toString(); 

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch(`${API_URL}/api/student/candidates`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCandidates(data);
      } catch (err) {
        console.error("Failed to load candidates", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [token]);

  const handleVote = async (candidateId) => {
    if (!window.confirm("Confirm your vote? This cannot be undone.")) return;
    setVotingId(candidateId);

    try {
      const res = await fetch(`${API_URL}/api/student/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ candidateId }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ FIX 2: Use the data returned from your updated backend
        updateUser({ 
          hasVoted: true, 
          votedFor: candidateId 
        });
        
        alert("Vote Cast Successfully!");
        // We don't necessarily need window.location.reload() if updateUser is working properly,
        // but it acts as a good safety net.
        window.location.reload(); 
      } else {
        alert(data.message || "Voting failed");
      }
    } catch (err) {
      alert("Connection error. Try again.");
    } finally {
      setVotingId(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-end mb-10">
          <div>
            <button onClick={() => navigate("/student-dashboard")} className="flex items-center gap-2 text-slate-500 font-bold mb-2 hover:text-blue-600 transition-colors">
              <ArrowLeft size={18} /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Presidential Election</h1>
          </div>
          {hasVoted && (
            <div className="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-100 font-bold animate-in fade-in zoom-in">
              <ShieldCheck size={18} /> Selection Confirmed
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {candidates.map((candidate) => {
            // ✅ FIX 3: Robust ID comparison using .toString()
            const isSelected = votedForId === candidate._id.toString();

            return (
              <div 
                key={candidate._id} 
                className={`relative p-8 rounded-[2.5rem] border-4 transition-all duration-500 bg-white ${
                  isSelected 
                    ? "border-blue-600 scale-[1.03] shadow-2xl z-10" 
                    : hasVoted 
                    ? "border-slate-50 opacity-40 grayscale" 
                    : "border-slate-100 hover:border-blue-200 shadow-sm"
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 shadow-xl animate-bounce">
                    <Star size={12} fill="white" /> Your Choice
                  </div>
                )}

                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                  isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                }`}>
                  <User size={32} />
                </div>

                <h3 className={`text-xl font-bold mb-1 ${isSelected ? "text-blue-600" : "text-slate-900"}`}>
                  {candidate.name}
                </h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">
                  {candidate.party || "Guild Candidate"}
                </p>

                <button
                  onClick={() => handleVote(candidate._id)}
                  disabled={hasVoted || votingId}
                  className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    isSelected 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                      : hasVoted 
                      ? "bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200" 
                      : "bg-slate-900 text-white hover:bg-blue-600 active:scale-95"
                  }`}
                >
                  {votingId === candidate._id ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : isSelected ? (
                    <><CheckCircle size={16}/> Selected</>
                  ) : hasVoted ? (
                    "Locked"
                  ) : (
                    "Cast Vote"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VotePresident;