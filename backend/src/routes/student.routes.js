const express = require("express");
const router = express.Router();
const {
  loginStudent,
  getProfile,
  votePresident,
  selectClubs,
  viewResultsStudent  // <-- add this
} = require("../controllers/student.controller");
const protect = require("../middleware/auth");
const studentOnly = require("../middleware/studentOnly");

// PUBLIC
router.post("/login", loginStudent);

// PROTECTED (Student only)
router.get("/profile", protect, studentOnly, getProfile);
router.post("/vote", protect, studentOnly, votePresident);
router.post("/clubs", protect, studentOnly, selectClubs);
router.get("/results", protect, studentOnly, viewResultsStudent); // <-- student results route

module.exports = router;


// const express = require("express");
// const router = express.Router();
// const { loginStudent, getProfile } = require("../controllers/student.controller");
// const protect = require("../middleware/auth");

// // PUBLIC
// router.post("/login", loginStudent);

// // PROTECTED
// router.get("/profile", protect, getProfile);

// module.exports = router;

