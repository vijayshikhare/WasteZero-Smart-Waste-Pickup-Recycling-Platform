// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");

// Routes
const authRoutes = require("./routes/authRoutes");
const opportunityRoutes = require("./routes/opportunityRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes"); // ← added

const app = express();

// ────────────────────────────────────────────────
// Security & Middleware
// ────────────────────────────────────────────────

app.set("trust proxy", 1); // Required for rate limiting + cookies behind proxies (Cloudflare, Nginx, etc.)

// Helmet with relaxed but safe CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:", "http://localhost:5000", "http://localhost:5173"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // remove unsafe-eval in strict prod
        connectSrc: ["'self'", "http://localhost:5000", "http://localhost:5173", "https:"],
        fontSrc: ["'self'", "data:"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(compression());

// CORS - dynamic origin check
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  // Add your production domain(s) here:
  // "https://wastezero-frontend.vercel.app",
  // "https://your-domain.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ────────────────────────────────────────────────
// Body parsers & Cookies
// ────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ────────────────────────────────────────────────
// Rate Limiting
// ────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // stricter for login/register
  message: { success: false, message: "Too many login/registration attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  message: { success: false, message: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter);
app.use("/api/", apiLimiter); // general API rate limit

// Skip rate limit for health check
app.use("/health", (req, res, next) => {
  res.setHeader("X-RateLimit-Skipped", "true");
  next();
});

// ────────────────────────────────────────────────
// Logging
// ────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      skip: (req) => req.url === "/health" || req.url === "/favicon.ico" || req.url.startsWith("/uploads"),
    })
  );
}

// ────────────────────────────────────────────────
// Static Files — Uploads & Public
// ────────────────────────────────────────────────
app.use(
  "/uploads",
  express.static(path.join(__dirname, "public/uploads"), {
    maxAge: "1y", // long cache for images
    etag: true,
    setHeaders: (res) => {
      res.set("Cache-Control", "public, max-age=31536000, immutable");
      res.set("Access-Control-Allow-Origin", "*"); // safe for images
    },
  })
);

// Serve favicon.ico and robots.txt from public folder
app.use(express.static(path.join(__dirname, "public")));

// ────────────────────────────────────────────────
// Routes
// ────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/dashboard", dashboardRoutes); // ← added

// Health check (public, no auth)
app.get("/health", (req, res) => {
  const memory = process.memoryUsage();
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    memory: {
      rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    },
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "WasteZero API is running",
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("[GLOBAL ERROR]", err.message, err.stack?.substring(0, 300));
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message:
      status < 500
        ? err.message || "Bad request"
        : process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Something went wrong",
  });
});

// ────────────────────────────────────────────────
// MongoDB Connection with retry
// ────────────────────────────────────────────────
const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
      });
      console.log(`MongoDB connected → ${mongoose.connection.host}`);
      return;
    } catch (err) {
      retries++;
      console.error(`MongoDB connection attempt ${retries}/${maxRetries} failed:`, err.message);
      if (retries === maxRetries) {
        console.error("Max retries reached. Exiting...");
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, 5000)); // wait 5s
    }
  }
};

connectDB();

// ────────────────────────────────────────────────
// Start Server
// ────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  console.log(`Allowed CORS origins: ${allowedOrigins.join(", ")}`);
  console.log(`Uploads served at: http://localhost:${PORT}/uploads`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed.");
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  });

  // Force exit after 10s if not closed
  setTimeout(() => {
    console.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

module.exports = app;