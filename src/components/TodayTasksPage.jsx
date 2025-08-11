import React from "react";
import dayjs from "dayjs";

const TodayTasksPage = ({ tasks }) => {
  const today = dayjs().format("YYYY-MM-DD");

  const todayTasks = tasks.filter(
    (task) =>
      !task.completed &&
      dayjs(task.dueDate).format("YYYY-MM-DD") === today
  );

  const containerStyle = {
    maxWidth: 600,
    margin: "30px auto",
    padding: 20,
    backgroundColor: "#1a1a1eff",
    borderRadius: 12,
    color: "#eee",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  };

  const headingStyle = {
    fontSize: "2rem",
    marginBottom: 20,
    borderBottom: "2px solid #323036ff",
    paddingBottom: 10,
  };

  const listStyle = {
    listStyleType: "none",
    padding: 0,
    margin: 0,
  };

  const listItemStyle = {
    backgroundColor: "#28282aff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
  };

  const taskTitleStyle = {
    fontSize: "1.2rem",
    marginBottom: 8,
    color: "#bbb9beff",
  };

  const dueDateStyle = {
    fontSize: "0.9rem",
    color: "#aaa",
  };

  const noTasksStyle = {
    textAlign: "center",
    fontStyle: "italic",
    color: "#888",
    marginTop: 50,
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Today's Tasks</h2>
      {todayTasks.length === 0 ? (
        <p style={noTasksStyle}>No tasks for today.</p>
      ) : (
        <ul style={listStyle}>
          {todayTasks.map((task, index) => (
            <li key={index} style={listItemStyle}>
              <strong style={taskTitleStyle}>{task.title}</strong>
              <p style={dueDateStyle}>Due: {dayjs(task.dueDate).format("MMM D, YYYY")}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TodayTasksPage;
