const Student = require("../models/student.model");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/token");
const Candidate = require("../models/candidate.model"); // create this model
const Club = require("../models/club.model");           // create this model

// Register Student (ADMIN ONLY - route protected)
exports.registerStudent = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const studentExists = await Student.findOne({ email });
    if (studentExists) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const student = await Student.create({
      name,
      email,
      password: hashedPassword,
      role: "student", // explicit
    });

    res.status(201).json({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: student.role,
      token: generateToken(student), // ✅ FIXED
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email: email.toLowerCase() });

    if (student && (await bcrypt.compare(password, student.password))) {
      // ✅ WRAP the data in a 'user' object to match frontend expectations
   res.json({
  success: true,
  token: generateToken(student),
  user: {
    _id: student._id,
    name: student.name,
    email: student.email,
    role: student.role,
    hasVoted: student.hasVoted || false,
    // ✅ ADD THESE TWO LINES:
    votedFor: student.votedFor || null,
    selectedClubs: student.selectedClubs || []
  },
});
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password");
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// backend/routes/student.routes.js (or similar)
// backend/controllers/student.controller.js
exports.getResults = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ role: 'student' });
    const candidates = await Candidate.find();
    
    // Calculate total votes cast across all candidates
    const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

    // ✅ SEND AN OBJECT, NOT AN ARRAY
    res.json({
      totalStudents,
      totalVotes,
      candidates
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const mongoose = require("mongoose");
exports.votePresident = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);

    // Check if already voted
    if (student.hasVoted) {
      return res.status(400).json({ message: "You have already voted" });
    }

    const { candidateId } = req.body;
    if (!candidateId) {
      return res.status(400).json({ message: "Candidate ID is required" });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({ message: "Invalid candidate ID" });
    }

    // Atomically increment candidate votes
    const candidate = await Candidate.findByIdAndUpdate(
      candidateId,
      { $inc: { votes: 1 } },
      { new: true } 
    );

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // ✅ THE MISSING PART: Save the candidate choice to the student record
    student.hasVoted = true;
    student.votedFor = candidateId; // This tells the DB who the student picked
    await student.save();

    // ✅ RETURN the candidateId so the frontend can update immediately
    res.json({ 
      message: `You voted for ${candidate.name}`,
      votedFor: candidateId 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.castVote = async (req, res) => {
  const { candidateId } = req.body;
  const studentId = req.user.id; // From your auth middleware

  try {
    const student = await Student.findById(studentId);
    if (student.hasVoted) {
      return res.status(400).json({ message: "You have already cast your vote." });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    // ✅ RECORD THE VOTE
    candidate.votes += 1;
    student.hasVoted = true;
    student.votedFor = candidateId; // Save the specific candidate ID

    await candidate.save();
    await student.save();

    res.json({ 
      message: `Vote successfully cast for ${candidate.name}`,
      votedFor: candidateId 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.selectClubs = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    const { clubIds } = req.body; 

    if (!Array.isArray(clubIds) || clubIds.length === 0) {
      return res.status(400).json({ message: "No clubs selected" });
    }

    // 1. Check how many clubs they ALREADY have
    const currentCount = student.selectedClubs.length;

    // 2. Check how many NEW clubs they are trying to join
    // We only count IDs that aren't already in the student's list
    const newClubIds = clubIds.filter(id => 
      !student.selectedClubs.some(existingId => existingId.toString() === id.toString())
    );

    // 3. ENFORCE THE LIMIT: Total must not exceed 2
    if (currentCount + newClubIds.length > 2) {
      return res.status(400).json({ 
        message: `Limit exceeded! You can join at most 2 clubs. You currently have ${currentCount} slot(s) filled.` 
      });
    }

    // 4. If limit is okay, add them
    const joinedClubsNames = [];
    for (const id of newClubIds) {
      const club = await Club.findById(id);
      if (club) {
        student.selectedClubs.push(club._id);
        joinedClubsNames.push(club.name);
      }
    }

    if (joinedClubsNames.length === 0) {
      return res.status(400).json({ message: "You are already a member of these clubs" });
    }

    await student.save();
    res.json({ 
      message: `Success! You joined: ${joinedClubsNames.join(", ")}`,
      selectedClubs: student.selectedClubs // Return the updated list for the frontend
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.viewResultsStudent = async (req, res) => {
  try {
    const candidates = await Candidate.find().select("name party votes");
    const totalStudents = await Student.countDocuments({ role: "student" });
    const totalVoted = await Student.countDocuments({ role: "student", hasVoted: true });

    // ✅ Ensure the key is named 'candidates'
    res.json({ 
      candidates: candidates || [], 
      totalStudents, 
      totalVoted 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all candidates for the ballot
exports.getCandidates = async (req, res) => {
  try {
    // We fetch name, party, and manifesto, but exclude 'votes' for students
    const candidates = await Candidate.find().select("-votes"); 
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching candidates: " + error.message });
  }
};

exports.getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find();
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




exports.viewResultsStudent = async (req, res) => {
  try {
    // 1. Get candidates (Admin already synced them, so we just find them)
    const candidates = await Candidate.find().sort("-votes");

    // 2. Get the same stats the Admin sees
    const totalStudents = await Student.countDocuments({ role: "student" });
    const totalVoted = await Student.countDocuments({ hasVoted: true });

    // 3. Return the EXACT same object structure
    res.json({
      candidates,
      totalStudents,
      totalVoted, // Match the Admin key name!
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};