import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { CheckCircle, User, Loader2, AlertCircle, ShieldCheck, Info } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const VotePresident = () => {
  const { user, token, updateUser } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      // Endpoint to get all presidential candidates
      const res = await fetch(`${API_URL}/api/student/candidates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCandidates(data);
    } catch (err) {
      setMessage({ type: "error", text: "Could not load candidates list." });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (candidateId) => {
    if (!window.confirm("Final Confirmation: You can only vote once per election. Proceed?")) return;

    setVotingId(candidateId);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API_URL}/api/student/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ candidateId }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);

      // 1. Update the local AuthContext state immediately
      updateUser({ hasVoted: true });
      
      // 2. Show success message
      setMessage({ type: "success", text: `Your vote for ${data.message.split('for ')[1] || 'your candidate'} has been recorded!` });
      
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setVotingId(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-slate-500 font-medium tracking-wide">Loading Ballot...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Presidential Election</h1>
          <p className="text-slate-500 mt-2 text-lg">Every vote counts. Make your choice for the next academic year.</p>
        </div>

        {/* Status Alerts */}
        {user?.hasVoted && (
          <div className="mb-8 p-5 bg-indigo-50 border border-indigo-100 rounded-[2rem] flex items-center gap-4">
            <div className="p-2 bg-indigo-600 rounded-full text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="font-bold text-indigo-900">Voting Completed</p>
              <p className="text-indigo-700 text-sm">You have already cast your ballot for this election cycle.</p>
            </div>
          </div>
        )}

        {message.text && (
          <div className={`mb-8 p-5 rounded-[2rem] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            message.type === "success" 
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
              : "bg-rose-50 text-rose-700 border border-rose-100"
          }`}>
            {message.type === "success" ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            <span className="font-bold">{message.text}</span>
          </div>
        )}

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {candidates.map((candidate) => (
            <div key={candidate._id} className={`group relative bg-white border rounded-[2.5rem] p-8 transition-all duration-300 ${
              user?.hasVoted ? "border-slate-100 opacity-80" : "border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300"
            }`}>
              <div className="flex items-start justify-between mb-6">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors">
                  <User size={40} />
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    Candidate
                  </span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-1">{candidate.name}</h3>
              <p className="text-indigo-600 font-semibold mb-4">{candidate.party || "University Guild"}</p>
              
              <div className="bg-slate-50 rounded-2xl p-4 mb-8">
                <p className="text-slate-600 text-sm leading-relaxed italic">
                  "{candidate.manifesto || "Promising a better campus experience for every student through innovation and transparency."}"
                </p>
              </div>

              <button
                onClick={() => handleVote(candidate._id)}
                disabled={votingId || user?.hasVoted}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  user?.hasVoted 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    : "bg-slate-900 text-white hover:bg-indigo-600 active:scale-95 shadow-lg shadow-slate-200"
                }`}
              >
                {votingId === candidate._id ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : user?.hasVoted ? (
                  <>
                    <ShieldCheck size={18} />
                    Ballot Submitted
                  </>
                ) : (
                  "Select Candidate"
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VotePresident;