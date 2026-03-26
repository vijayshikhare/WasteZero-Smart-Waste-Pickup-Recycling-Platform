// All secrets and sensitive configuration must be loaded from environment variables only.
// Ensure .env is NOT committed to version control. See .env.example for structure.
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
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const ngoRoutes = require("./routes/ngoRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

const isProduction = process.env.NODE_ENV === "production";

// ────────────────────────────────────────────────
// Trust proxy (needed for rate limiting, cookies on proxies like Render)
// ────────────────────────────────────────────────
app.set("trust proxy", 1);

// ────────────────────────────────────────────────
// Security Headers (Helmet) - loosened slightly for dev images
// ────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "data:",
          "https:",
          "http://localhost:5000",
          "http://localhost:5173",
          "http://localhost:*", // allow Vite random ports in dev
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        connectSrc: ["'self'", "http://localhost:5000", "http://localhost:*", "https:"],
        fontSrc: ["'self'", "data:"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(compression());

// ────────────────────────────────────────────────
// CORS - more permissive in development
// ────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "http://localhost:5175", // common Vite ports
  // Add your production frontend domain later
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (isProduction) {
        // Strict in production
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.warn(`[CORS BLOCKED] Origin: ${origin}`);
          callback(new Error("Not allowed by CORS"));
        }
      } else {
        // Allow all in development (temporary - safe for local)
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ────────────────────────────────────────────────
// Body & Cookie Parsing
// ────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ────────────────────────────────────────────────
// Debug: Log incoming cookies & uploads requests in dev
// ────────────────────────────────────────────────
if (!isProduction) {
  app.use((req, res, next) => {
    // Log cookies for auth debugging
    if (req.cookies?.accessToken) {
      console.log(
        `[COOKIE IN] ${req.method} ${req.originalUrl} → accessToken present (preview): ${req.cookies.accessToken.substring(0, 15)}...`
      );
    } else if (req.originalUrl.includes("/api/") || req.originalUrl.includes("/uploads")) {
      console.log(`[COOKIE IN] ${req.method} ${req.originalUrl} → NO accessToken cookie`);
    }

    // Log every /uploads request to debug image 404s
    if (req.originalUrl.startsWith("/uploads")) {
      console.log(`[UPLOADS REQUEST] ${req.method} ${req.originalUrl}`);
    }

    next();
  });
}

// ────────────────────────────────────────────────
// Rate Limiting
// ────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isProduction ? 10 : 1000, // very permissive in dev
  skip: (req) => !isProduction, // skip entirely in dev
  message: { success: false, message: "Too many login/registration attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isProduction ? 120 : 10000, // very permissive in dev
  skip: (req) => !isProduction, // skip entirely in dev
  message: { success: false, message: "Too many requests. Slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Always apply (skip will bypass in dev)
app.use("/api/auth", authLimiter);
app.use("/api/", apiLimiter);

console.log(`[RATE LIMIT] Mode: ${isProduction ? 'PRODUCTION (strict)' : 'DEVELOPMENT (disabled)'}`);

// Skip rate limit for health & static
app.get("/health", (req, res, next) => {
  res.setHeader("X-RateLimit-Skipped", "true");
  next();
});

// ────────────────────────────────────────────────
// Logging
// ────────────────────────────────────────────────
if (!isProduction) {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      skip: (req) => req.url === "/health" || req.url === "/favicon.ico" || req.url.startsWith("/uploads"),
    })
  );
}

// ────────────────────────────────────────────────
// Static Files - Uploads & public
// ────────────────────────────────────────────────
app.use(
  "/uploads",
  express.static(path.join(__dirname, "public", "uploads"), {
    maxAge: "1y",
    etag: true,
    setHeaders: (res) => {
      res.set("Cache-Control", "public, max-age=31536000, immutable");
      res.set("Access-Control-Allow-Origin", "*");
    },
  })
);

app.use(express.static(path.join(__dirname, "public")));

// Fallback for favicon (prevents 404 noise)
app.get("/favicon.ico", (req, res) => res.status(204).end());

// ────────────────────────────────────────────────
// Routes
// ────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ngo", ngoRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);

// ────────────────────────────────────────────────
// Health check
// ────────────────────────────────────────────────
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

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "WasteZero API is running",
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

// ────────────────────────────────────────────────
// 404 Handler
// ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// ────────────────────────────────────────────────
// Global Error Handler - improved for validation errors
// ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[GLOBAL ERROR]", err.message, err.stack?.substring(0, 300));

  let status = err.status || 500;
  let response = {
    success: false,
    message: "Internal server error",
  };

  if (err.name === "ValidationError") {
    status = 400;
    response.message = "Validation failed";
    response.errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (status < 500) {
    response.message = err.message || "Bad request";
  } else if (!isProduction) {
    response.message = err.message;
    response.stack = err.stack;
  }

  res.status(status).json(response);
});

// ────────────────────────────────────────────────
// MongoDB Connection with retries
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
      console.error(`MongoDB connect failed (${retries}/${maxRetries}):`, err.message);
      if (retries === maxRetries) {
        console.error("Max retries reached. Exiting...");
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, 5000));
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
  console.log(`Allowed CORS origins (prod): ${allowedOrigins.join(", ")}`);
  console.log(`Uploads served at: http://localhost:${PORT}/uploads`);
  console.log(`Health: http://localhost:${PORT}/health`);
});

// ────────────────────────────────────────────────
// Graceful shutdown
// ────────────────────────────────────────────────
const gracefulShutdown = (signal) => {
  console.log(`${signal} received. Shutting down...`);
  server.close(() => {
    console.log("HTTP server closed.");
    mongoose.connection.close(false, () => {
      console.log("MongoDB closed.");
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.error("Shutdown timeout → force exit");
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