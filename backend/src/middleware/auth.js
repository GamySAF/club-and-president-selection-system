const jwt = require("jsonwebtoken");
const Student = require("../models/student.model");

const protect = async (req, res, next) => { // ✅ Added: 'async' to allow database lookup
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ UPDATED: Fetch user from DB to include hasVoted and votedFor
    const user = await Student.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Now req.user contains id, role, hasVoted, and votedFor
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalid" });
  }
};

module.exports = protect;