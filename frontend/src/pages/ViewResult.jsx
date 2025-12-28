import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  BarChart3, Users, PieChart, 
  Loader2, RefreshCcw, Trophy, UserCheck, TrendingUp 
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const ViewResults = () => {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      let rawCandidates = [];
      let totalStudents = 0;
      let totalVoted = 0;

      if (Array.isArray(json)) {
        rawCandidates = json;
        totalVoted = json.reduce((sum, c) => sum + (c.votes || 0), 0);
        totalStudents = totalVoted;
      } else {
        rawCandidates = json.candidates || [];
        totalStudents = json.totalStudents || 0;
        totalVoted = json.totalVotes || json.totalVoted || 0;
      }

      const sortedCandidates = [...rawCandidates].sort((a, b) => b.votes - a.votes);
      
      setData({
        totalStudents,
        totalVoted,
        candidates: sortedCandidates
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (token) fetchResults(); 
  }, [token]);

  if (loading && !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-bold animate-pulse">Calculating Live Tallies...</p>
      </div>
    );
  }

  const turnoutPercentage = data?.totalStudents > 0 
    ? Math.round((data.totalVoted / data.totalStudents) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-xs font-black text-red-500 uppercase tracking-widest">Live Updates</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Election Results</h1>
            <p className="text-slate-500 font-medium">Monitoring {data?.candidates?.length} candidates across campus.</p>
          </div>
          <button 
            onClick={fetchResults} 
            className="group flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <RefreshCcw size={18} className={`${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            <span className="font-bold text-sm">Refresh Data</span>
          </button>
        </div>

        {/* Visual Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard 
            icon={<Users size={24}/>} 
            label="Eligible Students" 
            value={data?.totalStudents} 
            color="blue" 
          />
          <StatCard 
            icon={<UserCheck size={24}/>} 
            label="Total Votes Cast" 
            value={data?.totalVoted} 
            color="emerald" 
          />
          <StatCard 
            icon={<PieChart size={24}/>} 
            label="Voter Turnout" 
            value={`${turnoutPercentage}%`} 
            color="purple" 
            progress={turnoutPercentage}
          />
        </div>

        {/* Candidate Standings Section */}
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <TrendingUp className="text-indigo-600" /> Current Rankings
            </h2>
        </div>

        {/* Updated Circular Ranking Grid with Logic Fix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.candidates?.map((c, index) => {
            const denominator = data.totalVoted || 0;
            const percentage = denominator > 0 ? (c.votes / denominator) * 100 : 0;
            
            // Logic to handle Ties and Zero-vote states
            const topVoteCount = data.candidates[0]?.votes || 0;
            // A candidate is a "clean" leader only if they have > 0 votes and are the only one with the top count
            const isTopCandidate = c.votes === topVoteCount && c.votes > 0;
            const isTie = data.candidates.filter(cand => cand.votes === topVoteCount).length > 1;
            const isUniqueLeader = isTopCandidate && !isTie;

            // SVG Circle math
            const radius = 36;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (percentage / 100) * circumference;

            return (
              <div 
                key={c._id} 
                className={`relative bg-white border-2 p-6 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${
                  isUniqueLeader ? "border-indigo-500 ring-4 ring-indigo-50" : "border-slate-100"
                }`}
              >
                {/* Rank Badge - Dynamically changes based on state */}
                <div className={`absolute -top-3 left-6 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                    isUniqueLeader ? "bg-indigo-600 text-white" : "bg-slate-900 text-white"
                }`}>
                    {isUniqueLeader ? "🏆 Leading" : (isTie && isTopCandidate) ? "🤝 Draw" : `Rank #${index + 1}`}
                </div>

                <div className="flex flex-col items-center text-center mt-2">
                  {/* Circular Progress Ring */}
                  <div className="relative mb-4 flex items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48" cy="48" r={radius}
                        stroke="currentColor" strokeWidth="8"
                        fill="transparent" className="text-slate-100"
                      />
                      <circle
                        cx="48" cy="48" r={radius}
                        stroke="currentColor" strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        style={{ 
                            strokeDashoffset, 
                            transition: 'stroke-dashoffset 1.5s ease-in-out' 
                        }}
                        strokeLinecap="round"
                        className={isUniqueLeader ? "text-indigo-600" : "text-slate-400"}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-slate-900">{Math.round(percentage)}%</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase leading-none">Share</span>
                    </div>
                  </div>

                  {/* Candidate Details */}
                  <h3 className="text-lg font-black text-slate-900 truncate w-full px-2">{c.name}</h3>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter mb-4">{c.party}</p>

                  {/* Vote Pill */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                    <span className="text-lg font-black text-slate-900">{c.votes}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Votes</span>
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

// Reusable Small Component for Stats
const StatCard = ({ icon, label, value, color, progress }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
        purple: "bg-purple-50 text-purple-600"
    };

    return (
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-colors">
            <div className="relative z-10 flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${colors[color]}`}>{icon}</div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                    <h3 className="text-3xl font-black text-slate-900">{value}</h3>
                </div>
            </div>
            {progress !== undefined && (
                <div className="absolute bottom-0 left-0 h-1 bg-purple-100 w-full">
                    <div 
                        className="h-full bg-purple-500 transition-all duration-1000" 
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
};

export default ViewResults;