import React, { useState, useEffect } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import Tilt from "react-parallax-tilt";
import { useDarkMode } from "../context/DarkModeContext";

const quotes = [
  "Discipline is the bridge between goals and accomplishment.",
  "The secret of getting ahead is getting started.",
  "Don’t watch the clock; do what it does. Keep going.",
  "Well done is better than well said.",
];

const memoryTips = [
  "Review your notes right before sleep for better retention.",
  "Use mnemonics to memorize difficult concepts.",
  "Teach someone else to better retain information.",
  "Chunk information into smaller parts.",
];

const Home = () => {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const [note, setNote] = useState("");
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });

  const [greeting, setGreeting] = useState("");

  // Time tracker states
const [time, setTime] = useState(() => {
  const saved = localStorage.getItem("trackedTime");
  return saved ? parseInt(saved, 10) : 0;
});
const [running, setRunning] = useState(() => {
  const saved = localStorage.getItem("timerRunning");
  return saved === "true"; // convert string to boolean
});

  useEffect(() => {
    // Load tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const pending = total - completed;
    setTaskStats({ total, completed, pending });

    // Load note from localStorage
    const savedNote = localStorage.getItem("quickNote");
    if (savedNote) setNote(savedNote);

    // Load time tracker from localStorage
    const savedTime = parseInt(localStorage.getItem("trackedTime"), 10);
    if (!isNaN(savedTime)) setTime(savedTime);

    // Set greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning ☀️");
    else if (hour < 18) setGreeting("Good Afternoon 🌤️");
    else setGreeting("Good Evening 🌙");
  }, []);

  useEffect(() => {
    localStorage.setItem("quickNote", note);
  }, [note]);

  useEffect(() => {
    localStorage.setItem("trackedTime", time);
  }, [time]);

  useEffect(() => {
  localStorage.setItem("timerRunning", running);
}, [running]);


  useEffect(() => {
    let timer;
    if (running) {
      timer = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [running]);

  const handleNoteChange = (e) => {
    setNote(e.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };
  const [dailyFocus, setDailyFocus] = useState(() => {
  return localStorage.getItem("dailyFocus") || "";
});

const handleFocusChange = (e) => {
  setDailyFocus(e.target.value);
};

useEffect(() => {
  localStorage.setItem("dailyFocus", dailyFocus);
}, [dailyFocus]);


  // Compute daily quote and tip based on date
  const dayIndex = new Date().getDate() % quotes.length;
  const dailyQuote = quotes[dayIndex];
  const dailyTip = memoryTips[dayIndex];

  // Format time in hh:mm:ss
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className={`home-wrapper ${darkMode ? "dark" : ""}`}>
      <aside className="sidebar">
        <h2 className="logo">📘 Synaptica</h2>
        <nav className="nav-links">
          <button onClick={() => navigate("/dashboard")}>📊 Dashboard</button>
          <button onClick={() => navigate("/progress")}>📈 Progress</button>
          <button onClick={() => navigate("/notes")}>📝 Notes</button>
          <button onClick={() => navigate("/profile")}>👤 Profile</button>
          <button onClick={() => navigate("/calendar")}>📅 Calendar</button>
          <button onClick={() => navigate("/timetable")}>📘 Timetable</button>
          <button onClick={() => navigate("/ai-assistant")}>🤖 AI Assistant</button>
        </nav>
        <button className="logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="dashboard-content">
        <h1 className="greeting-heading glow-heading">{greeting}</h1>

        <div className="grid-layout">
          <Tilt>
            <div className="card">
              <h3>📊 Task Summary</h3>
              <ul>
                <li>
                  <strong>Total:</strong> {taskStats.total}
                </li>
                <li>
                  <strong>Completed:</strong> ✅ {taskStats.completed}
                </li>
                <li>
                  <strong>Pending:</strong> ⏳ {taskStats.pending}
                </li>
              </ul>
            </div>
          </Tilt>

          <Tilt>
            <div className="card note-card">
              <h3>🗒️ Quick Notes</h3>
              <textarea
                className="note-area"
                placeholder="Jot something down..."
                value={note}
                onChange={handleNoteChange}
              ></textarea>
            </div>
          </Tilt>

          <Tilt>
             <div className="card widget">
             <h3>🎯 Daily Focus</h3>
              <textarea
              className="daily-focus-textarea"
                placeholder="Enter your main goal for today..."
               value={dailyFocus}
               onChange={handleFocusChange}
               rows={3}
               />
              </div>
              </Tilt>


          <Tilt>
            <div className="card widget">
              <h3>📖 Quote</h3>
              <p>"{dailyQuote}"</p>
            </div>
          </Tilt>

          <Tilt>
            <div className="card widget">
              <h3>🧠 Memory Tip</h3>
              <p>{dailyTip}</p>
            </div>
          </Tilt>

          <Tilt>
            <div className="card widget">
              <h3>🕒 Time Tracker</h3>
              <p>{formatTime(time)}</p>
              <button onClick={() => setRunning(!running)}>
                {running ? "Pause" : "Start"}
              </button>
              <button onClick={() => { setRunning(false); setTime(0); }}>
                Reset
              </button>
            </div>
          </Tilt>
        </div>
      </main>
    </div>
  );
};

export default Home;
