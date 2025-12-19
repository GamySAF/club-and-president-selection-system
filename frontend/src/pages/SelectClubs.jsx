import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Users, CheckCircle, Loader2, AlertCircle, PlusCircle, ShieldCheck } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const SelectClubs = () => {
  const { user, token, updateUser } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/student/all-clubs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setClubs(data);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load clubs list." });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async (clubId) => {
    setJoiningId(clubId);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API_URL}/api/student/clubs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clubIds: [clubId] }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If server says already joined, update UI anyway to stay in sync
        if (res.status === 400 && data.message.includes("already")) {
            const currentClubs = user?.selectedClubs || [];
            updateUser({ selectedClubs: [...currentClubs, clubId] });
        }
        throw new Error(data.message);
      }

      // Success: Update the AuthContext globally
      const updatedClubs = [...(user?.selectedClubs || []), clubId];
      updateUser({ selectedClubs: updatedClubs });

      setMessage({ type: "success", text: data.message });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setJoiningId(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Clubs & Societies</h1>
          <p className="text-slate-500 mt-2">Enhance your campus life by joining organizations.</p>
        </div>

        {message.text && (
          <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-bounce-short ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
          }`}>
            {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-bold text-sm">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => {
            // Check membership status by comparing IDs as strings
            const isMember = user?.selectedClubs?.some(id => id.toString() === club._id.toString());

            return (
              <div key={club._id} className={`group bg-white border rounded-[2rem] p-6 transition-all duration-300 ${
                isMember ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 hover:shadow-xl hover:-translate-y-1"
              }`}>
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${isMember ? "bg-emerald-100 text-emerald-600" : "bg-indigo-50 text-indigo-600"}`}>
                    <Users size={28} />
                  </div>
                  {isMember && (
                    <span className="bg-emerald-500 text-white p-1 rounded-full">
                      <ShieldCheck size={14} />
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 mb-2">{club.name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3">
                  {club.description || "Join this community to share interests, build networks, and participate in campus activities."}
                </p>

                <button
                  onClick={() => handleJoinClub(club._id)}
                  disabled={joiningId === club._id || isMember}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    isMember 
                      ? "bg-emerald-100 text-emerald-700 cursor-default" 
                      : "bg-slate-900 text-white hover:bg-indigo-600 shadow-lg shadow-slate-200"
                  }`}
                >
                  {joiningId === club._id ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : isMember ? (
                    <>
                      <CheckCircle size={18} />
                      Joined Member
                    </>
                  ) : (
                    <>
                      <PlusCircle size={18} />
                      Join Club
                    </>
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

export default SelectClubs;