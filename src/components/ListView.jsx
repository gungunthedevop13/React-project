// ListView.jsx
import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { motion, AnimatePresence } from "framer-motion";

const formatDueDate = (dateStr) => {
  if (!dateStr) return "No due date";
  const today = new Date();
  const due = new Date(dateStr);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 0) return `Overdue`;
  return due.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const ListView = ({
  tasks,
  setTasks,
  toggleComplete,
  startPomodoro,
  deleteTask,
  editInline,
  addSubtask,
  toggleSubtask,
  handleDragEnd,
}) => {
  return (
    <div className="task-list">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="taskList">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
              <AnimatePresence>
                {tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <motion.li
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        layout
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`task-item ${task.completed ? "completed" : ""}`}
                      >
                        <div className="task-left">
                          <div className="task-header">
                            <label className="task-title">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleComplete(task.id)}
                              />
                              <span className={task.completed ? "done" : ""}>{task.title}</span>
                            </label>
                            <span className="session-count">🔥 {task.sessions || 0} Session{task.sessions > 1 ? "s" : ""}</span>
                          </div>

                          <div className="task-meta">
                            <span className="due-date">📅 {formatDueDate(task.dueDate)}</span>
                            <span className="priority">| 🏷️ {task.priority} Priority</span>
                          </div>

                          {task.tags && task.tags.length > 0 && (
                            <div className="task-tags">
                              {task.tags.map((tag, i) => (
                                <span key={i} className="tag-badge">{tag}</span>
                              ))}
                            </div>
                          )}

                          {task.note && <div className="task-note">📝 {task.note}</div>}

                          {Array.isArray(task.subtasks) && task.subtasks.length > 0 && (
                            <ul className="subtask-list">
                              {task.subtasks.map((sub, i) => (
                                <li key={i} className="subtask-item">
                                  <label>
                                    <input
                                      type="checkbox"
                                      checked={sub.done}
                                      onChange={() => toggleSubtask(task.id, i)}
                                    />
                                    <span className={sub.done ? "done" : ""}>{sub.title}</span>
                                  </label>
                                </li>
                              ))}
                            </ul>
                          )}

                          <button onClick={() => addSubtask(task.id)}>+ Add Subtask</button>
                        </div>

                        <div className="task-actions">
                          <button onClick={() => startPomodoro(task)}>Start</button>
                          <button onClick={() => deleteTask(task.id)} className="delete-btn">
                            Delete
                          </button>
                        </div>
                      </motion.li>
                    )}
                  </Draggable>
                ))}
              </AnimatePresence>
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ListView;
