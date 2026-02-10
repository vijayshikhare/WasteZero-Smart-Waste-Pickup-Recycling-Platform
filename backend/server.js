// server.js  (or index.js) - Clean production-ready version

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");

const app = express();

// ────────────────────────────────────────────────
//                  MIDDLEWARE
// ────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Optional: request logging only in development
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// ────────────────────────────────────────────────
//                  ROUTES
// ────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// Basic health check
app.get("/", (req, res) => {
  res.json({ message: "WasteZero API is running" });
});

// ────────────────────────────────────────────────
//             MONGODB CONNECTION
// ────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
  })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// ────────────────────────────────────────────────
//                  START SERVER
// ────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed frontend origin: ${allowedOrigin}`);
});