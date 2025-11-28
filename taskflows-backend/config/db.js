const mongoose = require("mongoose");

// connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`DB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    // stop server on failure
    process.exit(1);
  }
};

module.exports = connectDB;
