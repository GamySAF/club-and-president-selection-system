import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Search, 
  UserPlus, 
  X, 
  Trash2, 
  AlertCircle,
  Loader2,
  Award
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const ManageCandidates = () => {
  const { token } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // State for Adding Candidate
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/candidates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch candidates");
      setCandidates(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [token]);

  const addCandidate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/candidates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add candidate");
      }

      setNewName("");
      setIsAdding(false);
      fetchCandidates();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteCandidate = async (id) => {
    if (!window.confirm("Are you sure you want to remove this candidate?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/candidates/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete candidate");
      fetchCandidates();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredCandidates = candidates.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manage Candidates</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Add or remove presidential election nominees.</p>
          </div>
          
          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input 
                type="text"
                placeholder="Search candidates..."
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-4 focus:ring-indigo-100 outline-none w-full md:w-64 transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm ${
                isAdding 
                  ? "bg-white text-slate-600 border border-slate-200" 
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
              }`}
            >
              {isAdding ? <X className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {isAdding ? "Cancel" : "Add Nominee"}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Add Candidate Form */}
        {isAdding && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 animate-in slide-in-from-top-4">
            <form onSubmit={addCandidate} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-grow space-y-1.5 w-full">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Candidate Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter name..." 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all" 
                />
              </div>
              <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all w-full md:w-auto">
                Confirm
              </button>
            </form>
          </div>
        )}

        {/* List Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
              <p className="text-slate-500 font-medium">Loading nominees...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase w-16 text-center">#</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Candidate Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Votes</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredCandidates.map((c, index) => (
                    <tr key={c._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 text-center font-bold text-slate-400 text-sm">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Award className="h-4 w-4 text-amber-500" />
                          <span className="font-bold text-slate-800">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold text-xs border border-indigo-100">
                          {c.votes}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => deleteCandidate(c._id)} className="p-2 text-slate-300 hover:text-red-600 transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCandidates;