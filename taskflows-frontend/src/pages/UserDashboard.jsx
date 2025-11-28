import React, { useState } from "react";
import {
  FaTasks,
  FaPlus,
  FaClipboardList,
  FaClock,
  FaPauseCircle,
  FaCheckCircle,
  FaSearch,
  FaRocket,
  FaPlay,
  FaStop,
  FaChevronDown,
  FaClipboardCheck,
  FaCheckCircle as FaStatusCheck,
  FaTimesCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { useTaskDashboard } from "../hooks/useTaskDashboard";
import { createTask } from "../features/tasks/taskSlice";
import UserCreateTaskModal from "../features/users/components/UserCreateTaskModal";
import TaskAccordionList from "../features/tasks/components/TaskAccordionList";

// Define styling classes for different task statuses
const STATUS_COLORS = {
  inProcess: {
    valueClass: "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]",
    iconClass:
      "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.2)]",
    containerClass:
      "hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(52,211,153,0.1)]",
  },
  onHold: {
    valueClass: "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]",
    iconClass:
      "bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]",
    containerClass:
      "hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(251,191,36,0.1)]",
  },
  completed: {
    valueClass: "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]",
    iconClass:
      "bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.2)]",
    containerClass:
      "hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(96,165,250,0.1)]",
  },
  neutral: {
    valueClass: "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]",
    iconClass:
      "bg-white/5 border border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]",
    containerClass:
      "hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]",
  },
  pending: {
    valueClass: "text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.5)]",
    iconClass:
      "bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 shadow-[0_0_15px_rgba(232,121,249,0.2)]",
    containerClass:
      "hover:border-fuchsia-500/40 hover:shadow-[0_0_20px_rgba(232,121,249,0.1)]",
  },
  proposed: {
    valueClass: "text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]",
    iconClass:
      "bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.2)]",
    containerClass:
      "hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(192,132,252,0.1)]",
  },
};

// Define options for status filtering in the task list
const STATUS_FILTER_OPTIONS = [
  {
    value: "all",
    label: "All Tasks",
    activeClass:
      "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]",
    inactiveClass:
      "bg-transparent text-white/60 border-white/20 hover:border-white/50 hover:text-white",
  },
  {
    value: "proposed",
    label: "New",
    activeClass:
      "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_15px_rgba(192,132,252,0.3)]",
    inactiveClass:
      "bg-transparent text-purple-400/60 border-purple-500/20 hover:border-purple-500/50 hover:text-purple-300",
  },
  {
    value: "inprocess",
    label: "In Progress",
    activeClass:
      "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
    inactiveClass:
      "bg-black/20 text-emerald-400/60 border-emerald-500/20 hover:border-emerald-500/50 hover:text-emerald-300",
  },
  {
    value: "pending",
    label: "Pending",
    activeClass:
      "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.3)]",
    inactiveClass:
      "bg-transparent text-fuchsia-400/60 border-fuchsia-500/20 hover:border-fuchsia-500/50 hover:text-fuchsia-300",
  },
  {
    value: "onhold",
    label: "On Hold",
    activeClass:
      "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
    inactiveClass:
      "bg-transparent text-amber-400/60 border-amber-500/20 hover:border-amber-500/50 hover:text-amber-300",
  },
  {
    value: "completed",
    label: "Completed",
    activeClass:
      "bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]",
    inactiveClass:
      "bg-transparent text-blue-400/60 border-blue-500/20 hover:border-blue-500/50 hover:text-blue-300",
  },
  {
    value: "closed",
    label: "Closed",
    activeClass:
      "bg-slate-600/20 text-slate-300 border-slate-500/50 shadow-[0_0_15px_rgba(148,163,184,0.3)]",
    inactiveClass:
      "bg-transparent text-slate-400/60 border-slate-500/20 hover:border-slate-500/50 hover:text-slate-300",
  },
];

// Main UserDashboard functional component
const UserDashboard = () => {
  // Destructure values and functions from the custom task dashboard hook
  const {
    currentUser,
    tasks,
    users,
    stats,
    filters,
    expandedFilterPanel,
    isFilterActive,
    handleSearchChange,
    handleStatusSelect,
    handleClearFilters,
    toggleFilterPanel,
    taskHandlers,
    dispatch,
  } = useTaskDashboard("user");

  // State for controlling modal and bulk action visibility
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  const [confirmMarkAll, setConfirmMarkAll] = useState(false);

  // Async handler for creating a new task proposal
  const handleCreateTask = async (taskData) => {
    const timeInMinutes = parseInt(taskData.currentEstimatedTime) || 0;

    try {
      // Dispatch Redux action to create task, unwrap to handle errors
      await dispatch(
        createTask({
          ...taskData,
          initialEstimatedTime: timeInMinutes,
          currentEstimatedTime: timeInMinutes,
          assignedTo: [currentUser.id],
          assignedBy: currentUser.id, // Value sent for proposal context
        })
      ).unwrap();

      toast.success("New task proposed successfully!");
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Create Task Error:", error);
      toast.error(
        typeof error === "string" ? error : "Failed to propose task."
      );
    }
  };

  // Bulk action to start time tracking on all eligible tasks
  const handleStartAll = () => {
    const toStart = tasks.filter(
      (t) =>
        !t.timeTrackingStartedAt &&
        ["pending", "onhold", "inprocess"].includes(t.status)
    );
    if (!toStart.length) return toast.error("No tasks to start.");
    toStart.forEach((t) => taskHandlers.startTimer(t.id));
    toast.success(`Started ${toStart.length} tasks.`);
  };

  // Bulk action to stop time tracking on all currently running timers
  const handleStopAll = () => {
    const toStop = tasks.filter((t) => t.timeTrackingStartedAt);
    if (!toStop.length) return toast.error("No running timers.");
    toStop.forEach((t) => taskHandlers.stopTimer(t.id));
    toast.success(`Stopped ${toStop.length} tasks.`);
  };

  // Bulk action to mark all non-completed/closed tasks as completed
  const handleCompleteAll = () => {
    if (!confirmMarkAll) return toast.error("Please confirm first.");
    const toComplete = tasks.filter(
      (t) => t.status !== "completed" && t.status !== "closed"
    );
    // User confirmation before proceeding with bulk completion
    if (
      toComplete.length &&
      window.confirm(`Complete ${toComplete.length} tasks?`)
    ) {
      toComplete.forEach((t) => {
        if (t.timeTrackingStartedAt) taskHandlers.stopTimer(t.id);
        taskHandlers.updateTaskStatus(t.id, "completed");
      });
      toast.success("All tasks completed.");
    }
  };

  // Configuration for the statistical cards displayed at the top
  const statCards = [
    {
      label: "Total Assigned",
      value: stats.total,
      icon: <FaClipboardList />,
      styles: STATUS_COLORS.neutral,
    },
    {
      label: "New Proposals",
      value: stats.proposed,
      icon: <FaPlus />,
      styles: STATUS_COLORS.proposed,
    },
    {
      label: "In Process",
      value: stats.inProcess,
      icon: <FaClock />,
      styles: STATUS_COLORS.inProcess,
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: <FaClock />,
      styles: STATUS_COLORS.pending,
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: <FaCheckCircle />,
      styles: STATUS_COLORS.completed,
    },
  ];

  // Component rendering starts here
  return (
    <div className="min-h-screen px-6 md:px-12 py-8 font-sans">
      {/* Dashboard header section */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/10 pb-6 shadow-sm">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            User Dashboard
          </h1>
          <p className="text-white/70 text-sm mt-1 font-medium tracking-wide drop-shadow-sm">
            Welcome back, {currentUser?.name}
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-2.5 rounded-xl font-bold text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] bg-black/20 hover:bg-black/40 border border-white/20 transition-all flex items-center gap-2 backdrop-blur-md hover:scale-105"
        >
          <FaPlus /> <span>Propose Task</span>
        </button>
      </div>

      {/* Grid displaying the statistical summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {statCards.map((s) => (
          <div
            key={s.label}
            className={`bg-black/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg transition-all duration-300 p-5 flex items-center justify-between group hover:bg-black/40 hover:shadow-2xl ${s.styles.containerClass}`}
          >
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest group-hover:text-white/90 transition-colors drop-shadow-sm">
                {s.label}
              </p>
              <p
                className={`text-4xl font-black mt-2 transition-transform duration-300 group-hover:scale-105 ${s.styles.valueClass}`}
              >
                {s.value}
              </p>
            </div>
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:rotate-12 ${s.styles.iconClass}`}
            >
              {React.cloneElement(s.icon, { className: "text-2xl" })}
            </div>
          </div>
        ))}
      </div>

      {/* Task list and controls area */}
      <section className="w-full flex flex-col">
        {/* Task controls, filters, and actions */}
        <div className="relative z-30 bg-black/20 backdrop-blur-2xl border border-white/20 rounded-t-2xl p-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-4 grow">
              <h2 className="text-xl font-bold text-white flex items-center gap-3 drop-shadow-md">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-cyan-400 border border-white/10 shadow-inner">
                  <FaTasks />
                </div>
                Task Board
              </h2>

              <div className="flex items-center gap-3 flex-wrap grow min-w-0">
                <div className="relative w-full max-w-xs shrink-0 group">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/80 transition-colors w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Filter tasks..."
                    value={filters.search}
                    onChange={handleSearchChange}
                    className="w-full p-2.5 pl-10 border border-white/10 rounded-xl bg-black/40 text-white placeholder-white/30 focus:ring-1 focus:ring-white/50 focus:bg-black/30 transition-all text-sm shadow-inner"
                  />
                </div>

                <button
                  onClick={() => toggleFilterPanel("status")}
                  className={`px-4 py-2.5 text-sm font-bold rounded-xl border flex items-center gap-2 shrink-0 transition-all shadow-sm ${
                    expandedFilterPanel === "status"
                      ? "bg-white text-black border-white shadow-lg"
                      : "bg-black/20 border-white/10 text-white/70 hover:bg-black/40 hover:border-white/30"
                  }`}
                >
                  <FaCheckCircle />
                  {STATUS_FILTER_OPTIONS.find((o) => o.value === filters.status)
                    ?.label || "Status"}
                  <FaChevronDown
                    className={`transition-transform duration-200 ${
                      expandedFilterPanel === "status" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isFilterActive && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2.5 text-sm font-bold rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 flex items-center gap-2 shrink-0 transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                  >
                    <FaTimesCircle /> Clear
                  </button>
                )}
              </div>
            </div>

            <div className="relative shrink-0">
              <button
                onClick={() => setIsBulkActionsOpen(!isBulkActionsOpen)}
                className="text-sm font-bold flex items-center gap-2 text-white bg-black/20 hover:bg-black/40 border border-white/10 hover:border-white/30 px-4 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <FaRocket className="text-fuchsia-400 drop-shadow-[0_0_5px_rgba(232,121,249,0.8)]" />{" "}
                Actions
                <FaChevronDown
                  className={`transition-transform duration-200 ${
                    isBulkActionsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isBulkActionsOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-[#1a1a1a] border border-white/20 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 p-4 space-y-3 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleStartAll}
                      className="py-2 text-xs font-bold rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all"
                    >
                      <FaPlay className="inline mr-1" /> Start All
                    </button>
                    <button
                      onClick={handleStopAll}
                      className="py-2 text-xs font-bold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 hover:shadow-[0_0_10px_rgba(245,158,11,0.2)] transition-all"
                    >
                      <FaStop className="inline mr-1" /> Stop All
                    </button>
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <label className="flex items-center text-xs font-medium text-white/60 mb-3 cursor-pointer hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={confirmMarkAll}
                        onChange={(e) => setConfirmMarkAll(e.target.checked)}
                        className="mr-2 rounded border-white/30 bg-black/50 checked:bg-emerald-500"
                      />
                      Confirm Complete All
                    </label>
                    <button
                      onClick={handleCompleteAll}
                      disabled={!confirmMarkAll}
                      className="w-full py-2.5 text-sm rounded-lg font-bold bg-emerald-600 text-white shadow-lg hover:bg-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                      <FaClipboardCheck className="inline mr-2" /> Execute
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Collapsible panel for status filter buttons */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              expandedFilterPanel === "status"
                ? "max-h-40 mb-4 opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-4 bg-black/30 rounded-xl border border-white/10 flex flex-wrap gap-2 shadow-inner">
              <span className="text-xs text-white/50 uppercase font-bold tracking-widest self-center mr-2">
                Select Filter:
              </span>
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusSelect(opt.value)}
                  className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wide rounded-full border transition-all ${
                    filters.status === opt.value
                      ? opt.activeClass + " scale-105"
                      : opt.inactiveClass
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Task list display component */}
        <div className="relative z-10 bg-black/20 backdrop-blur-xl border-x border-b border-white/20 rounded-b-2xl p-6 shadow-2xl min-h-[400px]">
          <TaskAccordionList
            filteredTasks={tasks}
            handlers={taskHandlers}
            mode="user"
          />
        </div>
      </section>

      {/* Modal for creating a new task */}
      {isCreateModalOpen && currentUser && (
        <UserCreateTaskModal
          users={users}
          onCreateTask={handleCreateTask}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
};

export default UserDashboard;
