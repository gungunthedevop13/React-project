// CalendarView.jsx
import React from "react";
import "../components/CalendarView.css";

const getDateKey = (dateStr) => {
  const d = new Date(dateStr);
  return d.toISOString().split("T")[0];
};

const CalendarView = ({ tasks }) => {
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + i);
    return date;
  });

  const grouped = tasks.reduce((acc, task) => {
    const key = getDateKey(task.dueDate || today);
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});

  return (
    <div className="calendar-view">
      {days.map((date) => {
        const key = getDateKey(date);
        const dayTasks = grouped[key] || [];
        return (
          <div key={key} className="calendar-day">
            <div className="date-label">{key}</div>
            <div className="task-container">
              {dayTasks.map((task) => (
                <div key={task.id} className="calendar-task">
                  <strong>{task.title}</strong>
                  <small>{task.estimatedMinutes} min</small>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CalendarView;
