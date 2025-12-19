import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  UserPlus, 
  Flag, 
  BarChart3, 
  Shield, 
  ChevronRight,
  LogOut 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { label: "Manage Students", path: "/admin/manage-students", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Manage Candidates", path: "/admin/manage-candidates", icon: UserPlus, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Manage Clubs", path: "/admin/manage-clubs", icon: Flag, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "View Election Results", path: "/admin/results", icon: BarChart3, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
        
        {/* Compact Header: Reduced padding and margins */}
        <div className="p-8 pb-7 bg-slate-900">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-400/20">
                <Shield className="text-indigo-300 w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-none">Admin Console</h1>
                <p className="text-slate-400 text-[11px] mt-1 font-medium tracking-wide">SYSTEM OVERVIEW</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="p-2 bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Menu Items: Tighter spacing */}
        <div className="p-4 space-y-1.5">
          <nav>
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 ${item.bg} ${item.color} rounded-xl group-hover:scale-105 transition-transform`}>
                    <item.icon size={18} />
                  </div>
                  <span className="font-bold text-slate-700 text-sm">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transform group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </nav>
        </div>

        {/* Status Bar: Slimmer */}
        <div className="px-6 py-3 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live System</span>
          </div>
          <span className="text-[10px] font-black text-slate-300">v1.0.4</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;