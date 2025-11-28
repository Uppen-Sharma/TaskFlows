const express = require("express");
const router = express.Router();
const { protect, manager } = require("../middleware/authMiddleware");
const auditLog = require("../middleware/auditMiddleware");

const {
  getTasks,
  getUsers,
  createTask,
  updateTask,
  deleteTask,
  startTimer,
  stopTimer,
  adjustTaskTime,
  manageBaselineRequest,
} = require("../controllers/taskController");

router.get("/users", auditLog, protect, getUsers); // get user list

router
  .route("/tasks")
  .get(auditLog, protect, getTasks) // fetch tasks
  .post(auditLog, protect, createTask); // create new task

router
  .route("/tasks/:id")
  .patch(auditLog, protect, updateTask) // update task
  .delete(auditLog, protect, manager, deleteTask); // manager delete

router.patch("/tasks/:id/start-timer", auditLog, protect, startTimer); // start timer

router.patch("/tasks/:id/stop-timer", auditLog, protect, stopTimer); // stop timer

router.patch("/tasks/:id/adjust-time", auditLog, protect, adjustTaskTime); // adjust time

router.patch(
  "/tasks/:id/manage-baseline",
  auditLog,
  protect,
  manager,
  manageBaselineRequest
); // approve or reject baseline

module.exports = router;
