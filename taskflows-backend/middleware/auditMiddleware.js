const logApiCall = require("../utils/logger");
const jwt = require("jsonwebtoken");

const auditLog = (req, res, next) => {
  const endpoint = req.originalUrl; // requested path
  const method = req.method; // HTTP method

  let userId = "N/A (Public API)"; // default user id
  let tokenClaims = {}; // decoded token data
  let payload = {}; // request body copy

  try {
    const authHeader = req.headers.authorization; // get auth header
    const token =
      authHeader && authHeader.startsWith("Bearer")
        ? authHeader.split(" ")[1] // extract token
        : null;

    if (token) {
      const decoded = jwt.decode(token); // decode token
      if (decoded && decoded.id) {
        userId = decoded.id; // set user id
        tokenClaims = {
          id: decoded.id, // token user id
          iat: decoded.iat, // issued time
          exp: decoded.exp, // expiry time
        };
      }
    } else if (req.user && req.user._id) {
      userId = req.user._id.toString(); // fallback authenticated user
    }

    if (
      method === "POST" ||
      method === "PUT" ||
      method === "PATCH" ||
      method === "DELETE"
    ) {
      payload = JSON.parse(JSON.stringify(req.body)); // clone body
      if (payload.password) payload.password = "[REDACTED]"; // hide password
      if (payload.usernameOrEmail) payload.usernameOrEmail = "[REDACTED]"; // hide identifier
    }

    const logEntry = {
      event: "API_ACCESS_AUDIT", // log event type
      user_context_id: userId, // user context
      endpoint: endpoint, // request path
      method: method, // HTTP method
      token_claims: tokenClaims, // decoded claims
      request_payload: payload, // sanitized body
    };

    logApiCall(logEntry); // write audit log
  } catch (error) {
    console.error("Audit logging error:", error.message); // log error
  }

  next(); // continue request
};

module.exports = auditLog; // export middleware
