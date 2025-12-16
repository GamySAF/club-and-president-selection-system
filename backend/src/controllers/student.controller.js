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


// Login Student
exports.loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email });

    if (student && (await bcrypt.compare(password, student.password))) {
      res.json({
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        token: generateToken(student), // ✅ FIXED
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
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
      { new: true } // return the updated document
    );

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Mark student as voted
    student.hasVoted = true;
    await student.save();

    res.json({ message: `You voted for ${candidate.name}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -------------------- Select Clubs --------------------
exports.selectClubs = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);

    const { clubIds } = req.body; // array of club IDs student wants to join
    if (!Array.isArray(clubIds) || clubIds.length === 0) {
      return res.status(400).json({ message: "No clubs selected" });
    }

    const joinedClubs = [];

    for (const id of clubIds) {
      const club = await Club.findById(id);
      if (!club) continue; // skip invalid clubs

      // Safer ObjectId comparison
      if (!student.selectedClubs.map(c => c.toString()).includes(club._id.toString())) {
        student.selectedClubs.push(club._id);
        joinedClubs.push(club.name);
      }
    }

    await student.save();

    if (joinedClubs.length === 0) {
      return res
        .status(400)
        .json({ message: "You have already joined the selected clubs" });
    }

    res.json({ message: `You joined: ${joinedClubs.join(", ")}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




exports.viewResultsStudent = async (req, res) => {
  try {
    const candidates = await Candidate.find().select("name votes -_id");
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}