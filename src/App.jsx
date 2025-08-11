import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

// Public Pages
import WelcomePage from "./components/WelcomePage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import Home from "./components/Home";
import NotesPage from "./components/NotesPage";
import ProfilePage from "./components/ProfilePage";
import TimetablePage from "./pages/TimetablePage";
import ProgressPage from "./pages/ProgressPage";
import AIStudyAssistantPage from "./pages/AIStudyAssistantPage";
import Calendar from "./pages/Calendar"; // Adjust if the path differs

// Layouts
import SidebarLayout from "./SidebarLayout"; // For /dashboard/*

// Dashboard Pages
import Dashboard from "./Dashboard";
import TodayTasksPage from "./components/TodayTasksPage";
import CompletedTasksPage from "./components/CompletedTasksPage";
import CalendarView from "./components/CalendarView";
import BoardView from "./components/BoardView";
import PomodoroTimer from "./components/PomodoroTimer";
import StopwatchPage from "./components/StopwatchPage";


const App = () => {
  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem("tasks");
    return stored ? JSON.parse(stored) : [];
  });

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/notes" element={<NotesPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/timetable" element={<TimetablePage />} />
      <Route path="progress" element={<ProgressPage tasks={tasks} />} />
      <Route path="/ai-assistant" element={<AIStudyAssistantPage />} />
      <Route path="/calendar" element={<Calendar />} />

      {/* Dashboard Layout Routes */}
      <Route path="/dashboard" element={<SidebarLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="today" element={<TodayTasksPage tasks={tasks} />} />
        <Route path="completed" element={<CompletedTasksPage tasks={tasks} />} />
        <Route path="calendar-view" element={<CalendarView tasks={tasks} />} />
        <Route path="board" element={<BoardView tasks={tasks} setTasks={setTasks} />} />
        <Route path="focus" element={<PomodoroTimer />} />
        <Route path="stopwatch" element={<StopwatchPage />} />
      </Route>


    </Routes>
  );
};

export default App;
