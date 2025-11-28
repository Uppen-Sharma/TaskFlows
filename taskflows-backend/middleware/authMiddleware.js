const jwt = require("jsonwebtoken");
const User = require("../models/User");
const BlacklistToken = require("../models/BlacklistToken");
const logApiCall = require("../utils/logger");

const protect = async (req, res, next) => {
  let token;
  const endpoint = req.originalUrl; // request path
  const method = req.method; // HTTP method

  let logData = {
    event: "ACCESS_PROTECT_GATE", // log event type
    endpoint,
    method,
    user_context_id: "N/A", // default user id
  };

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]; 
      logData.auth_method = "Bearer Token"; 

      const isBlacklisted = await BlacklistToken.findOne({ token }); // check blacklist

      if (isBlacklisted) {
        logData.token_status = "INVALIDATED"; // token revoked
        logApiCall(logData); // write log
        return res
          .status(401)
          .json({ message: "Token has been invalidated (Logged out)" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET); // verify token
      logData.token_status = "VALID";
      logData.user_context_id = decoded.id; // assign user id

      req.user = await User.findById(decoded.id).select("-password"); // load user

      if (!req.user) {
        logData.token_status = "USER_NOT_FOUND"; // no user found
        logApiCall(logData);
        return res.status(401).json({ message: "User not found" });
      }

      logData.token_status = "SUCCESS_PASSTHROUGH"; // allow access
      logApiCall(logData);
      return next();
    }

    logData.token_status = "NO_TOKEN"; // no token received
    logApiCall(logData);
    return res.status(401).json({ message: "No token provided" });
  } catch (error) {
    logData.token_status = error.message.includes("expired")
      ? "EXPIRED_TOKEN"
      : "INVALID_SIGNATURE";
    logData.error_message = error.message; // log error
    logApiCall(logData);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const manager = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" }); // no login
  if (req.user.role !== "manager")
    return res.status(403).json({ message: "Managers only" }); // block non-manager
  next(); // allow manager
};

module.exports = { protect, manager }; // export functions
