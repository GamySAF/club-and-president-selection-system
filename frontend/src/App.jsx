import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import StudentLogin from "./pages/StudentLogin";
import AdminLogin from "./pages/AdminLogin";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import ManageStudents from "./pages/ManageStudent";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<StudentLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* STUDENT DASHBOARD - protected */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* ADMIN DASHBOARD - protected */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

            {/* MANAGE STUDENTS - protected */}
  <Route
    path="/admin/manage-students"
    element={
      <ProtectedRoute role="admin">
        <ManageStudents />
      </ProtectedRoute>
    }
  />
          

          {/* OPTIONAL: catch all / redirect to login */}
          <Route path="*" element={<StudentLogin />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
