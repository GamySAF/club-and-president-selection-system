import React from "react";
import { useAuth } from "../context/AuthContext";

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
      <p>Welcome, {user.email}</p>
      <button
        onClick={logout}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Logout
      </button>
    </div>
  );
};

export default StudentDashboard;
