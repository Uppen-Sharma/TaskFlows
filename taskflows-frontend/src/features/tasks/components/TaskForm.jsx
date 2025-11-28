import React, { useState } from "react";
import {
  FaClock,
  FaAlignLeft,
  FaHeading,
  FaUsers,
  FaSearch,
  FaCheckCircle,
  FaRegCircle,
} from "react-icons/fa";
import DurationInput from "../../../components/common/DurationInput";
import { durationToMinutes } from "../../../utils/timeUtils";

const TaskForm = ({
  onCreateTask,
  users,
  managerId,
  defaultAssignedUserIds = [],
  isUserView = false,
}) => {
  // Task fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Time fields
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  // Assignment fields
  const [assignedUsers, setAssignedUsers] = useState(defaultAssignedUserIds);
  const [userSearch, setUserSearch] = useState("");
  const [errors, setErrors] = useState({});

  const assignableUsers = users.filter((u) => u.role !== "manager"); // only non-managers

  const filteredUsers = assignableUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Validate fields
  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Required";
    if (!description.trim()) newErrors.description = "Required";

    const totalMins = durationToMinutes(days, hours, minutes);
    if (totalMins === 0) newErrors.time = "Time required";

    if (!isUserView && assignedUsers.length === 0)
      newErrors.assignedUsers = "Select a user";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const totalMinutes = durationToMinutes(days, hours, minutes);
    const finalAssignedUsers = isUserView
      ? defaultAssignedUserIds
      : assignedUsers;

    onCreateTask(
      {
        name,
        description,
        currentEstimatedTime: totalMinutes,
        assignedTo: finalAssignedUsers,
      },
      managerId
    );

    // Reset form
    setName("");
    setDescription("");
    setDays("");
    setHours("");
    setMinutes("");
    setAssignedUsers(defaultAssignedUserIds);
    setErrors({});
    setUserSearch("");
  };

  // Toggle user assignment
  const toggleUser = (userId) => {
    setAssignedUsers((prev) => {
      const newSelection = prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];
      if (errors.assignedUsers)
        setErrors((e) => ({ ...e, assignedUsers: null }));
      return newSelection;
    });
  };

  const labelClass =
    "block text-xs font-bold text-white/60 uppercase tracking-[0.15em] mb-2 ml-1 flex items-center gap-2";
  const inputClass =
    "w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all shadow-inner backdrop-blur-sm text-sm";
  const errorClass =
    "text-red-400 text-[10px] mt-1 ml-1 font-bold uppercase tracking-wide animate-pulse";

  return (
    <div className="h-full">
      <form
        onSubmit={handleSubmit}
        className={`h-full flex flex-col ${
          !isUserView ? "lg:grid lg:grid-cols-12 lg:gap-8" : ""
        }`}
      >
        {/* LEFT COLUMN */}
        <div
          className={`space-y-6 flex flex-col ${
            !isUserView ? "lg:col-span-7" : "w-full max-w-2xl mx-auto"
          }`}
        >
          {/* Task Name */}
          <div>
            <label className={labelClass}>
              <FaHeading className="text-cyan-400" /> Task Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Update Landing Page"
              className={`${inputClass} ${
                errors.name ? "border-red-500/50 bg-red-500/10" : ""
              }`}
            />
            {errors.name && <p className={errorClass}>{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="grow">
            <label className={labelClass}>
              <FaAlignLeft className="text-cyan-400" /> Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the requirements..."
              className={`${inputClass} h-32 lg:h-48 resize-none ${
                errors.description ? "border-red-500/50 bg-red-500/10" : ""
              }`}
            />
            {errors.description && (
              <p className={errorClass}>{errors.description}</p>
            )}
          </div>

          {/* Time Duration */}
          <div>
            <label className={labelClass}>
              <FaClock className="text-cyan-400" /> Time Duration
            </label>
            <DurationInput
              days={days}
              setDays={setDays}
              hours={hours}
              setHours={setHours}
              minutes={minutes}
              setMinutes={setMinutes}
              error={errors.time}
            />
            {errors.time && <p className={errorClass}>{errors.time}</p>}
          </div>

          {/* User View Submit */}
          {isUserView && (
            <button
              type="submit"
              className="w-full py-4 mt-4 rounded-2xl font-bold text-white shadow-[0_0_25px_rgba(219,39,119,0.4)] bg-linear-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 border border-white/20 uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
            >
              Propose Task
            </button>
          )}
        </div>

        {/* RIGHT COLUMN (Admin Only) */}
        {!isUserView && (
          <div className="flex flex-col h-full mt-8 lg:mt-0 lg:col-span-5">
            {/* Assign Team Label */}
            <label className={labelClass}>
              <FaUsers className="text-cyan-400" /> Assign Team{" "}
              <span className="ml-auto text-white/50 text-[10px] bg-white/10 px-2 py-0.5 rounded-full border border-white/5">
                {assignedUsers.length} Selected
              </span>
            </label>

            {/* User List */}
            <div
              className={`flex flex-col grow bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-inner backdrop-blur-md ${
                errors.assignedUsers ? "border-red-500/50" : ""
              }`}
            >
              {/* Search Box */}
              <div className="p-4 border-b border-white/10 bg-black/20">
                <div className="relative group">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs group-focus-within:text-white transition-colors" />
                  <input
                    type="text"
                    placeholder="Find member..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all focus:bg-black/40"
                  />
                </div>
              </div>

              {/* Users */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar h-64 lg:h-auto">
                {filteredUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-white/30 text-xs italic">
                    No users found.
                  </div>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = assignedUsers.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => toggleUser(user.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border group ${
                          isSelected
                            ? "bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                            : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
                        }`}
                      >
                        {/* User Avatar / Check */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                            isSelected
                              ? "border-cyan-400 bg-cyan-400 text-black shadow-lg scale-110"
                              : "border-white/20 text-white/40 group-hover:border-white/40 group-hover:text-white"
                          }`}
                        >
                          {isSelected ? (
                            <FaCheckCircle size={14} />
                          ) : (
                            <span className="text-xs font-bold">
                              {user.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        {/* User Info */}
                        <div className="flex flex-col">
                          <span
                            className={`text-sm font-bold transition-colors ${
                              isSelected
                                ? "text-white"
                                : "text-white/70 group-hover:text-white"
                            }`}
                          >
                            {user.name}
                          </span>
                          <span className="text-[10px] text-white/40 font-mono">
                            @{user.username}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Assignment Errors */}
            {errors.assignedUsers && (
              <p className={errorClass}>{errors.assignedUsers}</p>
            )}

            {/* Admin Submit */}
            <button
              type="submit"
              className="w-full py-4 mt-4 rounded-2xl font-bold text-white shadow-[0_0_25px_rgba(219,39,119,0.4)] bg-linear-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 border border-white/20 uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
            >
              Create Task
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default TaskForm;
