import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Search, 
  PlusCircle, 
  X, 
  Trash2, 
  AlertCircle,
  Loader2,
  Flag,
  Edit3,
  Check
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const ManageClubs = () => {
  const { token } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Form States
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [clubName, setClubName] = useState("");

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/clubs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch clubs");
      setClubs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const method = editingId ? "PUT" : "POST";
    const endpoint = editingId 
      ? `${API_URL}/api/admin/clubs/${editingId}` 
      : `${API_URL}/api/admin/clubs`;

    try {
      const res = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: clubName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Action failed");
      }

      setClubName("");
      setIsAdding(false);
      setEditingId(null);
      fetchClubs();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteClub = async (id) => {
    if (!window.confirm("Are you sure you want to remove this club?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/clubs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete club");
      fetchClubs();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (club) => {
    setEditingId(club._id);
    setClubName(club.name);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelAction = () => {
    setIsAdding(false);
    setEditingId(null);
    setClubName("");
  };

  const filteredClubs = clubs.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manage Clubs</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Create and organize student organizations.</p>
          </div>
          
          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input 
                type="text"
                placeholder="Search clubs..."
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-4 focus:ring-emerald-100 outline-none w-full md:w-64 transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => isAdding ? cancelAction() : setIsAdding(true)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm ${
                isAdding 
                  ? "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50" 
                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
              }`}
            >
              {isAdding ? <X size={18} /> : <PlusCircle size={18} />}
              {isAdding ? "Cancel" : "Add Club"}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Form Section */}
        {isAdding && (
          <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-lg shadow-emerald-50 mb-8 animate-in slide-in-from-top-4 duration-300">
            <h2 className="text-sm font-bold text-emerald-600 uppercase mb-4">
              {editingId ? "Edit Club Details" : "Register New Club"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-grow space-y-1.5 w-full">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Club Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Coding Club" 
                  value={clubName} 
                  onChange={(e) => setClubName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-100 outline-none transition-all" 
                />
              </div>
              <button type="submit" className="bg-emerald-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all w-full md:w-auto flex items-center justify-center gap-2">
                {editingId ? <Check size={18} /> : null}
                {editingId ? "Update Club" : "Create Club"}
              </button>
            </form>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase w-16 text-center">#</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Club Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredClubs.map((club, index) => (
                    <tr key={club._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 text-center font-bold text-slate-400 text-sm">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-50 rounded-lg">
                            <Flag className="h-4 w-4 text-emerald-600" />
                          </div>
                          <span className="font-bold text-slate-800">{club.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => startEdit(club)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteClub(club._id)} 
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredClubs.length === 0 && !loading && (
                    <tr>
                      <td colSpan="3" className="px-6 py-10 text-center text-slate-400 italic">
                        No clubs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageClubs;