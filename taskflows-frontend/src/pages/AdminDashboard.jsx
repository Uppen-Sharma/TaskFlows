import React, { useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  FaClipboardList,
  FaUsers,
  FaPlus,
  FaTimesCircle,
  FaSpinner,
  FaClock,
  FaCheckCircle,
  FaPauseCircle,
  FaSearch,
  FaTasks,
  FaUser,
  FaChevronDown,
  FaBell,
} from "react-icons/fa";

// Hooks
import { useTaskDashboard } from "../hooks/useTaskDashboard";
import {
  createTask,
  updateTask,
  deleteTask,
} from "../features/tasks/taskSlice";

// Components
import TaskEditModal from "../features/tasks/components/TaskEditModal";
import TaskForm from "../features/tasks/components/TaskForm";
import TaskAccordionList from "../features/tasks/components/TaskAccordionList";
import UserList from "../features/users/components/UserList";
import ProposalApprovalModal from "../features/tasks/components/ProposalApprovalModal";

// --- GLOWING STAT STYLES ---
const ADMIN_STATUS_COLORS = {
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
  pending: {
    valueClass: "text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.5)]",
    iconClass:
      "bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 shadow-[0_0_15px_rgba(232,121,249,0.2)]",
    containerClass:
      "hover:border-fuchsia-500/40 hover:shadow-[0_0_20px_rgba(232,121,249,0.1)]",
  },
  neutral: {
    valueClass: "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]",
    iconClass:
      "bg-white/5 border border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]",
    containerClass:
      "hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]",
  },
};

