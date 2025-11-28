import { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTasks,
  updateTask,
  deleteTask,
  startTimer,
  stopTimer,
  adjustTaskTime,
  manageBaseline,
} from "../features/tasks/taskSlice";
import { fetchUsers } from "../features/users/userSlice";

export const useTaskDashboard = (role) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const {
    items: tasks,
    status: tasksStatus,
    error: tasksError,
  } = useSelector((state) => state.tasks);
  const { items: users, status: usersStatus } = useSelector(
    (state) => state.users
  );

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    assignedUser: "",
  });
  const [expandedTaskIds, setExpandedTaskIds] = useState([]);
  const [expandedUserIds, setExpandedUserIds] = useState([]);
  const [expandedFilterPanel, setExpandedFilterPanel] = useState(null);

  const isManager = role === "manager";

  // apply filters and fetch tasks
  const applyFilters = useCallback(
    (currentFilters = filters) => {
      const payload = {
        search: currentFilters.search,
        status: currentFilters.status !== "all" ? currentFilters.status : "",
        assignedUser: isManager ? currentFilters.assignedUser : currentUser.id,
      };
      dispatch(fetchTasks(payload));
    },
    [dispatch, isManager, currentUser.id, filters]
  );

  //  Filter handlers
  const handleSearchChange = (e) => {
    const value = e.target.value;
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    const timeoutId = setTimeout(() => applyFilters(newFilters), 300);
    return () => clearTimeout(timeoutId);
  };
  const handleStatusSelect = (status) => {
    const newFilters = { ...filters, status };
    setFilters(newFilters);
    setExpandedFilterPanel(null);
    applyFilters(newFilters);
  };
  const handleUserSelect = (userId) => {
    const newFilters = { ...filters, assignedUser: userId };
    setFilters(newFilters);
    setExpandedFilterPanel(null);
    applyFilters(newFilters);
  };
  const handleClearFilters = () => {
    const defaults = { search: "", status: "all", assignedUser: "" };
    setFilters(defaults);
    applyFilters(defaults);
  };
  const toggleFilterPanel = (panelName) =>
    setExpandedFilterPanel(
      expandedFilterPanel === panelName ? null : panelName
    );

  //  Task expand/collapse
  const handleToggleTaskDetails = (taskId) =>
    setExpandedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );

  //  Task actions
  const updateTaskStatus = (taskId, newStatus) =>
    dispatch(updateTask({ taskId, updatedFields: { status: newStatus } }));
  const handleStartTimer = (taskId) => dispatch(startTimer(taskId));
  const handleStopTimer = (taskId) => dispatch(stopTimer(taskId));

  const handleTimeAdjust = (taskId, arg2, arg3) => {
    let newTime = arg3 !== undefined ? arg2 + arg3 : arg2;
    dispatch(
      adjustTaskTime({
        taskId,
        newTimeInMinutes: newTime,
        isBaselineRequest: false,
      })
    );
  };

  const handleRequestBaseline = (taskId, currentMinutes) => {
    if (window.confirm("Request new baseline?"))
      dispatch(
        adjustTaskTime({
          taskId,
          newTimeInMinutes: currentMinutes,
          isBaselineRequest: true,
        })
      );
  };

  const approveBaselineRequest = (taskId, approvedTime) =>
    dispatch(manageBaseline({ taskId, action: "approve", approvedTime }));
  const rejectBaselineRequest = (taskId) =>
    dispatch(manageBaseline({ taskId, action: "reject" }));
  const handleDeleteTask = (id) => {
    if (window.confirm("Delete task?")) dispatch(deleteTask(id));
  };

  //  Initial fetch
  useEffect(() => {
    if (tasksStatus === "idle") applyFilters();
  }, [tasksStatus, applyFilters]);

  useEffect(() => {
    if (usersStatus === "idle") dispatch(fetchUsers());
  }, [usersStatus, dispatch]);

  //  Compute task stats
  const stats = useMemo(() => {
    if (!Array.isArray(tasks))
      return {
        total: 0,
        completed: 0,
        inProcess: 0,
        onHold: 0,
        pending: 0,
        proposed: 0,
        closed: 0,
      };
    return {
      total: tasks.length,
      proposed: tasks.filter((t) => t.status === "proposed").length,
      inProcess: tasks.filter((t) => t.status === "inprocess").length,
      pending: tasks.filter((t) => t.status === "pending").length,
      onHold: tasks.filter((t) => t.status === "onhold").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      closed: tasks.filter((t) => t.status === "closed").length,
    };
  }, [tasks]);

  //  Handlers for TaskItem components
  const taskHandlers = {
    expandedTaskIds,
    handleToggleTaskDetails,
    onStatusChange: updateTaskStatus,
    updateTaskStatus,
    getUserNameById: (id) => users.find((u) => u.id === id)?.name || "Unknown",
    startTimer: handleStartTimer,
    stopTimer: handleStopTimer,
    handleTimeAdjust,
    handleRequestBaseline,
    approveBaselineRequest,
    rejectBaselineRequest,
    handleEditClick: () => {},
    handleDeleteClick: handleDeleteTask,
  };

  return {
    currentUser,
    tasks,
    users,
    stats,
    loading: tasksStatus === "loading",
    error: tasksError,
    filters,
    expandedFilterPanel,
    handleSearchChange,
    handleStatusSelect,
    handleUserSelect,
    handleClearFilters,
    toggleFilterPanel,
    isFilterActive: filters.search || filters.status !== "all",
    expandedUserIds,
    setExpandedUserIds,
    taskHandlers,
    dispatch,
  };
};
