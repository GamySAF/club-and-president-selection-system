const jwt = require("jsonwebtoken");

const generateToken = (student) => {
  return jwt.sign(
    {
      id: student._id,
      role: student.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

module.exports = generateToken;