const STATUS_FILTER_OPTIONS = [
  {
    value: "all",
    label: "All Statuses",
    activeClass:
      "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]",
    inactiveClass:
      "bg-transparent text-white/60 border-white/20 hover:border-white/50 hover:text-white",
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
      "bg-black/20 text-fuchsia-400/60 border-fuchsia-500/20 hover:border-fuchsia-500/50 hover:text-fuchsia-300",
  },
  {
    value: "onhold",
    label: "On Hold",
    activeClass:
      "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
    inactiveClass:
      "bg-black/20 text-amber-400/60 border-amber-500/20 hover:border-amber-500/50 hover:text-amber-300",
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

const AdminStatCard = ({ label, value, icon, styles }) => (
  <div
    className={`bg-black/50 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg transition-all duration-300 p-5 flex items-center justify-between group hover:bg-black/75 ${styles.containerClass}`}
  >
    <div>
      <p className="text-white/60 text-xs font-bold uppercase tracking-widest group-hover:text-white/90 transition-colors drop-shadow-sm">
        {label}
      </p>
      <p
        className={`text-4xl font-black mt-2 transition-transform duration-300 group-hover:scale-105 ${styles.valueClass}`}
      >
        {value}
      </p>
    </div>
    <div
      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:rotate-12 ${styles.iconClass}`}
    >
      {React.cloneElement(icon, { className: "text-2xl" })}
    </div>
  </div>
);

const CreateTaskModal = ({ users, managerId, onCreateTask, onClose }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center items-center p-4 animate-fadeIn">
    <div className="bg-[#0F0F12] p-8 rounded-3xl shadow-2xl w-full max-w-5xl min-h-[600px] border border-white/20 relative overflow-hidden flex flex-col">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-white/40 hover:text-white rounded-full hover:bg-white/10 transition-colors z-50 cursor-pointer"
      >
        <FaTimesCircle size={28} />
      </button>
      <h2 className="text-3xl font-black text-white mb-8 border-b border-white/10 pb-6 flex items-center gap-4 tracking-tight relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-fuchsia-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-fuchsia-500/20">
          <FaPlus size={24} />
        </div>
        Create New Task
      </h2>
      <div className="grow relative z-10">
        <TaskForm
          onCreateTask={onCreateTask}
          users={users}
          managerId={managerId}
          isUserView={false}
        />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const {
    currentUser,
    tasks,
    users,
    stats,
    loading,
    error,
    filters,
    expandedFilterPanel,
    isFilterActive,
    handleSearchChange,
    handleStatusSelect,
    handleUserSelect,
    handleClearFilters,
    toggleFilterPanel,
    expandedUserIds,
    setExpandedUserIds,
    taskHandlers,
    dispatch,
  } = useTaskDashboard("manager");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState("");

  const proposedTasks = tasks.filter((t) => t.status === "proposed");
  const activeTasks = tasks.filter((t) => t.status !== "proposed");

  const openEditModal = (task) => {
    if (task.timeTrackingStartedAt)
      return toast.error("Timer is running. Cannot edit.");
    setTaskToEdit(task);
    setIsEditModalOpen(true);
  };

  const adminTaskHandlers = { ...taskHandlers, handleEditClick: openEditModal };

  const handleSaveEdit = (taskId, updatedFields) => {
    dispatch(updateTask({ taskId, updatedFields }));
    toast.success("Task updated!");
    setIsEditModalOpen(false);
  };

  const handleCreateTask = (taskData) => {
    const timeInMinutes = parseInt(taskData.currentEstimatedTime) || 0;
    dispatch(
      createTask({
        ...taskData,
        initialEstimatedTime: timeInMinutes,
        currentEstimatedTime: timeInMinutes,
        status: "inprocess",
        assignedBy: currentUser.id,
      })
    );
    toast.success("Task created!");
    setIsCreateModalOpen(false);
  };

  const handleApproveProposal = (task) => {
    dispatch(
      updateTask({ taskId: task.id, updatedFields: { status: "inprocess" } })
    );
    toast.success("Task approved & moved to In Progress.");
  };

  const handleRejectProposal = (taskId) => {
    if (window.confirm("Reject and delete this proposal?")) {
      dispatch(deleteTask(taskId));
      toast.success("Proposal rejected.");
    }
  };

  const filteredUsers = useMemo(() => {
    if (!userSearchTerm) return users;
    return users.filter((u) =>
      u.name.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  }, [users, userSearchTerm]);

  const assignableUsers = useMemo(
    () => users.filter((u) => u.role !== "manager"),
    [users]
  );

  const toggleUserDetails = (userId) => {
    setExpandedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <main className="min-h-screen px-6 md:px-12 py-8 font-sans">
      {/* HEADER */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            Manager Dashboard
          </h1>
          <p className="text-white/70 text-sm mt-1 font-medium tracking-wide">
            Oversee team performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          {proposedTasks.length > 0 && (
            <button
              onClick={() => setIsProposalModalOpen(true)}
              className="px-6 py-2.5 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(232,121,249,0.4)] bg-fuchsia-600 hover:bg-fuchsia-500 border border-white/20 transition-all flex items-center gap-2 animate-pulse"
            >
              <FaBell className="animate-bounce" /> Review Proposals (
              {proposedTasks.length})
            </button>
          )}

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-2.5 rounded-xl font-bold text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] bg-black/20 hover:bg-black/40 border border-white/20 transition-all flex items-center gap-2 backdrop-blur-md"
          >
            <FaPlus /> Create New Task
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center p-10 text-white text-2xl font-bold">
          <FaSpinner className="animate-spin inline mr-3 text-cyan-400" />{" "}
          Loading...
        </div>
      )}
      {error && (
        <div className="text-center p-10 bg-red-900/40 border border-red-500 rounded-xl text-red-200">
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            <AdminStatCard
              label="Total Tasks"
              value={activeTasks.length}
              icon={<FaClipboardList />}
              styles={ADMIN_STATUS_COLORS.neutral}
            />
            <AdminStatCard
              label="New Proposals"
              value={proposedTasks.length}
              icon={<FaTasks />}
              styles={ADMIN_STATUS_COLORS.pending}
            />
            <AdminStatCard
              label="In Process"
              value={stats.inProcess}
              icon={<FaClock />}
              styles={ADMIN_STATUS_COLORS.inProcess}
            />
            <AdminStatCard
              label="On Hold"
              value={stats.onHold}
              icon={<FaPauseCircle />}
              styles={ADMIN_STATUS_COLORS.onHold}
            />
            <AdminStatCard
              label="Completed"
              value={stats.completed}
              icon={<FaCheckCircle />}
              styles={ADMIN_STATUS_COLORS.completed}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT: Task Manager */}
            <section className="w-full lg:flex-3 flex flex-col">
              <div className="relative z-30 bg-black/20 backdrop-blur-2xl border border-white/20 rounded-t-2xl p-6 shadow-2xl">
                <div className="flex flex-col gap-4 border-b border-white/10 pb-4 mb-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3 drop-shadow-md">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-cyan-400 border border-white/10 shadow-inner">
                        <FaClipboardList />
                      </div>
                      Manage Tasks
                    </h2>
                    {isFilterActive && (
                      <button
                        onClick={handleClearFilters}
                        className="p-2 bg-red-500/10 text-red-300 rounded-lg hover:bg-red-500/20 border border-red-500/20 text-xs font-bold uppercase transition-all"
                      >
                        <FaTimesCircle className="inline mr-1" /> Clear
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px] group">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/80 transition-colors" />
                      <input
                        type="text"
                        placeholder="Search active tasks..."
                        value={filters.search}
                        onChange={handleSearchChange}
                        className="w-full p-2.5 pl-10 border border-white/10 rounded-xl bg-black/40 text-white placeholder-white/30 focus:ring-1 focus:ring-white/50 focus:bg-black/30 transition-all text-sm shadow-inner"
                      />
                    </div>
                    <button
                      onClick={() => toggleFilterPanel("status")}
                      className={`px-3 py-2.5 text-sm font-bold rounded-xl border flex items-center gap-2 transition-all ${
                        expandedFilterPanel === "status"
                          ? "bg-white text-black border-white shadow-lg"
                          : "bg-black/20 border-white/10 text-white/70 hover:bg-black/40 hover:border-white/30"
                      }`}
                    >
                      <FaCheckCircle /> Status <FaChevronDown />
                    </button>
                    <button
                      onClick={() => toggleFilterPanel("user")}
                      className={`px-3 py-2.5 text-sm font-bold rounded-xl border flex items-center gap-2 transition-all ${
                        expandedFilterPanel === "user"
                          ? "bg-white text-black border-white shadow-lg"
                          : "bg-black/20 border-white/10 text-white/70 hover:bg-black/40 hover:border-white/30"
                      }`}
                    >
                      <FaUser /> User <FaChevronDown />
                    </button>
                  </div>
                  <div
                    className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedFilterPanel
                        ? "max-h-64 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="bg-black/30 border border-white/10 rounded-xl p-4 mt-2 shadow-inner">
                      {expandedFilterPanel === "status" && (
                        <div className="flex flex-wrap gap-2">
                          {STATUS_FILTER_OPTIONS.filter(
                            (o) => o.value !== "proposed"
                          ).map((opt) => (
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
                      )}
                      {expandedFilterPanel === "user" && (
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                          <button
                            onClick={() => handleUserSelect("")}
                            className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                              filters.assignedUser === ""
                                ? "bg-white text-black"
                                : "bg-black/20 text-white/60 border-white/10 hover:bg-black/40"
                            }`}
                          >
                            All Users
                          </button>
                          {assignableUsers.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => handleUserSelect(u.id)}
                              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                                filters.assignedUser === u.id
                                  ? "bg-cyan-500 text-black border-cyan-400"
                                  : "bg-black/20 text-white/60 border-white/10 hover:bg-black/40"
                              }`}
                            >
                              {u.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative z-10 bg-black/20 backdrop-blur-xl border-x border-b border-white/20 rounded-b-2xl p-6 shadow-2xl min-h-[400px]">
                <TaskAccordionList
                  filteredTasks={activeTasks}
                  handlers={adminTaskHandlers}
                  mode="manager"
                />
              </div>
            </section>

            <section className="w-full lg:flex-1 bg-black/20 backdrop-blur-2xl rounded-2xl shadow-2xl flex flex-col p-6 md:p-8 border border-white/20 h-fit sticky top-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3 drop-shadow-md">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white border border-white/10 shadow-inner">
                  <FaUsers />
                </div>
                Team Members
              </h2>
              <div className="relative mb-4 group">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/80 transition-colors" />
                <input
                  type="text"
                  placeholder="Search user..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full p-2.5 pl-10 border border-white/10 rounded-xl bg-black/40 text-white placeholder-white/30 focus:ring-1 focus:ring-white/50 transition-all text-sm shadow-inner"
                />
              </div>
              <UserList
                users={filteredUsers}
                tasks={activeTasks}
                expandedUserIds={expandedUserIds}
                onToggleUserDetails={toggleUserDetails}
              />
            </section>
          </div>
        </>
      )}

      {isCreateModalOpen && (
        <CreateTaskModal
          users={users}
          managerId={currentUser.id}
          onCreateTask={handleCreateTask}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
      {isEditModalOpen && taskToEdit && (
        <TaskEditModal
          task={taskToEdit}
          users={users}
          onSave={handleSaveEdit}
          onClose={() => setIsEditModalOpen(false)}
          approveBaselineRequest={taskHandlers.approveBaselineRequest}
          rejectBaselineRequest={taskHandlers.rejectBaselineRequest}
        />
      )}
      {isProposalModalOpen && (
        <ProposalApprovalModal
          proposals={proposedTasks}
          users={users}
          onApprove={handleApproveProposal}
          onReject={handleRejectProposal}
          onClose={() => setIsProposalModalOpen(false)}
        />
      )}
    </main>
  );
};

export default AdminDashboard;
