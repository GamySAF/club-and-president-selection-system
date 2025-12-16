import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
const API_URL = import.meta.env.VITE_API_URL;

const ManageStudents = () => {
  const { token } = useAuth(); // always valid token
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Fetch students
  const fetchStudents = async () => {
    setLoading(true);
    try {
       const res = await fetch(`${API_URL}/api/admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch students");
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [token]);

  // Edit student
  const startEdit = (student) => {
    setEditingId(student._id);
    setEditName(student.name);
    setEditEmail(student.email);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditEmail("");
  };

  const updateStudent = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/students/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName, email: editEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update student");
      cancelEdit();
      fetchStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  // Deletes student
  const deleteStudent = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/students/${id}`, {
      method: "DELETE",
       headers: { Authorization: `Bearer ${token}` },
});
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete student");
      fetchStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Students</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="border rounded p-2">
          {students.map((s) => (
            <li key={s._id} className="flex justify-between items-center p-2 border-b last:border-b-0">
              {editingId === s._id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="p-1 border rounded"
                  />
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="p-1 border rounded"
                  />
                  <button onClick={() => updateStudent(s._id)} className="bg-green-600 text-white px-2 rounded">
                    Save
                  </button>
                  <button onClick={cancelEdit} className="bg-gray-500 text-white px-2 rounded">
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span>{s.name} — {s.email}</span>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(s)} className="bg-yellow-500 text-white px-2 rounded">Edit</button>
                    <button onClick={() => deleteStudent(s._id)} className="bg-red-600 text-white px-2 rounded">Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
          {students.length === 0 && <p>No students found.</p>}
        </ul>
      )}
    </div>
  );
};

export default ManageStudents;
