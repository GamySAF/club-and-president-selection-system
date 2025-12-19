import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  BarChart3, Users, CheckCircle2, PieChart, 
  Loader2, RefreshCcw, Trophy, UserCheck 
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const ViewResults = () => {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === "admin";

const fetchResults = async () => {
  setLoading(true);
  try {
    const endpoint = isAdmin ? "/api/admin/results" : "/api/student/results";
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    
    if (!res.ok) throw new Error(json.message || "Failed to fetch");

    // ✅ THE FIX: Check if candidates exists and is an array
    let rawCandidates = [];
    
    if (json.candidates && Array.isArray(json.candidates)) {
      rawCandidates = json.candidates;
    } else if (Array.isArray(json)) {
      rawCandidates = json;
    }

    const sortedCandidates = [...rawCandidates].sort((a, b) => b.votes - a.votes);
    
    // Set data while preserving the stats (totalStudents, etc)
    setData({
      totalStudents: json.totalStudents || 0,
      totalVoted: json.totalVoted || 0,
      candidates: sortedCandidates
    });

  } catch (err) {
    console.error("Fetch error:", err.message);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => { fetchResults(); }, [token]);

  if (loading && !data) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
    </div>
  );

  const turnoutPercentage = data?.totalStudents > 0 
    ? Math.round((data.totalVoted / data.totalStudents) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Election Live Results</h1>
            <p className="text-slate-500 font-medium">Real-time voting statistics and candidate standings.</p>
          </div>
          <button onClick={fetchResults} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 shadow-sm">
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Global Stats Grid (Visible to All) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Users size={28}/></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Eligible Students</p>
              <h3 className="text-3xl font-black text-slate-900">{data?.totalStudents}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><UserCheck size={28}/></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Votes Cast</p>
              <h3 className="text-3xl font-black text-slate-900">{data?.totalVoted}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><PieChart size={28}/></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Voter Turnout</p>
              <h3 className="text-3xl font-black text-slate-900">{turnoutPercentage}%</h3>
            </div>
          </div>
        </div>

        {/* Candidate Boxes Grid */}
      {/* Candidate Boxes Grid */}
<h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
  <Trophy className="text-amber-500" /> Candidate Standings
</h2>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {data?.candidates?.map((c, index) => {
    // 1. Calculate the sum of all votes to ensure the percentage is accurate
    // We use data.totalVoted, but as a backup, we calculate it from the array
    const totalVotesInArray = data.candidates.reduce((sum, cand) => sum + cand.votes, 0);
    const denominator = data.totalVoted || totalVotesInArray;
    
    // 2. Calculate percentage
    const percentage = denominator > 0 
      ? (c.votes / denominator) * 100 
      : 0;

    return (
      <div 
        key={`${c._id}-${c.votes}`} // ✅ Changing key forces React to re-animate the bar on vote change
        className={`relative bg-white border-2 p-6 rounded-[2.5rem] transition-all duration-500 ${
          index === 0 ? "border-indigo-500 ring-4 ring-indigo-50 shadow-lg" : "border-slate-100 hover:border-slate-300"
        }`}
      >
        {index === 0 && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1 shadow-md">
            <Trophy size={12} /> Leading
          </div>
        )}
        
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 leading-tight">{c.name}</h3>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">{c.party}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-slate-900">{c.votes}</span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Votes</p>
          </div>
        </div>

        {/* Box Progress Bar Section */}
        <div className="mt-6">
          <div className="flex justify-between text-[11px] font-black uppercase mb-2">
            <span className="text-slate-500">Vote Share</span>
            <span className="text-indigo-600 font-bold">{percentage.toFixed(1)}%</span>
          </div>
          
          {/* Progress Track */}
          <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                index === 0 
                  ? "bg-gradient-to-r from-indigo-500 to-indigo-700" 
                  : "bg-slate-400"
              }`}
              // ✅ Inline style must use the percentage variable
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    );
  })}
</div>
        
        
      </div>
    </div>
  );
};

export default ViewResults;