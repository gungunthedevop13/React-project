// DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext } from "react-beautiful-dnd";

import ListView from "./components/ListView";


import "./Dashboard.css";

const defaultTask = {
  title: "",
  estimatedMinutes: "",
  dueDate: "",
  priority: "Medium",
  note: "",
  tags: [],
  recurrence: "None",
  subtasks: [],
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list");

  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem("tasks");
    const parsed = stored ? JSON.parse(stored) : [];
    return parsed.map((task) => ({
      ...task,
      subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
    }));
  });

  const [newTask, setNewTask] = useState(defaultTask);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterTags, setFilterTags] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("created");
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    const sessions = Math.ceil(newTask.estimatedMinutes / 25);
    const taskWithExtras = {
      ...newTask,
      id: Date.now().toString(),
      status: "To Do", // ✅ required for BoardView
      sessions,
      completed: false,
      createdAt: Date.now(),
      subtasks: [],
    };
    setTasks((prev) => [...prev, taskWithExtras]);
    setNewTask(defaultTask);
    setShowTagsDropdown(false);
    setShowForm(false);
  };

  const toggleComplete = (id) => {
    setTasks((prev) => {
      const updatedTasks = prev.map((task) => {
        if (task.id !== id) return task;

        const now = new Date();
        let nextDue = null;

        if (task.recurrence === "Daily") {
          nextDue = new Date(now.setDate(now.getDate() + 1));
        } else if (task.recurrence === "Weekly") {
          nextDue = new Date(now.setDate(now.getDate() + 7));
        } else if (task.recurrence === "Monthly") {
          nextDue = new Date(now.setMonth(now.getMonth() + 1));
        }

        const toggled = {
          ...task,
          completed: !task.completed,
          completedAt: !task.completed ? Date.now() : null,
          dueDate: nextDue ? nextDue.toISOString().split("T")[0] : task.dueDate,
          status: !task.completed ? "Done" : task.status, // ✅ optional: update status on completion
        };

        if (!task.completed && toggled.completed) {
          const history = JSON.parse(localStorage.getItem("history")) || [];

          const alreadyLogged = history.some(
            (h) =>
              h.id === task.id &&
              new Date(h.completedAtISO).toDateString() === new Date().toDateString()
          );

          if (!alreadyLogged) {
            const updatedHistory = [
              ...history,
              {
                ...toggled,
                completedAtFormatted: new Date().toLocaleString(),
                completedAtISO: new Date().toISOString(),
              },
            ];
            localStorage.setItem("history", JSON.stringify(updatedHistory));
          }
        }

        return toggled;
      });

      return updatedTasks;
    });
  };

  const startPomodoro = (task) => {
    localStorage.setItem("activeTask", JSON.stringify(task));
    navigate("/focus");
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const editInline = (id, field, value) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, [field]: value } : task))
    );
  };

  const addSubtask = (id) => {
    const subtask = prompt("Enter subtask");
    if (!subtask) return;
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              subtasks: Array.isArray(task.subtasks)
                ? [...task.subtasks, { title: subtask, done: false }]
                : [{ title: subtask, done: false }],
            }
          : task
      )
    );
  };

  const toggleSubtask = (taskId, index) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id !== taskId) return task;
        const updatedSubtasks = task.subtasks.map((sub, i) =>
          i === index ? { ...sub, done: !sub.done } : sub
        );
        return { ...task, subtasks: updatedSubtasks };
      })
    );
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(tasks);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setTasks(items);
  };

  const isOverdue = (task) =>
    task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  const isDueToday = (task) => {
    const today = new Date().toISOString().split("T")[0];
    return task.dueDate === today && !task.completed;
  };

  const filteredTasks = tasks
    .filter((task) => !task.completed)
    .filter((task) => task.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((task) =>
      filterPriority === "All" ? true : task.priority === filterPriority
    )
    .filter((task) =>
      filterTags.length === 0
        ? true
        : filterTags.every((tag) => task.tags.includes(tag))
    )
    .filter((task) => {
      if (filterStatus === "All") return true;
      if (filterStatus === "Overdue") return isOverdue(task);
      if (filterStatus === "Today") return isDueToday(task);
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        const priorityOrder = { High: 1, Medium: 2, Low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === "dueDate") {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else {
        return b.createdAt - a.createdAt;
      }
    });

  return (
    <div className="dashboard">

      

      {/* ✅ Filters */}
      <div className="controls">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option>All</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Overdue">Overdue</option>
          <option value="Today">Due Today</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="created">Newest First</option>
          <option value="priority">By Priority</option>
          <option value="dueDate">By Due Date</option>
        </select>

        {/* Tag filter */}
        <div className="custom-dropdown filter">
          <div
            className="dropdown-header"
            onClick={() => setShowTagsDropdown(!showTagsDropdown)}
          >
            {filterTags.length > 0 ? filterTags.join(", ") : "Filter Tags"}
            <span className="arrow">{showTagsDropdown ? "▲" : "▼"}</span>
          </div>
          {showTagsDropdown && (
            <div className="dropdown-options">
              {["Work", "Personal", "Urgent", "Low Priority", "Learning"].map((tag) => (
                <label key={tag} className="dropdown-option">
                  <input
                    type="checkbox"
                    value={tag}
                    checked={filterTags.includes(tag)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFilterTags((prev) =>
                        checked ? [...prev, tag] : prev.filter((t) => t !== tag)
                      );
                    }}
                  />
                  {tag}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Form */}
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="add-task-button">
          ➕ Add Task
        </button>
      )}

      {showForm && (
        <div className="task-form animate-expand">
          <input
            type="text"
            name="title"
            placeholder="Task Name"
            value={newTask.title}
            onChange={handleChange}
          />
          <input
            type="number"
            name="estimatedMinutes"
            placeholder="Time (minutes)"
            value={newTask.estimatedMinutes}
            onChange={handleChange}
          />
          <input
            type="date"
            name="dueDate"
            value={newTask.dueDate}
            onChange={handleChange}
          />
          <select
            name="priority"
            value={newTask.priority}
            onChange={handleChange}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          {/* Tags */}
          <div className="custom-dropdown">
            <div
              className="dropdown-header"
              onClick={() => setShowTagsDropdown(!showTagsDropdown)}
            >
              {newTask.tags.length > 0 ? newTask.tags.join(", ") : "Select Tags"}
              <span className="arrow">{showTagsDropdown ? "▲" : "▼"}</span>
            </div>
            {showTagsDropdown && (
              <div className="dropdown-options">
                {["Work", "Personal", "Urgent", "Low Priority", "Learning"].map((tag) => (
                  <label key={tag} className="dropdown-option">
                    <input
                      type="checkbox"
                      value={tag}
                      checked={newTask.tags.includes(tag)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setNewTask((prev) => ({
                          ...prev,
                          tags: checked
                            ? [...prev.tags, tag]
                            : prev.tags.filter((t) => t !== tag),
                        }));
                      }}
                    />
                    {tag}
                  </label>
                ))}
              </div>
            )}
          </div>

          <select
            name="recurrence"
            value={newTask.recurrence}
            onChange={handleChange}
          >
            <option value="None">No Repeat</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>

          <textarea
            name="note"
            placeholder="Additional notes..."
            value={newTask.note}
            onChange={handleChange}
          />

          <div className="task-form-actions">
            <button onClick={addTask}>Add Task</button>
            <button onClick={() => setShowForm(false)} className="cancel-button">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ✅ Conditional View Render */}
      {view === "list" && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <ListView
            tasks={filteredTasks}
            setTasks={setTasks}
            toggleComplete={toggleComplete}
            startPomodoro={startPomodoro}
            deleteTask={deleteTask}
            editInline={editInline}
            addSubtask={addSubtask}
            toggleSubtask={toggleSubtask}
            handleDragEnd={handleDragEnd}
          />
        </DragDropContext>
      )}

      {view === "board" && <BoardViewWrapper tasks={filteredTasks} setTasks={setTasks} />}

      {view === "calendar" && <CalendarViewWrapper tasks={filteredTasks} setTasks={setTasks} />}
    </div>
  );
};

export default DashboardPage;
