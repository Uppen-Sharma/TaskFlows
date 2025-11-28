const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logApiCall = require("../utils/logger");
const BlacklistToken = require("../models/BlacklistToken");

// handle user login
const loginUser = async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  try {
    // find user with email or username
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    }).select("+password");

    if (!user) {
      // log invalid login attempt
      logApiCall({
        event: "LOGIN_ATTEMPT",
        user_context_id: "N/A",
        endpoint: "/api/auth/login",
        method: "POST",
        token_status: "FAILED_CREDENTIALS",
        request_payload: { usernameOrEmail: "[REDACTED]" },
        response_status: 401,
      });
      return res.status(401).json({ message: "Invalid username or password." });
    }

    // compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // generate user token
      const token = user.getSignedJwtToken();
      const decoded = jwt.decode(token);

      // log successful login
      logApiCall({
        event: "TOKEN_GENERATED",
        user_context_id: user._id.toString(),
        endpoint: "/api/auth/login",
        method: "POST",
        token_claims: {
          id: decoded.id,
          iat: decoded.iat,
          exp: decoded.exp,
        },
        token_status: "SUCCESS",
        login_details: {
          usernameOrEmail: "[REDACTED]",
          role: user.role,
        },
      });

      // send user data
      res.json({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        token: token,
      });
    } else {
      // log invalid password attempt
      logApiCall({
        event: "LOGIN_ATTEMPT",
        user_context_id: "N/A",
        endpoint: "/api/auth/login",
        method: "POST",
        token_status: "FAILED_CREDENTIALS",
        request_payload: { usernameOrEmail: "[REDACTED]" },
        response_status: 401,
      });
      res.status(401).json({ message: "Invalid username or password." });
    }
  } catch (error) {
    // handle unexpected login error
    console.error("CRITICAL LOGIN ERROR:", error.message);
    logApiCall({
      event: "LOGIN_ATTEMPT",
      user_context_id: "N/A",
      endpoint: "/api/auth/login",
      method: "POST",
      token_status: "SERVER_ERROR",
      request_payload: { usernameOrEmail: "[REDACTED]" },
      error_message: error.message,
      response_status: 500,
    });
    res.status(500).json({ message: "Server error during login." });
  }
};

// handle user registration
const registerUser = async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    // check if user already exists
    const userExists = await User.findOne({ $or: [{ username }, { email }] });

    if (userExists) {
      const message =
        userExists.username === username
          ? "Username already exists."
          : "Email is already registered.";

      // log failed registration attempt
      logApiCall({
        event: "REGISTER_ATTEMPT",
        user_context_id: "N/A",
        endpoint: "/api/auth/register",
        method: "POST",
        status: "FAILED_CONFLICT",
        request_payload: { name, username, email, password: "[REDACTED]" },
        error_message: message,
        response_status: 400,
      });

      return res.status(400).json({ message });
    }

    // create new user
    const user = await User.create({ name, username, email, password });

    if (user) {
      // log successful registration
      logApiCall({
        event: "USER_REGISTERED",
        user_context_id: user._id.toString(),
        endpoint: "/api/auth/register",
        method: "POST",
        status: "SUCCESS",
        registered_user_id: user._id.toString(),
        response_status: 201,
      });

      // send created user data
      res.status(201).json({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } else {
      // handle invalid user creation
      logApiCall({
        event: "REGISTER_ATTEMPT",
        user_context_id: "N/A",
        endpoint: "/api/auth/register",
        method: "POST",
        status: "FAILED_INVALID_DATA",
        request_payload: { name, username, email, password: "[REDACTED]" },
        error_message: "Invalid user data",
        response_status: 400,
      });
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    // handle registration errors
    console.error(error);
    logApiCall({
      event: "REGISTER_ATTEMPT",
      user_context_id: "N/A",
      endpoint: "/api/auth/register",
      method: "POST",
      status: "SERVER_ERROR",
      request_payload: { name, username, email, password: "[REDACTED]" },
      error_message: error.message,
      response_status: 500,
    });
    res.status(500).json({ message: "Server error during registration." });
  }
};

// handle user logout
const logoutUser = async (req, res) => {
  const authHeader = req.headers.authorization;
  const endpoint = "/api/auth/logout";
  const method = "POST";

  // start logout log data
  let logData = {
    event: "LOGOUT_INITIATED",
    endpoint,
    method,
    user_context_id: "N/A",
  };

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    // handle missing token
    logData.status = "FAILED_NO_TOKEN";
    logApiCall(logData);
    return res.status(400).json({ message: "No token provided for logout." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // verify token authenticity
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logData.user_context_id = decoded.id;

    // check if token already blacklisted
    const isBlacklisted = await BlacklistToken.findOne({ token: token });
    if (isBlacklisted) {
      logData.status = "ALREADY_INVALIDATED";
      logApiCall(logData);
      return res.status(200).json({ message: "Token already invalidated." });
    }

    // calculate token expiry time
    const expirationDate = new Date(decoded.exp * 1000);

    // store token in blacklist
    await BlacklistToken.create({
      token: token,
      expiresAt: expirationDate,
    });

    // log successful logout
    logApiCall({
      event: "USER_LOGGED_OUT",
      user_context_id: decoded.id,
      endpoint: endpoint,
      method: method,
      token_claims: { id: decoded.id, exp: decoded.exp },
      status: "SUCCESS",
      description: "Token removed from storage and blacklisted in DB",
    });

    res.status(200).json({ message: "Logout successful, token invalidated." });
  } catch (error) {
    // handle token verification issues
    logData.status = error.message.includes("expired")
      ? "FAILED_EXPIRED_TOKEN"
      : "FAILED_INVALID_SIGNATURE";
    logData.error_message = error.message;
    logApiCall(logData);

    res.status(401).json({
      message: `Logout failed: Invalid or ${logData.status
        .split("_")[1]
        .toLowerCase()} token.`,
    });
  }
};

module.exports = { loginUser, registerUser, logoutUser };
