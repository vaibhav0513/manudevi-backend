const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

// Load environment variables
dotenv.config();

// Import configurations
const connectDB = require("./config/database");
const logger = require("./config/logger");
const { errorHandler, notFound } = require("./middlewares/errorMiddleware");
const rateLimiter = require("./middlewares/rateLimiter");
const customSanitize = require("./middlewares/customSanitize");

// Import routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");

// const  getContentByType = require("../controllers/content.controller");
// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Trust proxy (for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// Security Middlewares
app.use(helmet());

// Body Parser (MUST come before custom sanitizer)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Custom body sanitizer (safe for Express 5)
app.use(customSanitize);

// CORS Configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
  credentials: true,
  optionsSuccessStatus: 200,
  // ✅ CRITICAL: Expose custom headers to frontend
  exposedHeaders: ["X-OTP-Token", "X-Auth-Token"],
};
// app.use(cors(corsOptions));
app.use(cors(corsOptions));

// Compression Middleware
app.use(compression());

// Rate Limiting
app.use("/api/", rateLimiter);

// API Routes
const API_VERSION = process.env.API_VERSION || "v1";
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use("/api/v1", require("./routes/content.routes"));
app.use("/api/v1", require("./routes/home.routes"));

app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/admin`, adminRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Error Handlers
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = app;
