import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Search, 
  UserPlus, 
  X, 
  User, 
  Mail, 
  Lock, 
  Edit2, 
  Trash2, 
  Check, 
  AlertCircle,
  Loader2,
  UserCheck
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const ManageStudents = () => {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search State
  const [searchTerm, setSearchTerm] = useState("");

  // State for Adding Student
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // State for Editing Student
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch students");

      const filteredData = data.filter(user => user.role !== "admin");
      setStudents(filteredData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [token]);

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addStudent = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          name: newName, 
          email: newEmail, 
          password: newPassword 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add student");

      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setIsAdding(false);
      fetchStudents();
    } catch (err) {
      setError(err.message);
    }
  };

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
      if (!res.ok) throw new Error("Failed to update student");
      cancelEdit();
      fetchStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/students/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete student");
      fetchStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Directory</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Manage, add, and monitor student accounts.</p>
          </div>
          
          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input 
                type="text"
                placeholder="Search students..."
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none w-full md:w-72 transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm whitespace-nowrap text-sm ${
                isAdding 
                  ? "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50" 
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
              }`}
            >
              {isAdding ? <X className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {isAdding ? "Cancel" : "Add Student"}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 animate-in fade-in duration-300">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Add Student Form */}
        {isAdding && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 mb-6 text-slate-800">
              <div className="p-2 bg-blue-50 rounded-lg">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="font-bold text-lg">New Student Registration</h2>
            </div>
            <form onSubmit={addStudent} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="text" required placeholder="Full Name" value={newName} onChange={(e) => setNewName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="email" required placeholder="email@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Default Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="password" required minLength="6" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
                </div>
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                  Register Student
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Students List Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <p className="text-slate-500 font-medium">Syncing student database...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-16 text-center">#</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Email</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStudents.map((s, index) => (
                    <tr key={s._id} className="hover:bg-slate-50/50 transition-colors group">
                      {editingId === s._id ? (
                        <>
                          <td className="px-6 py-4 text-center font-bold text-slate-400">{index + 1}</td>
                          <td className="px-6 py-4">
                            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} 
                              className="w-full p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                          </td>
                          <td className="px-6 py-4">
                            <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} 
                              className="w-full p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => updateStudent(s._id)} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                                <Check className="h-4 w-4" />
                              </button>
                              <button onClick={cancelEdit} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Numbering Column */}
                          <td className="px-6 py-4 text-center font-bold text-slate-400 text-sm">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-800">{s.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-600 text-sm">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              {s.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEdit(s)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button onClick={() => deleteStudent(s._id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredStudents.length === 0 && (
            <div className="p-20 text-center bg-white">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4 text-slate-300">
                 <User className="h-8 w-8" />
              </div>
              <p className="text-slate-500 font-bold">No students matched your search</p>
              <button onClick={() => setSearchTerm("")} className="text-blue-600 text-sm font-bold mt-2 hover:underline">Clear all filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageStudents;