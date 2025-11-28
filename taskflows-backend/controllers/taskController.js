const Task = require("../models/Task");
const User = require("../models/User");
const mongoose = require("mongoose");

// convert database document to frontend format
const mapToFrontend = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  return { ...obj, id: obj._id?.toString(), _id: undefined };
};

// calculate updated remaining time
const calculateRemainingTime = (task) => {
  if (!task || !task.timeTrackingStartedAt) return task.currentEstimatedTime;
  const start = new Date(task.timeTrackingStartedAt).getTime();
  const now = Date.now();
  const elapsed = Math.floor((now - start) / 60000);
  return task.currentEstimatedTime - elapsed;
};

// fetch all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("name username role email");
    res.json(users.map(mapToFrontend));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "User fetch error" });
  }
};

// fetch tasks with filters
const getTasks = async (req, res) => {
  try {
    const { status, assignedUser, search, sort } = req.query;
    const query = {};
    const sortOptions = {};
    const authenticatedUserId = new mongoose.Types.ObjectId(req.user._id);

    // restrict user to own tasks
    if (req.user.role === "user") {
      query.assignedTo = { $in: [authenticatedUserId] };
      query.status = { $ne: "closed" };
    } else if (req.user.role === "manager") {
      // filter by assigned user
      if (assignedUser && mongoose.Types.ObjectId.isValid(assignedUser)) {
        query.assignedTo = assignedUser;
      }
    }

    // apply status filter
    if (status && status !== "all") {
      query.status = status;
    }

    // apply search filter
    if (search)
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];

    // apply sorting option
    sortOptions.sort = sort ? sort.split(",").join(" ") : "-createdAt";

    const tasks = await Task.find(query).sort(sortOptions.sort);

    // update remaining time values
    const finalTasks = tasks.map((t) => ({
      ...mapToFrontend(t),
      currentEstimatedTime: calculateRemainingTime(t),
    }));

    res.json(finalTasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Task fetch error" });
  }
};

// create new task
const createTask = async (req, res) => {
  const { name, description, assignedTo, currentEstimatedTime } = req.body;

  // validate required fields
  if (!name || !assignedTo?.length || currentEstimatedTime === undefined) {
    return res.status(400).json({ message: "Missing fields" });
  }

  // filter valid user ids
  const validAssignedTo = assignedTo.filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );

  try {
    const isManager = req.user.role === "manager";

    // set task starting status
    const forcedStatus = isManager ? "inprocess" : "proposed";

    const task = await Task.create({
      name,
      description,
      initialEstimatedTime: currentEstimatedTime,
      currentEstimatedTime,
      assignedTo: validAssignedTo,
      assignedBy: req.user._id,
      status: forcedStatus,
      userSuggestedBaseline: null,
      timeTrackingStartedAt: null,
    });

    res.status(201).json(mapToFrontend(task));
  } catch (err) {
    console.error("Create Error:", err);
    res.status(400).json({ message: "Task create error" });
  }
};

// start task timer
const startTimer = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // prevent timer start on restricted statuses
    if (task.status === "onhold")
      return res.status(403).json({ message: "Task is On Hold" });
    if (task.status === "proposed")
      return res.status(403).json({ message: "Task is pending approval" });

    // do nothing if already running
    if (task.timeTrackingStartedAt) return res.json(mapToFrontend(task));

    // ensure user is assigned
    const activeUserId = req.user._id.toString();
    if (!task.assignedTo.map(String).includes(activeUserId)) {
      return res.status(403).json({ message: "Not assigned" });
    }

    // start timer and update task
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { timeTrackingStartedAt: new Date(), status: "inprocess" },
      { new: true }
    );

    res.json(mapToFrontend(updated));
  } catch (err) {
    res.status(400).json({ message: "Start timer error" });
  }
};

// stop task timer
const stopTimer = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (!task.timeTrackingStartedAt) return res.json(mapToFrontend(task));

    // calculate new remaining time
    const newTime = calculateRemainingTime(task);

    // stop timer and update values
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      {
        timeTrackingStartedAt: null,
        currentEstimatedTime: newTime,
        status: "pending",
      },
      { new: true }
    );

    res.json(mapToFrontend(updated));
  } catch (err) {
    res.status(400).json({ message: "Stop timer error" });
  }
};

// update task fields
const updateTask = async (req, res) => {
  const updates = req.body;
  const allowed = [
    "name",
    "description",
    "status",
    "initialEstimatedTime",
    "currentEstimatedTime",
    "timeTrackingStartedAt",
    "assignedTo",
    "userSuggestedBaseline",
  ];
  const updateFields = {};

  // filter allowed update fields
  for (const key of allowed) {
    if (updates.hasOwnProperty(key)) updateFields[key] = updates[key];
  }

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isManager = req.user.role === "manager";
    const isAssigned = task.assignedTo
      .map(String)
      .includes(req.user._id.toString());

    // block unauthorized update
    if (!isManager && !isAssigned)
      return res.status(403).json({ message: "Unauthorized" });

    // close timer when completing
    if (updates.status === "completed" && task.timeTrackingStartedAt) {
      updateFields.currentEstimatedTime = calculateRemainingTime(task);
      updateFields.timeTrackingStartedAt = null;
    }

    // close timer for manager closing task
    if (
      updates.status === "closed" &&
      isManager &&
      task.timeTrackingStartedAt
    ) {
      updateFields.currentEstimatedTime = calculateRemainingTime(task);
      updateFields.timeTrackingStartedAt = null;
    }

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );
    res.json(mapToFrontend(updated));
  } catch (err) {
    res.status(400).json({ message: "Update error" });
  }
};

// adjust task estimated time
const adjustTaskTime = async (req, res) => {
  const { newTimeInMinutes, isBaselineRequest } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isManager = req.user.role === "manager";
    let updateFields = {};

    // handle manager time adjustment
    if (isManager) {
      updateFields = {
        currentEstimatedTime: newTimeInMinutes,
        userSuggestedBaseline: null,
      };
    } else if (isBaselineRequest) {
      // store user baseline request
      updateFields = { userSuggestedBaseline: newTimeInMinutes };
    } else {
      // normal user editing time
      updateFields = { currentEstimatedTime: newTimeInMinutes };
    }

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );
    res.json(mapToFrontend(updated));
  } catch (err) {
    res.status(400).json({ message: "Adjust time error" });
  }
};

// approve or reject baseline request
const manageBaselineRequest = async (req, res) => {
  const { action, approvedTime } = req.body;
  if (req.user.role !== "manager")
    return res.status(403).json({ message: "Manager only" });

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const updateFields = { userSuggestedBaseline: null };

    // approve new baseline
    if (action === "approve" && approvedTime) {
      updateFields.initialEstimatedTime = approvedTime;
      updateFields.currentEstimatedTime = approvedTime;
    }

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );
    res.json(mapToFrontend(updated));
  } catch (err) {
    res.status(400).json({ message: "Baseline manage error" });
  }
};

// delete task by id
const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json(req.params.id);
  } catch (err) {
    res.status(500).json({ message: "Delete error" });
  }
};

module.exports = {
  getTasks,
  getUsers,
  createTask,
  updateTask,
  deleteTask,
  startTimer,
  stopTimer,
  adjustTaskTime,
  manageBaselineRequest,
};
