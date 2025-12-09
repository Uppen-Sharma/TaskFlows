const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const dataRoutes = require("./routes/dataRoutes");

// Security Middleware Imports
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// --- CORS Configuration ---
// Allow Localhost and your future Vercel URL
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL, // Defined in Render Dashboard later
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // Optional: Log blocked origins for debugging
        // console.log("Blocked by CORS:",WZ origin);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Core Middleware
app.use(express.json());

// Security Middleware
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(hpp());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
});
app.use(limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.send("TaskFlows API is running...");
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Server Setup
const PORT = process.env.PORT || 5000;

// Simplified Start (Render handles HTTPS automatically)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
