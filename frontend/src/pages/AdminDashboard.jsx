// import React, { useState, useEffect } from "react";
// import { useAuth } from "../context/AuthContext";

// const AdminDashboard = () => {
//   const { user, token } = useAuth(); // Get admin token
//   const [students, setStudents] = useState([]);
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Fetch all students
//   const fetchStudents = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/admin/students", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Failed to fetch students");
//       setStudents(data);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   useEffect(() => {
//     fetchStudents();
//   }, []);

//   // Add a new student
//   const handleAddStudent = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     if (!name || !email || !password) {
//       setError("All fields are required");
//       setLoading(false);
//       return;
//     }

//     try {
//       const res = await fetch("http://localhost:5000/api/admin/students", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ name, email, password, role: "student" }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Failed to add student");

//       // Clear form
//       setName("");
//       setEmail("");
//       setPassword("");

//       // Refresh student list
//       fetchStudents();
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

//       <section className="mb-6">
//         <h2 className="text-xl font-semibold mb-2">Add Student</h2>
//         {error && <p className="text-red-500 mb-2">{error}</p>}
//         <form onSubmit={handleAddStudent} className="flex flex-col max-w-sm gap-2">
//           <input
//             type="text"
//             placeholder="Name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="p-2 border rounded"
//           />
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="p-2 border rounded"
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="p-2 border rounded"
//           />
//           <button
//             type="submit"
//             disabled={loading}
//             className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
//           >
//             {loading ? "Adding..." : "Add Student"}
//           </button>
//         </form>
//       </section>

//       <section>
//         <h2 className="text-xl font-semibold mb-2">All Students</h2>
//         <ul className="border rounded p-2">
//           {students.map((s) => (
//             <li key={s._id} className="p-1 border-b last:border-b-0">
//               {s.name} — {s.email}
//             </li>
//           ))}
//           {students.length === 0 && <p>No students added yet.</p>}
//         </ul>
//       </section>
//     </div>
//   );
// };

// export default AdminDashboard;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Admin Dashboard
        </h1>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/admin/manage-students")}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Manage Students
          </button>

          <button className="w-full bg-gray-400 text-white py-2 rounded cursor-not-allowed">
            Add Candidates
          </button>

          <button className="w-full bg-gray-400 text-white py-2 rounded cursor-not-allowed">
            Add Clubs
          </button>

          <button className="w-full bg-gray-400 text-white py-2 rounded cursor-not-allowed">
            View Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;





