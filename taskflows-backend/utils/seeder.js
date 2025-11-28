const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const Task = require("../models/Task");

dotenv.config();

// connect to mongo database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected...");
  } catch (err) {
    console.error("MongoDB connection error");
    console.error("Details:", err.message);
    process.exit(1);
  }
};

// seed database with sample data
const importData = async () => {
  await connectDB();
  try {
    const jsonUsers = [
      {
        tempId: "u-a1",
        username: "a1",
        email: "alice@taskflow.com",
        password: "pass123",
        name: "Alice Johnson",
        role: "user",
      },
      {
        tempId: "u-b2",
        username: "b2",
        email: "bob@taskflow.com",
        password: "pass123",
        name: "Bob Williams",
        role: "user",
      },
      {
        tempId: "m-s3",
        username: "s3",
        email: "sara@taskflow.com",
        password: "pass123",
        name: "Sara Connor",
        role: "manager",
      },
      {
        tempId: "u-c4",
        username: "c4",
        email: "chris@taskflow.com",
        password: "pass123",
        name: "Chris Lee",
        role: "user",
      },
    ];

    await User.deleteMany();
    await Task.deleteMany();
    console.log("Old data cleared");

    // map seeded user ids
    const usersMap = {};
    for (const u of jsonUsers) {
      const createdUser = await User.create({
        name: u.name,
        username: u.username,
        email: u.email,
        password: u.password,
        role: u.role,
      });
      usersMap[u.tempId] = createdUser._id;
    }

    const aliceId = usersMap["u-a1"];
    const bobId = usersMap["u-b2"];
    const saraId = usersMap["m-s3"];
    const chrisId = usersMap["u-c4"];

    // predefined tasks to insert
    const jsonTasks = [
      {
        name: "Database Schema Design",
        description: "Finalize DB schema.",
        initialEstimatedTime: 1440,
        currentEstimatedTime: 1440,
        status: "closed",
        assignedTo: [aliceId],
        assignedBy: saraId,
      },
      {
        name: "Implement API Authentication",
        description: "Setup JWT auth.",
        initialEstimatedTime: 2880,
        currentEstimatedTime: 2880,
        status: "onhold",
        assignedTo: [bobId],
        assignedBy: saraId,
      },
      {
        name: "User Profile Page UI/UX",
        description: "Design profile page.",
        initialEstimatedTime: 300,
        currentEstimatedTime: 300,
        status: "pending",
        assignedTo: [aliceId, chrisId],
        assignedBy: saraId,
      },
      {
        name: "Admin Task Filtering Logic",
        description: "Implement task filtering.",
        initialEstimatedTime: 90,
        currentEstimatedTime: 90,
        status: "completed",
        assignedTo: [chrisId],
        assignedBy: saraId,
      },
      {
        name: "Setup Deployment Pipeline",
        description: "Configure CI/CD.",
        initialEstimatedTime: 4320,
        currentEstimatedTime: 4320,
        status: "inprocess",
        assignedTo: [bobId],
        assignedBy: saraId,
        timeTrackingStartedAt: new Date(),
      },
      {
        name: "Integrate Payment Gateway",
        description: "Research Stripe API and propose implementation plan.",
        initialEstimatedTime: 240,
        currentEstimatedTime: 240,
        status: "proposed",
        assignedTo: [aliceId],
        assignedBy: aliceId,
      },
    ];

    await Task.insertMany(jsonTasks);

    console.log("Seed complete");
    process.exit();
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

// run seeder automatically
if (process.argv[2] === "-d") {
  console.log("Seeder ready use npm run seed");
} else {
  importData();
}
