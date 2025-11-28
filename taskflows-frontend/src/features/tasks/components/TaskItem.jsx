import React, { useState, useEffect } from "react";
import {
  FaClock,
  FaSave,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaInfoCircle,
  FaPlay,
  FaStop,
  FaTools,
  FaHourglassHalf,
  FaEdit,
  FaTrash,
  FaBell,
  FaTimesCircle,
  FaPauseCircle,
  FaPlayCircle,
  FaCircle,
  FaUsers,
  FaSyncAlt,
} from "react-icons/fa";
import { useTaskTimeCalculations } from "../../tasks/hooks/useTaskTimeCalculations";
import {
  minutesToDurationObject,
  durationToMinutes,
} from "../../../utils/timeUtils";
import DurationInput from "../../../components/common/DurationInput";

const TaskItem = ({ task, isExpanded, toggleExpand, handlers, mode }) => {
  const isManager = mode === "manager";

  // Custom hook for timer calculations
  const {
    remainingMinutes,
    isTimeExpired,
    isTimerRunning,
    initialTimeDisplay,
    currentTimeDisplay,
    timeDiffers,
  } = useTaskTimeCalculations(task);

  const ToggleIcon = isExpanded ? FaChevronUp : FaChevronDown;

  // Local state for manual time input
  const [d, setD] = useState("");
  const [h, setH] = useState("");
  const [m, setM] = useState("");

  // Sync inputs with remaining time
  useEffect(() => {
    const timeObj = minutesToDurationObject(remainingMinutes);
    setD(timeObj.d);
    setH(timeObj.h);
    setM(timeObj.m);
  }, [remainingMinutes]);

  // Apply manual time adjustment
  const handleManualTimeUpdate = () => {
    const newTotal = durationToMinutes(d, h, m);
    handlers.handleTimeAdjust(task.id, newTotal);
  };

  // Task status flags
  const currentStatus = task.status;
  const isCompleted = currentStatus === "completed";
  const isClosed = currentStatus === "closed";
  const isLocked = isClosed;
  const hasPendingRequest = task.userSuggestedBaseline !== null;
  const showRequestButton =
    !isManager && timeDiffers && !isTimerRunning && !hasPendingRequest;

  // Get styles based on status
  const getStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.2)]";
      case "closed":
        return "bg-slate-500/20 text-slate-300 border-slate-500/40";
      case "onhold":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(251,191,36,0.2)]";
      case "pending":
        return "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40 shadow-[0_0_10px_rgba(232,121,249,0.2)]";
      case "inprocess":
      default:
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]";
    }
  };

  return (
    <div
      className={`group relative flex flex-col bg-black/10 backdrop-blur-md border border-white/20 rounded-xl transition-all duration-300 hover:border-white/40 hover:bg-black/40 hover:shadow-2xl ${
        isLocked ? "opacity-60 grayscale" : ""
      }`}
    >
      {/*  HEADER  */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 cursor-pointer gap-4"
        onClick={() => toggleExpand(task.id)}
      >
        <div className="flex items-center gap-4 grow min-w-0">
          {/* Status Stripe */}
          <div
            className={`w-1.5 h-14 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)] ${getStatusStyle(
              currentStatus
            )
              .split(" ")[1]
              .replace("text", "bg")}`}
          ></div>

          {/* Task name and meta */}
          <div className="flex flex-col gap-2 min-w-0 w-full">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-white/60 tracking-wider drop-shadow-sm">
                #{task.id.slice(-4)}
              </span>
              <span
                className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border flex items-center gap-1.5 ${getStatusStyle(
                  currentStatus
                )}`}
              >
                <FaCircle className="w-1.5 h-1.5" />
                {currentStatus}
              </span>

              {/* Timer running indicator */}
              {isTimerRunning && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 animate-pulse shadow-lg">
                  Running
                </span>
              )}

              {/* Pending baseline request indicator */}
              {hasPendingRequest && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-fuchsia-500/30 text-fuchsia-200 border border-fuchsia-400/50 shadow-lg">
                  <FaBell /> Request
                </span>
              )}
            </div>

            {/* Task title and manager controls */}
            <div className="flex items-center justify-between pr-4">
              <span className="text-lg font-bold text-white truncate transition-colors drop-shadow-md mr-4">
                {task.name}
              </span>

              {isManager && (
                <div className="flex items-center gap-2 shrink-0">
                  {/* Edit Task */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlers.handleEditClick(task);
                    }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-white/60 hover:text-indigo-300 border border-white/10 transition-all shadow-sm"
                    title="Edit Task"
                  >
                    <FaEdit size={16} />
                  </button>

                  {/* Delete Task */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlers.handleDeleteClick(task.id, task.name);
                    }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-300 border border-white/10 transition-all shadow-sm"
                    title="Delete Task"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Info */}
        <div className="flex items-center gap-6 pl-5 sm:pl-0 sm:border-l sm:border-white/20 sm:h-12">
          {/* Time remaining */}
          <div className="flex flex-col items-end sm:pl-6">
            <span className="text-[9px] text-white/70 uppercase tracking-[0.2em] font-bold drop-shadow-sm">
              Time Remaining
            </span>
            <span
              className={`font-mono font-bold text-base tracking-tight drop-shadow-md ${
                isTimeExpired ? "text-amber-300" : "text-white"
              }`}
              title={`Initial: ${initialTimeDisplay}`}
            >
              {currentTimeDisplay}
            </span>
          </div>

          {/* Expand/Collapse */}
          <div className="text-white/50 group-hover:text-white transition-colors pl-2">
            <ToggleIcon
              className={`w-5 h-5 transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/*  EXPANDED BODY  */}
      {isExpanded && (
        <div className="p-6 border-t border-white/10 bg-black/30 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm animate-fadeIn shadow-inner rounded-b-xl">
          {/* 1. DETAILS */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold text-white/70 uppercase tracking-[0.15em] flex items-center gap-2 mb-3 drop-shadow-sm">
              <FaInfoCircle className="text-cyan-400" /> Overview
            </h4>
            <div className="text-white/90 leading-relaxed bg-black/20 p-4 rounded-xl border border-white/10 shadow-inner min-h-20">
              {task.description} {/* Task description */}
            </div>

            {/* Assigned info */}
            <div className="grid grid-cols-1 gap-2 pt-1">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center">
                <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">
                  Assigned By
                </span>
                <span className="text-white font-semibold text-xs">
                  {handlers.getUserNameById(task.assignedBy)}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
                <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold block">
                  Assigned To
                </span>
                <div className="flex flex-wrap gap-2">
                  {task.assignedTo.map((uid) => (
                    <span
                      key={uid}
                      className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded border border-white/10 text-xs text-white/80"
                    >
                      <FaUsers size={10} className="text-indigo-400" />{" "}
                      {handlers.getUserNameById(uid)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. TIME MANAGEMENT */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold text-white/70 uppercase tracking-[0.15em] flex items-center gap-2 mb-3 drop-shadow-sm">
              <FaHourglassHalf className="text-fuchsia-400" /> Time Management
            </h4>

            <div className="p-4 rounded-xl bg-black/20 border border-white/10 shadow-inner space-y-4">
              {/* Current timer */}
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="text-xs text-white/60 font-bold">
                  Current Timer
                </span>
                <span
                  className={`text-lg font-black font-mono drop-shadow-md ${
                    isTimeExpired ? "text-amber-400" : "text-white"
                  }`}
                >
                  {currentTimeDisplay}
                </span>
              </div>

              {/* Manual time adjustment */}
              {!isLocked && (
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold text-white/40 tracking-widest block">
                    Adjust Remaining Time
                  </label>
                  <DurationInput
                    days={d}
                    setDays={setD}
                    hours={h}
                    setHours={setH}
                    minutes={m}
                    setMinutes={setM}
                    error={false}
                  />
                  <button
                    onClick={handleManualTimeUpdate}
                    disabled={isTimerRunning}
                    className="w-full py-2 mt-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-cyan-300 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                  >
                    <FaSyncAlt /> Update Time
                  </button>
                </div>
              )}

              {isTimerRunning && (
                <p className="text-[10px] text-cyan-400 text-center animate-pulse font-bold tracking-wide">
                  Stop timer to adjust manually.
                </p>
              )}
            </div>

            {/* Request baseline */}
            {showRequestButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlers.handleRequestBaseline(task.id, remainingMinutes);
                }}
                className="w-full py-3 rounded-xl border border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/10 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <FaSave /> Request New Baseline
              </button>
            )}

            {/* Manager approval section */}
            {hasPendingRequest && isManager && (
              <div className="p-4 bg-fuchsia-900/20 border border-fuchsia-500/30 rounded-xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-fuchsia-300 font-extrabold uppercase">
                    New Request
                  </span>
                  <span className="text-sm text-white font-mono font-bold">
                    {task.userSuggestedBaseline}m
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handlers.approveBaselineRequest(
                        task.id,
                        task.userSuggestedBaseline
                      )
                    }
                    className="flex-1 py-1.5 text-xs font-bold uppercase bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 border border-emerald-500/30 transition-all"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handlers.rejectBaselineRequest(task.id)}
                    className="flex-1 py-1.5 text-xs font-bold uppercase bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 border border-red-500/30 transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. CONTROLS */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold text-white/70 uppercase tracking-[0.15em] flex items-center gap-2 mb-3 drop-shadow-sm">
              <FaTools className="text-lime-400" /> Controls
            </h4>

            {!isLocked ? (
              <div className="space-y-3">
                {/* Timer controls */}
                {isTimerRunning ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlers.stopTimer(task.id);
                    }}
                    className="w-full py-3.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 font-bold tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg"
                  >
                    <FaStop /> STOP TIMER
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlers.startTimer(task.id);
                    }}
                    disabled={isTimeExpired || currentStatus === "onhold"}
                    className="w-full py-3.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 font-bold tracking-wide flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
                  >
                    <FaPlay /> START TIMER
                  </button>
                )}

                {/* Complete/Mark task */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const handler =
                      handlers.onStatusChange || handlers.updateTaskStatus;
                    const next = isCompleted ? "inprocess" : "completed";
                    handler(task.id, next, task.name);
                  }}
                  className={`w-full py-3.5 rounded-xl border font-bold tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isCompleted
                      ? "bg-slate-700/40 border-slate-600/40 text-slate-300 hover:bg-slate-700/60"
                      : "bg-emerald-600/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30"
                  }`}
                >
                  <FaCheckCircle /> {isCompleted ? "REVERT TASK" : "MARK DONE"}
                </button>

                {/* Manager hold/close buttons */}
                {isManager && (
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <button
                      onClick={() =>
                        handlers.updateTaskStatus(
                          task.id,
                          currentStatus === "onhold" ? "inprocess" : "onhold"
                        )
                      }
                      className="w-full py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 text-xs font-bold uppercase flex items-center justify-center gap-2"
                    >
                      {currentStatus === "onhold" ? (
                        <>
                          <FaPlayCircle /> Resume
                        </>
                      ) : (
                        <>
                          <FaPauseCircle /> Hold
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlers.updateTaskStatus(task.id, "closed");
                      }}
                      disabled={isClosed}
                      className="w-full py-2 rounded-lg bg-slate-500/10 border border-slate-500/20 text-slate-400 hover:bg-slate-500/20 text-xs font-bold uppercase flex items-center justify-center gap-2"
                    >
                      <FaTimesCircle /> Close Task
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-4 bg-white/5 rounded-xl border border-white/10 text-center text-white/40 text-xs italic">
                Task is closed. No further actions.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
