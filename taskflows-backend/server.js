// imports
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const dataRoutes = require("./routes/dataRoutes");

//  security middleware imports
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
//

// https
const https = require("https");
const fs = require("fs");
const path = require("path");

// load env
dotenv.config();

// connect db
connectDB();

const app = express();

// core middleware
app.use(express.json());
app.use(cors());

//  Security Middleware
// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Prevent MongoDB Operator Injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());
//

// rate limit
const limiter = rateLimit({
  windowMs: 1000,
  max: 2,
  message: "Too many requests, try again later.",
});
app.use(limiter);

// auth routes
app.use("/api/auth", authRoutes);

// data routes
app.use("/api/data", dataRoutes);

// test route
app.get("/", (req, res) => {
  res.send("TaskFlows API is running securely (HTTPS)...");
});

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

//  HTTPS server setup
const PORT = process.env.PORT || 5000;

// production or local
if (process.env.NODE_ENV === "production") {
  //  PRODUCTION MODE (Deployed)
  app.listen(PORT, () => {
    console.log(`Production Server running on port ${PORT}`);
  });
} else {
  //  LOCAL MODE (Your machine)
  try {
    const sslOptions = {
      key: fs.readFileSync(path.join(__dirname, "key.pem")),
      cert: fs.readFileSync(path.join(__dirname, "cert.pem")),
    };

    https.createServer(sslOptions, app).listen(PORT, () => {
      console.log(`Secure Local Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Local SSL Error: key.pem or cert.pem missing.");
    process.exit(1);
  }
}
