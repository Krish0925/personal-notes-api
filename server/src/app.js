// server/src/app.js
const express = require("express");
const cors = require("cors");
const db = require("./db");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const noteRoutes = require("./routes/noteRoutes");


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, message: "API is running" });
});

// DB connection test
app.get("/db-test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT NOW() AS now");
    res.status(200).json({ ok: true, now: rows[0].now });
  } catch (err) {
    console.error("DB TEST ERROR:", err);
    res.status(500).json({ ok: false, error: "Database connection failed" });
  }
});

// ✅ ADD THIS (Auth routes must be BEFORE 404)
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);



app.use("/api/categories", categoryRoutes);
// 404 handler for unknown routes (must be after all routes)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("UNHANDLED ERROR:", err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
