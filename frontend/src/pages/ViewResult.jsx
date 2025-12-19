import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  BarChart3, 
  Users, 
  CheckCircle2, 
  PieChart,
  Loader2,
  RefreshCcw,
  Trophy
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const ViewResults = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to fetch results");
      
      // Sort candidates by votes (highest first)
      const sortedCandidates = json.candidates.sort((a, b) => b.votes - a.votes);
      setData({ ...json, candidates: sortedCandidates });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [token]);

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
      </div>
    );
  }

  const turnoutPercentage = data?.totalStudents > 0 
    ? Math.round((data.totalVoted / data.totalStudents) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <BarChart3 className="text-purple-600" /> Election Analytics
            </h1>
            <p className="text-slate-500 font-medium mt-1">Live overview of voting participation and results.</p>
          </div>
          <button 
            onClick={fetchResults}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-600 shadow-sm"
          >
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users /></div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase">Total Students</p>
                <h3 className="text-2xl font-black text-slate-800">{data?.totalStudents}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 /></div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase">Votes Cast</p>
                <h3 className="text-2xl font-black text-slate-800">{data?.totalVoted}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><PieChart /></div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase">Turnout %</p>
                <h3 className="text-2xl font-black text-slate-800">{turnoutPercentage}%</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Results Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Trophy className="text-amber-500" size={20} /> Presidential Standings
            </h2>
          </div>
          
          <div className="p-8 space-y-8">
            {data?.candidates.map((c, index) => {
              const percentage = data.totalVoted > 0 ? (c.votes / data.totalVoted) * 100 : 0;
              
              return (
                <div key={c._id} className="relative">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className={`text-xs font-black px-2 py-1 rounded mr-2 ${index === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                        {index === 0 ? "LEADER" : `RANK ${index + 1}`}
                      </span>
                      <span className="font-bold text-slate-700">{c.name}</span>
                    </div>
                    <span className="font-black text-slate-900">{c.votes} <span className="text-slate-400 text-sm font-normal">votes</span></span>
                  </div>
                  
                  {/* Progress Bar Container */}
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${index === 0 ? 'bg-purple-600' : 'bg-indigo-400'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}

            {data?.candidates.length === 0 && (
              <p className="text-center text-slate-400 py-10 italic">No candidates registered yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewResults;