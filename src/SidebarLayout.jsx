import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./SidebarLayout.css";

const SidebarLayout = () => {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h2 className="logo">
                        📋Dashboard </h2>
        <nav className="nav-links">
<NavLink to="/dashboard" className="nav-item">📝 List View</NavLink>
<NavLink to="/dashboard/board" className="nav-item">🧱 Board View</NavLink>
<NavLink to="/dashboard/calendar-view" className="nav-item">📅 Calendar View</NavLink>
<NavLink to="/dashboard/completed" className="nav-item">✅ Completed Tasks</NavLink>
<NavLink to="/dashboard/today" className="nav-item">📆 Today's Tasks</NavLink>
<NavLink to="/dashboard/stopwatch" className="nav-item">⏱️ Stopwatch</NavLink>
<NavLink to="/home" className="nav-item">Back</NavLink>


          
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;
