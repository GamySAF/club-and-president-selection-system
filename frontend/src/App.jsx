import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import StudentLogin from "./pages/StudentLogin";
import AdminLogin from "./pages/AdminLogin";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import ManageStudents from "./pages/ManageStudent";
import ManageCandidates from "./pages/ManageCandidates";
import ManageClubs from "./pages/ManageClubs";
import ViewResults from "./pages/ViewResult";

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

   <Route
  path="/admin/manage-candidates"
  element={
    <ProtectedRoute role="admin">
      <ManageCandidates />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/manage-clubs"
  element={
    <ProtectedRoute role="admin">
      <ManageClubs />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/results"
  element={
    <ProtectedRoute role="admin">
      <ViewResults />
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
