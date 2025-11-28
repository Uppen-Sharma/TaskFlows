import React from "react";
import TaskForm from "../../tasks/components/TaskForm";
import { FaTimesCircle, FaPlus } from "react-icons/fa";
import { useSelector } from "react-redux";

const UserCreateTaskModal = ({ users, onCreateTask, onClose }) => {
  const { currentUser } = useSelector((state) => state.auth); // get logged-in user
  const manager = users.find((u) => u.role === "manager"); // find manager
  const managerId = manager ? manager.id : null; // manager ID or null

  // Handle creating task and close modal
  const handleCreateTask = (taskData) => {
    if (!managerId) {
      console.error("Cannot create task: No manager found."); // fail-safe
      return;
    }
    onCreateTask(taskData, managerId); // call parent handler
    onClose(); // close modal
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex justify-center items-center z-50 p-4 animate-fadeIn">
      {/* Modal container */}
      <div className="bg-[#0F0F12] p-8 rounded-3xl shadow-2xl w-full max-w-5xl min-h-[600px] border border-white/20 relative overflow-hidden flex flex-col">
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none z-0"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/10 z-50 cursor-pointer"
          title="Close"
        >
          <FaTimesCircle size={28} />
        </button>

        {/* Modal header */}
        <h2 className="text-3xl font-black text-white mb-8 border-b border-white/10 pb-6 flex items-center gap-4 tracking-tight relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-fuchsia-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-fuchsia-500/20">
            <FaPlus size={24} />
          </div>
          Propose New Task
        </h2>

        {/* Task form container */}
        <div className="grow relative z-10 flex flex-col">
          <TaskForm
            onCreateTask={handleCreateTask} // submit handler
            users={users} // pass all users
            managerId={managerId} // manager ID for task
            defaultAssignedUserIds={[currentUser.id]} // default assignee is self
            isUserView={true} // hide admin-only features
          />

          {/* Info text */}
          <div className="mt-auto pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">
              This proposal will be sent to the manager for approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCreateTaskModal;
