const studentOnly = (req, res, next) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Student access only" });
  }
  next();
};

module.exports = studentOnly;
