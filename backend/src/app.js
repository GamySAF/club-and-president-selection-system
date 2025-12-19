const express = require("express");
const cors = require("cors");

const studentRoutes = require("./routes/student.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();
app.use(cors({
  origin: [
    'https://club-and-president-selection-system.vercel.app', // Production
    'http://localhost:5173'                                   // Local Development
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());



// Routes
app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);

// Test endpoint
app.get("/", (req, res) => res.send("API is running..."));

module.exports = app;
