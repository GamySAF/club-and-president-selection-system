import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react"; // Matching style icons

const API_URL = import.meta.env.VITE_API_URL;

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin-dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Invalid administrative credentials");
      }

      login(data.user, data.token);
      navigate("/admin-dashboard", { replace: true });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff1f2] p-4"> {/* Light red background */}
      <div className="w-full max-w-md bg-white rounded-[2.5rem] border border-red-100 shadow-xl shadow-red-50 overflow-hidden">
        
        {/* Header Section */}
        <div className="p-8 pb-4 flex flex-col items-center">
          <div className="p-3 bg-red-50 rounded-2xl mb-4">
            <ShieldCheck className="text-red-600 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Console</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Secure Administrative Access</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 pt-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Admin Email
            </label>
            <input
              type="email"
              placeholder="admin@system.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Secret Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-semibold animate-pulse">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-red-700 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-red-200"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Authenticating...
              </>
            ) : (
              "Authorize Login"
            )}
          </button>
        </form>

        <div className="p-6 bg-red-50/30 border-t border-red-50 text-center">
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
            High-Level Security Protocol Active
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;