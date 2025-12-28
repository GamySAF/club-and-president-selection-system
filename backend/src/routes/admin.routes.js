const express = require("express");
const router = express.Router();
const {
  registerStudent,
  getAllStudents,
  updateStudent,
  deleteStudent,
  addCandidate,
  updateCandidate,
  deleteCandidate,
  addClub,
  updateClub,
  deleteClub,
  viewResults,
  getAllCandidates,
  getAllClubs,
  loginAdmin,

  
} = require("../controllers/admin.controller");

router.post("/login", loginAdmin);


const protect = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");


// STUDENT MANAGEMENT
router.post("/students", protect, adminOnly, registerStudent);
router.get("/students", protect, adminOnly, getAllStudents);
router.put("/students/:id", protect, adminOnly, updateStudent);
router.delete("/students/:id", protect, adminOnly, deleteStudent);

// CANDIDATE MANAGEMENT
router.post("/candidates", protect, adminOnly, addCandidate);
router.put("/candidates/:id", protect, adminOnly, updateCandidate);
router.delete("/candidates/:id", protect, adminOnly, deleteCandidate);
router.get("/candidates", protect, adminOnly, getAllCandidates);

// CLUB MANAGEMENT
router.post("/clubs", protect, adminOnly, addClub);
router.put("/clubs/:id", protect, adminOnly, updateClub);
router.delete("/clubs/:id", protect, adminOnly, deleteClub);
router.get("/clubs", protect, adminOnly, getAllClubs);

// VIEW RESULTS
router.get("/results", protect, adminOnly, viewResults);



module.exports = router;
