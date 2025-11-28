const express = require("express");
const router = express.Router();
const {
  loginUser,
  registerUser,
  logoutUser,
} = require("../controllers/authController");

// register user
router.post("/register", registerUser);

// login user
router.post("/login", loginUser);

// logout user
router.post("/logout", logoutUser);

module.exports = router;
