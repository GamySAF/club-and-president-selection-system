import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserCircle, Loader2, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const StudentLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect immediately to prevent seeing login again
  useEffect(() => {
    if (user?.role === "student") {
      navigate("/student-dashboard", { replace: true });
    }
  }, [user, navigate]);

 const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/student/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Full Server Response:", data); // Check this in your browser console!

      if (!res.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      // Handle both flat and nested responses
      const actualUser = data.user ? data.user : data;
      const actualToken = data.token;

   

      // Convert to lowercase to be 100% sure the check passes
    // Replace your navigation logic with this:
if (actualUser.role?.toLowerCase() === "student") {
    console.log("Navigating to Student Dashboard...");
    navigate("/student-dashboard", { replace: true }); // Ensure the slash / is there
}

      login(actualUser, actualToken);
      navigate("/student-dashboard", { replace: true });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="p-8 pb-4 flex flex-col items-center">
          <div className="p-3 bg-indigo-50 rounded-2xl mb-4">
            <UserCircle className="text-indigo-600 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Student Portal</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Please sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 pt-4 space-y-4">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              required
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              required
            />
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-semibold animate-pulse">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-slate-200"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Validating...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Institutional Access Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;