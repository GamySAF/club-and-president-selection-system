import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  CheckSquare, 
  Users2, 
  BarChart3, 
  UserCircle, 
  ChevronRight,
  LogOut 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // If student has already voted, we use this to disable the voting button
  const hasVoted = user?.hasVoted || false;

  const menuItems = [
    { 
      label: "Vote for President", 
      path: "/student/vote", 
      icon: CheckSquare, 
      color: "text-blue-600", 
      bg: "bg-blue-50",
   // Button is disabled if they have already voted
      desc: hasVoted ? "Ballot Submitted" : "Cast your vote now"
    },
    { 
      label: "Select Clubs", 
      path: "/student/clubs", 
      icon: Users2, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50",
      desc: "Join campus organizations"
    },
    { 
      label: "View Results", 
      path: "/student/results", // ✅ FIXED: Point to the student results route
      icon: BarChart3, 
      color: "text-purple-600", 
      bg: "bg-purple-50",
      desc: "Live election standings"
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
        
        {/* Student Header */}
        <div className="p-8 pb-7 bg-slate-900">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-400/20">
                <UserCircle className="text-blue-300 w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-none">Student Portal</h1>
                <p className="text-slate-400 text-[11px] mt-1 font-medium tracking-wide uppercase">
                  {user?.name || "Student"}
                </p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="p-2 bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-all"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Action Menu */}
        <div className="p-4 space-y-1.5">
          <nav>
            {menuItems.map((item) => (
              <button
                key={item.path}
                disabled={item.disabled}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border border-transparent transition-all group ${
                  item.disabled 
                    ? "opacity-60 cursor-not-allowed bg-slate-50" 
                    : "hover:border-slate-100 hover:bg-slate-50 active:scale-[0.98]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 ${item.bg} ${item.color} rounded-xl group-hover:scale-105 transition-transform`}>
                    <item.icon size={18} />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-slate-700 text-sm block">{item.label}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{item.desc}</span>
                  </div>
                </div>
                {!item.disabled && (
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transform group-hover:translate-x-0.5 transition-all" />
                )}
                {item.disabled && (
                   <CheckSquare className="w-4 h-4 text-emerald-500" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/50 flex flex-col items-center border-t border-slate-100">
            {hasVoted ? (
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-wider">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                Ballot Verified & Secured
              </div>
            ) : (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                System Status: Voting Open
              </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;