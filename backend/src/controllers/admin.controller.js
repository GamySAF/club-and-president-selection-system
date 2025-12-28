const Student = require("../models/student.model");
const Candidate = require("../models/candidate.model");
const Club = require("../models/club.model");
const bcrypt = require("bcryptjs");

// ------------------ STUDENT MANAGEMENT -----------------
// 
const jwt = require("jsonwebtoken");

// ------------------ ADMIN AUTH ------------------
// Admin Login (PUBLIC)
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    // 2️⃣ Find admin user
    const admin = await Student.findOne({
      email: email.toLowerCase(),
      role: "admin",
    });

    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: "Admin not found with this email" 
      });
    }

    // 3️⃣ Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Incorrect password" 
      });
    }

    // 4️⃣ Generate token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 5️⃣ Send success response
    res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      token,
    });

  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};


// Add/Register a new student (Admin only)
exports.registerStudent = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existing = await Student.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: "Student email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
// Updated section in your controller
const student = await Student.create({
  name: name.trim(),
  email: email.toLowerCase(),
  password: hashedPassword,
  role: role || "student",
  hasVoted: false, // Explicitly set to false on creation
});

    res.status(201).json({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: student.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select("-password");
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Update student by ID
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const { name, email, role } = req.body;
    if (name) student.name = name.trim();
    if (email) student.email = email.toLowerCase();
    if (role) student.role = role;

    await student.save();
    res.json({ message: "Student updated", student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete student by ID
exports.deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    // 1. Find the student
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    console.log(`Deleting student: ${student.name}. Voted for: ${student.votedFor}`);

    // 2. Decrement Vote Count (The Fix)
    if (student.hasVoted && student.votedFor) {
      const updatedCandidate = await Candidate.findByIdAndUpdate(
        student.votedFor, 
        { $inc: { votes: -1 } },
        { new: true } // returns the updated candidate to console
      );
      console.log("Updated Candidate Votes:", updatedCandidate?.votes);
    }

    // 3. OPTIONAL: If you want clubs to also lose a member count
    if (student.selectedClubs && student.selectedClubs.length > 0) {
      await Club.updateMany(
        { _id: { $in: student.selectedClubs } },
        { $pull: { members: studentId } } // Removes student from club member list
      );
    }

    // 4. Finally Delete
    await Student.findByIdAndDelete(studentId);
    
    res.json({ success: true, message: "Student and data removed" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Add this to your routes: router.get("/sync-votes", adminController.recalculateVotes);


// A one-time fix to sync candidate votes with real student data

// ------------------ CANDIDATE MANAGEMENT ------------------

// Add candidate
exports.addCandidate = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Candidate name is required" });

    const existingCandidate = await Candidate.findOne({ name: name.trim() });
    if (existingCandidate) return res.status(400).json({ message: "Candidate name already exists" });

    const candidate = await Candidate.create({ name: name.trim(), votes: 0 });
    res.status(201).json({ message: "Candidate added", candidate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all candidates
exports.getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update candidate
exports.updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    const { name } = req.body;
    if (name) candidate.name = name.trim();

    await candidate.save();
    res.json({ message: "Candidate updated", candidate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete candidate
exports.deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: "Candidate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------ CLUB MANAGEMENT ------------------

// Add club
exports.addClub = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Club name is required" });

    const existingClub = await Club.findOne({ name: name.trim() });
    if (existingClub) return res.status(400).json({ message: "Club name already exists" });

    const club = await Club.create({ name: name.trim() });
    res.status(201).json({ message: "Club added", club });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all clubs
exports.getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find();
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update club
exports.updateClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    const { name } = req.body;
    if (name) club.name = name.trim();

    await club.save();
    res.json({ message: "Club updated", club });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete club
exports.deleteClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    await Club.findByIdAndDelete(req.params.id);
    res.json({ message: "Club deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------ RESULTS ------------------
exports.viewResults = async (req, res) => {
  try {
    const candidates = await Candidate.find();
    
    // --- TEMPORARY AUTO-SYNC ---
    for (let candidate of candidates) {
      const actualVotes = await Student.countDocuments({ votedFor: candidate._id });
      candidate.votes = actualVotes;
      await candidate.save();
    }
    // ---------------------------

    const totalStudents = await Student.countDocuments({ role: "student" });
    const totalVoted = await Student.countDocuments({ hasVoted: true });

    res.json({
      candidates,
      totalStudents,
      totalVoted,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
