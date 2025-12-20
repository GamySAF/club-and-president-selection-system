const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "student" },
    hasVoted: { type: Boolean, default: false },
    // ✅ New field to store the specific presidential choice
    votedFor: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Candidate", 
      default: null 
    },
    selectedClubs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Club" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);