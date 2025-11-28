import React from "react";
import {
  FaTimesCircle,
  FaCheckCircle,
  FaTrash,
  FaUser,
  FaClock,
  FaAlignLeft,
} from "react-icons/fa";
import { formatMinutesToTime } from "../../../utils/timeUtils";

const ProposalApprovalModal = ({
  proposals,
  users,
  onApprove,
  onReject,
  onClose,
}) => {
  const getUserName = (id) => {
    const user = users.find((u) => u.id === id);
    return user ? user.name : "Unknown User"; // map user id to name
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex justify-center items-center p-4 animate-fadeIn">
      <div className="bg-[#0F0F12] p-8 rounded-3xl shadow-2xl w-full max-w-4xl border border-white/10 relative overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 border border-fuchsia-500/30 shadow-[0_0_15px_rgba(232,121,249,0.2)]">
              <FaCheckCircle size={20} />
            </div>
            Review Proposals
            <span className="text-sm bg-fuchsia-500 text-black font-bold px-3 py-1 rounded-full ml-2 shadow-lg">
              {proposals.length} New
            </span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <FaTimesCircle size={28} />
          </button>
        </div>

        <div className="grow overflow-y-auto custom-scrollbar space-y-4 pr-2">
          {proposals.length === 0 ? (
            <div className="text-center text-white/30 py-20">
              <p>No pending proposals.</p>
            </div>
          ) : (
            proposals.map((task) => (
              <div
                key={task.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row gap-6 hover:border-white/20 transition-all shadow-lg group"
              >
                <div className="grow space-y-2">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-fuchsia-400 bg-fuchsia-500/10 px-2 py-0.5 rounded border border-fuchsia-500/20">
                      PROPOSAL
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      {task.name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-white/60">
                    <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg">
                      <FaUser className="text-indigo-400" />
                      <span className="truncate">
                        Proposed for:{" "}
                        <span className="text-white font-semibold">
                          {task.assignedTo
                            .map((id) => getUserName(id))
                            .join(", ")}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg">
                      <FaClock className="text-cyan-400" />
                      <span>
                        Est:{" "}
                        <span className="text-white font-semibold">
                          {formatMinutesToTime(task.initialEstimatedTime)}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-sm text-white/50 bg-black/20 p-3 rounded-lg border border-white/5 mt-2">
                    <FaAlignLeft className="mt-1 shrink-0" />
                    <p className="line-clamp-2">{task.description}</p>
                  </div>
                </div>

                <div className="flex md:flex-col justify-center gap-3 min-w-[140px] border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                  <button
                    onClick={() => onApprove(task)}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    <FaCheckCircle /> Accept
                  </button>
                  <button
                    onClick={() => onReject(task.id)}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-red-300 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    <FaTrash /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalApprovalModal;
