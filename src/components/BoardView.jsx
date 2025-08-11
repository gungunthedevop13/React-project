// BoardView.jsx
import React, { useState } from "react";
import "../components/BoardView.css";

const columns = ["To Do", "In Progress", "Done"];

const BoardView = ({ tasks, setTasks }) => {
  const [draggingTask, setDraggingTask] = useState(null);

  const handleDragStart = (task) => setDraggingTask(task);

  const handleDrop = (column) => {
    if (!draggingTask) return;
    setTasks((prev) =>
      prev.map((task) =>
        task.id === draggingTask.id ? { ...task, boardStatus: column } : task
      )
    );
    setDraggingTask(null);
  };

  const grouped = columns.reduce((acc, col) => {
    acc[col] = tasks.filter((t) => (t.boardStatus || "To Do") === col);
    return acc;
  }, {});

  return (
    <div className="board-view">
      {columns.map((col) => (
        <div
          key={col}
          className="board-column"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(col)}
        >
          <h3>{col}</h3>
          <div className="column-tasks">
            {grouped[col].map((task) => (
              <div
                key={task.id}
                className="board-card"
                draggable
                onDragStart={() => handleDragStart(task)}
              >
                <strong>{task.title}</strong>
                <p>{task.note}</p>
                <small>{task.estimatedMinutes} min · {task.priority}</small>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BoardView;