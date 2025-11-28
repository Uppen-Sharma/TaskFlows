const mongoose = require("mongoose");

const blacklistTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true, //no duplicate tokens
  },
  expiresAt: {
    type: Date,
    required: true, // required expiry time
  },
});

blacklistTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto delete expired token

module.exports = mongoose.model("BlacklistToken", blacklistTokenSchema);
