import React, { useMemo } from "react";
import {
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaCrown,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

// calculate total, completed, pending tasks for a user
const calculateUserStats = (user, allTasks) => {
  const userTasks = allTasks.filter((task) =>
    task.assignedTo.includes(user.id)
  );
  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter(
    (task) => task.status === "completed"
  ).length;
  const pendingTasks = totalTasks - completedTasks;
  return { totalTasks, completedTasks, pendingTasks };
};

const UserList = ({ users, tasks, expandedUserIds, onToggleUserDetails }) => {
  // attach task stats to each user
  const usersWithStats = useMemo(() => {
    if (!users || !tasks) return [];
    return users.map((user) => ({
      ...user,
      stats: calculateUserStats(user, tasks),
    }));
  }, [users, tasks]);

  if (!users)
    return (
      <div className="text-center text-white/70">
        Loading... <FaSpinner className="inline animate-spin ml-2" />
      </div>
    );
  if (users.length === 0)
    return (
      <div className="p-4 text-center text-white/70 rounded-xl bg-white/5 border border-white/10">
        No users found.
      </div>
    );

  return (
    <div className="space-y-2">
      {usersWithStats.map((user) => {
        const isExpanded = expandedUserIds.includes(user.id); // check if user panel expanded
        return (
          <div
            key={user.id}
            className="bg-black/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:bg-black/25 hover:border-white/20 group shadow-md"
          >
            {/* Header with avatar and toggle */}
            <div
              onClick={() => onToggleUserDetails(user.id)}
              className="flex items-center space-x-4 p-3 cursor-pointer"
            >
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold shrink-0 shadow-inner ${
                  user.role === "manager"
                    ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30"
                    : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                }`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>

              {/* Name and manager crown */}
              <div className="grow flex items-center gap-2 overflow-hidden">
                <h4 className="text-sm font-bold text-white/80 truncate group-hover:text-white drop-shadow-sm">
                  {user.name}
                </h4>
                {user.role === "manager" && (
                  <FaCrown
                    className="w-3 h-3 text-fuchsia-400 shrink-0"
                    title="Manager"
                  />
                )}
              </div>

              {/* Expand/collapse icon */}
              <div className="text-white/40 group-hover:text-white/80 transition-colors">
                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>

            {/* Expandable stats panel */}
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="space-y-2 text-xs pb-4 px-4 pt-2 bg-black/20 border-t border-white/10">
                {/* Total tasks */}
                <div className="flex items-center justify-between text-white/70">
                  <span className="flex items-center gap-2 text-indigo-300">
                    <FaTasks /> Total:
                  </span>
                  <span className="font-bold text-white">
                    {user.stats.totalTasks}
                  </span>
                </div>

                {/* Completed tasks */}
                <div className="flex items-center justify-between text-white/70">
                  <span className="flex items-center gap-2 text-emerald-300">
                    <FaCheckCircle /> Done:
                  </span>
                  <span className="font-bold text-white">
                    {user.stats.completedTasks}
                  </span>
                </div>

                {/* Pending tasks */}
                <div className="flex items-center justify-between text-white/70">
                  <span className="flex items-center gap-2 text-amber-300">
                    <FaClock /> Pending:
                  </span>
                  <span className="font-bold text-white">
                    {user.stats.pendingTasks}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserList;
