import React, { useState } from "react";
import {
  FaTimes,
  FaBell,
  FaCheck,
  FaBan,
  FaClock,
  FaHeading,
  FaAlignLeft,
  FaUsers,
} from "react-icons/fa";
import {
  formatMinutesToTime,
  minutesToDurationObject,
  durationToMinutes,
} from "../../../utils/timeUtils";
import DurationInput from "../../../components/common/DurationInput";

const TaskEditModal = ({
  task,
  users,
  onSave,
  onClose,
  approveBaselineRequest,
  rejectBaselineRequest,
}) => {
  // Task fields
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description);
  const [assignedUsers, setAssignedUsers] = useState(task.assignedTo);
  const [status, setStatus] = useState(task.status);

  // Time fields
  const initTime = minutesToDurationObject(task.currentEstimatedTime);
  const [days, setDays] = useState(initTime.d);
  const [hours, setHours] = useState(initTime.h);
  const [minutes, setMinutes] = useState(initTime.m);

  const [errors, setErrors] = useState({});

  const hasPendingRequest = task.userSuggestedBaseline !== null;
  const requestedMinutes = task.userSuggestedBaseline;
  const assignableUsers = users.filter((u) => u.role !== "manager"); // only non-managers

  // Approve baseline request
  const handleApprove = () => {
    if (
      window.confirm(
        `Approve new baseline of ${formatMinutesToTime(requestedMinutes)}?`
      )
    ) {
      approveBaselineRequest(task.id, requestedMinutes);
      onClose();
    }
  };

  // Reject baseline request
  const handleReject = () => {
    if (window.confirm("Reject baseline request?")) {
      rejectBaselineRequest(task.id);
      onClose();
    }
  };

  // Save task changes
  const handleSubmit = (e) => {
    e.preventDefault();
    const newTotalMinutes = durationToMinutes(days, hours, minutes);

    if (
      !name ||
      !description ||
      newTotalMinutes === 0 ||
      assignedUsers.length === 0
    ) {
      setErrors({ general: "Please check all fields." }); // validate fields
      return;
    }

    onSave(task.id, {
      name,
      description,
      currentEstimatedTime: newTotalMinutes,
      initialEstimatedTime: newTotalMinutes,
      assignedTo: assignedUsers,
      status,
    });
    onClose();
  };

  const labelClass =
    "block text-xs font-bold text-white/50 uppercase tracking-[0.15em] mb-2 flex items-center gap-2";
  const inputClass =
    "w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-cyan-500/50 transition-all text-sm";

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex justify-center items-center z-50 p-4 animate-fadeIn">
      <div className="bg-[#0F0F12] p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-white/20 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/40 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors z-50"
        >
          <FaTimes />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-black text-white mb-8 border-b border-white/10 pb-4 flex items-center gap-3">
          <span className="text-indigo-500">Edit</span> Task{" "}
          <span className="text-white/20 font-mono text-lg font-normal">
            #{task.id.slice(-4)}
          </span>
        </h2>

        {/* General errors */}
        {errors.general && (
          <div className="p-3 mb-6 text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-bold text-center uppercase tracking-wider">
            {errors.general}
          </div>
        )}

        {/* Pending baseline request */}
        {hasPendingRequest && (
          <div className="p-4 mb-8 bg-fuchsia-900/10 border border-fuchsia-500/30 rounded-2xl space-y-4 animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 bg-fuchsia-500/5 blur-xl"></div>
            <p className="text-sm font-bold text-fuchsia-300 flex items-center relative z-10">
              <FaBell className="mr-2" /> Request:{" "}
              {formatMinutesToTime(requestedMinutes)}
            </p>
            <div className="flex gap-3 relative z-10">
              <button
                type="button"
                onClick={handleApprove}
                className="flex-1 py-2 text-xs font-bold bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/30"
              >
                APPROVE
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="flex-1 py-2 text-xs font-bold bg-red-500/20 text-red-300 rounded-lg border border-red-500/30 hover:bg-red-500/30"
              >
                REJECT
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {/* Task Name */}
          <div>
            <label className={labelClass}>
              <FaHeading className="text-indigo-500" /> Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>
              <FaAlignLeft className="text-indigo-500" /> Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} h-24 resize-none`}
              required
            />
          </div>

          {/* Status */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className={labelClass}>
                <FaCheck className="text-indigo-500" /> Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`${inputClass} [&>option]:bg-black`}
              >
                <option value="inprocess">In Process</option>
                <option value="onhold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Time Budget */}
          <div>
            <label className={labelClass}>
              <FaClock className="text-indigo-500" /> Time Budget
            </label>
            <DurationInput
              days={days}
              setDays={setDays}
              hours={hours}
              setHours={setHours}
              minutes={minutes}
              setMinutes={setMinutes}
              error={false}
            />
          </div>

          {/* Assignees */}
          <div>
            <label className={labelClass}>
              <FaUsers className="text-indigo-500" /> Assignees
            </label>
            <select
              multiple
              value={assignedUsers}
              onChange={(e) =>
                setAssignedUsers(
                  Array.from(e.target.options)
                    .filter((o) => o.selected)
                    .map((o) => o.value)
                )
              }
              className={`${inputClass} h-24 custom-scrollbar [&>option]:bg-black`}
              required
            >
              {assignableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.username})
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-white/10 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-6 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors font-bold text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={hasPendingRequest}
              className="py-3 px-8 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskEditModal;
