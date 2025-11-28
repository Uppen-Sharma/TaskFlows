import React from "react";
import TaskItem from "./TaskItem";
import { FaClipboardList } from "react-icons/fa";

const TaskAccordionList = ({ filteredTasks, handlers, mode = "user" }) => {
  // normalize time adjust for manager vs user
  const normalizedHandlers = {
    ...handlers,
    handleTimeAdjust: (taskId, newTotal) => {
      if (mode === "manager") {
        const task = filteredTasks.find((t) => t.id === taskId);
        const current = task ? task.currentEstimatedTime : 0; // get current time
        const delta = newTotal - current; // calculate adjustment
        handlers.handleTimeAdjust(taskId, current, delta);
      } else {
        handlers.handleTimeAdjust(taskId, newTotal); // user direct adjust
      }
    },
  };

  // show placeholder if no tasks
  if (!filteredTasks || filteredTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center border border-dashed border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm min-h-[300px]">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5 shadow-inner">
          <FaClipboardList className="text-4xl text-white/20" />
        </div>
        <p className="text-white/60 text-lg font-bold tracking-wide">
          No tasks found
        </p>
        <p className="text-white/30 text-sm mt-1 max-w-xs mx-auto leading-relaxed">
          Try adjusting your filters or search terms to find what you're looking
          for.
        </p>
      </div>
    );
  }

  // render list of tasks
  return (
    <div className="space-y-4">
      {filteredTasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          isExpanded={handlers.expandedTaskIds.includes(task.id)} // toggle expanded
          toggleExpand={handlers.handleToggleTaskDetails} // expand/collapse handler
          handlers={normalizedHandlers} // pass down normalized handlers
          mode={mode} // indicate user/manager mode
        />
      ))}
    </div>
  );
};

export default TaskAccordionList;
