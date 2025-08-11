import React, { useEffect, useState } from "react";

const CompletedTasksPage = () => {
  const [completedTasks, setCompletedTasks] = useState([]);

useEffect(() => {
  const stored = localStorage.getItem("tasks");
  const allTasks = stored ? JSON.parse(stored) : [];

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const cleaned = allTasks.filter(
    (task) => !task.completed || (task.completedAt && task.completedAt >= sevenDaysAgo)
  );

  if (cleaned.length !== allTasks.length) {
    localStorage.setItem("tasks", JSON.stringify(cleaned));
  }

  const recentCompleted = cleaned
    .filter((task) => task.completed && task.completedAt >= sevenDaysAgo)
    .sort((a, b) => b.completedAt - a.completedAt);

  setCompletedTasks(recentCompleted);
}, []);
 

  const restoreTask = (id) => {
    const stored = localStorage.getItem("tasks");
    const allTasks = stored ? JSON.parse(stored) : [];

    const updated = allTasks.map((task) =>
      task.id === id ? { ...task, completed: false, completedAt: null } : task
    );

    localStorage.setItem("tasks", JSON.stringify(updated));
    setCompletedTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const deleteTaskPermanently = (id) => {
      if (!window.confirm("Are you sure you want to permanently delete this task?")) return;

    const stored = localStorage.getItem("tasks");
    const allTasks = stored ? JSON.parse(stored) : [];

    const updated = allTasks.filter((task) => task.id !== id);
    localStorage.setItem("tasks", JSON.stringify(updated));
    setCompletedTasks((prev) => prev.filter((task) => task.id !== id));
  };

  return (
    <div className="dashboard">
      <h2>✅ Completed Tasks (Last 7 Days)</h2>
      {completedTasks.length === 0 ? (
        <p>No tasks completed in the last 7 days.</p>
      ) : (
        <ul className="task-list">
          {completedTasks.map((task) => (
            <li key={task.id} className="task-item completed">
              <div className="task-left">
                <div className="task-title">{task.title}</div>
                <div className="task-meta">
                  Completed on{" "}
                  {new Date(task.completedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                {task.note && (
                  <div style={{ fontSize: "13px", opacity: 0.7 }}>{task.note}</div>
                )}
                <div className="task-actions" style={{ flexDirection: "row", gap: "10px", marginTop: "10px" }}>
                  <button onClick={() => restoreTask(task.id)}>↩️ Restore</button>
                  <button
                    onClick={() => deleteTaskPermanently(task.id)}
                    className="delete-btn"
                  >
                     Delete Permanently
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CompletedTasksPage;
