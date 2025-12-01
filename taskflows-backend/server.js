const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
// const helmet = require("helmet");
// const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
// const mongoSanitize = require("express-mongo-sanitize");
// const hpp = require("hpp");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const dataRoutes = require("./routes/dataRoutes");

//https module
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

// optional
// app.use(helmet());
// app.use(xss());
// app.use(mongoSanitize());
// app.use(hpp());

// rate limit
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// auth routes
app.use("/api/auth", authRoutes);

// data routes
app.use("/api/data", dataRoutes);

// test route
app.get("/", (req, res) => {
  res.send("TaskFlows API is running...");
});

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// HTTPS Configuration Implemented
try {
  // Load SSL Certificates
  const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, "key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "cert.pem")),
  };

  const PORT = process.env.PORT || 5000;

  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(
      `Secure Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
  });
} catch (error) {
  console.error("SSL Certificate Error: Could not find key.pem or cert.pem");
  console.error(
    "Please run 'openssl' command to generate them in this folder."
  );
  process.exit(1);
}
