const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // user full name
    username: { type: String, required: true, unique: true, trim: true }, // unique username
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true, // email cleanup
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // hide password field
    },

    role: {
      type: String,
      enum: ["user", "manager"], // allowed roles
      default: "user", // default role
    },
  },
  {
    timestamps: true, // adds createdAt updatedAt
    toJSON: { virtuals: true }, // include virtuals in json
    toObject: { virtuals: true }, // include virtuals in object
  }
);

userSchema.virtual("id").get(function () {
  return this._id.toHexString(); // expose id field
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // skip if pass unchanged
  const salt = await bcrypt.genSalt(10); // generate salt
  this.password = await bcrypt.hash(this.password, salt); // hash pass
  next();
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password); // compare pass
};

// create token using user id and secret key
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE, // token expiry time
  });
};

module.exports = mongoose.model("User", userSchema);
