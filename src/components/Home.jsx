import React, { useEffect, useState, useRef } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import Tilt from "react-parallax-tilt";
import { useDarkMode } from "../context/DarkModeContext";

const uid = () => Math.random().toString(36).slice(2, 9);

export default function Home() {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();

  // tasks (persisted)
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tasks")) || [];
    } catch {
      return [];
    }
  });

  // quick-capture input
  const [quickText, setQuickText] = useState("");
  const quickRef = useRef(null);

  // small UI
  const [celebrate, setCelebrate] = useState(false);

  // greeting (no name)
  const [greeting, setGreeting] = useState("");

  // load greeting
  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12) setGreeting("Morning");
    else if (hr < 18) setGreeting("Afternoon");
    else setGreeting("Evening");
  }, []);

  // persist tasks
  useEffect(() => {
    try {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  // Add quick task to Inbox
  const addQuickTask = (text) => {
    const title = (text || "").trim();
    if (!title) return;
    const t = {
      id: uid(),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
      inbox: true,
    };
    setTasks((p) => [t, ...p]);
    setQuickText("");
    quickRef.current?.focus();
  };

  // Toggle complete
  const toggleComplete = (id) => {
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  // Remove task
  const removeTask = (id) => setTasks((p) => p.filter((t) => t.id !== id));

  // Derived stats
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
  };

  // celebrate when completed increases
  useEffect(() => {
    if (stats.completed > 0) {
      setCelebrate(true);
      const tm = setTimeout(() => setCelebrate(false), 700);
      return () => clearTimeout(tm);
    }
    // eslint-disable-next-line
  }, [stats.completed]);

  // Today's focus (priority list)
  const getFocusTasks = () => {
    const focusTagged = tasks.filter((t) => t.focus && !t.completed);
    if (focusTagged.length) return focusTagged.slice(0, 3);
    // due today
    const today = new Date().toISOString().slice(0, 10);
    const dueToday = tasks.filter((t) => t.dueDate && t.dueDate.slice(0, 10) === today && !t.completed);
    if (dueToday.length) return dueToday.slice(0, 3);
    return tasks.filter((t) => !t.completed).slice(0, 3);
  };
  const focusTasks = getFocusTasks();

  // Up next: soonest due or earliest pending
  const getUpNext = () => {
    const withDue = tasks.filter((t) => t.dueDate && !t.completed).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    if (withDue.length) return withDue[0];
    const pending = tasks.filter((t) => !t.completed);
    return pending.length ? pending[0] : null;
  };
  const upNext = getUpNext();

  // recent projects (unique)
  const recentProjects = (() => {
    const setp = new Set();
    tasks.forEach((t) => setp.add(t.project || "Inbox"));
    return Array.from(setp).slice(0, 8);
  })();

  // helper progress percent
  const progressPercent = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  // small helpers
  const formatDue = (iso) => (iso ? new Date(iso).toLocaleString() : "No due date");

  return (
    <div className={`container layout-grid ${darkMode ? "dark" : ""}`}>
      {/* LEFT: original dark sidebar (kept as you wanted) */}
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

        <button className="logout" onClick={() => { localStorage.removeItem("authToken"); navigate("/login"); }}>
          Logout
        </button>
      </aside>

      {/* MAIN (70% look like your mockup) */}
      <main className="main-area">
        <section className="hero">
          <div className="greeting">
            <h1>Good <span id="timeofday">{greeting}</span>!</h1>
            <div className="subtitle">You have <strong id="priorityCount">{stats.pending}</strong> priorities today. Ready to focus?</div>
          </div>

          <div style={{ width: 220, textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Productivity score</div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{stats.total ? `${progressPercent}%` : "—"}</div>
          </div>
        </section>

        <section className="grid" aria-label="Key action cards">
          {/* Quick Capture */}
          <div className="card quick-capture">
            <h3>Quick Capture</h3>
            <input
              ref={quickRef}
              placeholder="What's on your mind?"
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addQuickTask(quickText); }}
            />
            <div className="hint">Press Enter to add to Inbox • Try "Study chapter 3"</div>
          </div>

          {/* Today's Focus */}
          <div className="card">
            <h3>Today's Focus</h3>
            <div className="focus-list">
              {focusTasks.length === 0 && <div className="mini">No focus tasks — add some.</div>}
              {focusTasks.map((t) => (
                <div key={t.id} className={`task ${t.completed ? "completed" : ""}`} data-id={t.id}>
                  <input type="checkbox" checked={t.completed} onChange={() => toggleComplete(t.id)} />
                  <div className="title">{t.title}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => toggleComplete(t.id)}>{t.completed ? "Undo" : "Done"}</button>
                    <button onClick={() => removeTask(t.id)} style={{ color: "#c33", border: "none", background: "transparent", cursor: "pointer" }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="progress" aria-hidden="true"><i id="progressBar" style={{ width: `${progressPercent}%` }} /></div>
          </div>

          {/* Up Next */}
          <div className="card">
            <h3>Up Next</h3>
            <div className="stats">
              <div className="donut" id="donut">{stats.total ? `${progressPercent}%` : "—"}</div>
              <div>
                <div style={{ fontWeight: 600 }}>{upNext ? upNext.title : "No upcoming task"}</div>
                <div className="mini">{upNext ? formatDue(upNext.dueDate) : "No due date"}</div>
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => navigate("/calendar")}>Open Calendar</button>
                  {upNext && <button onClick={() => toggleComplete(upNext.id)} style={{ marginLeft: 8 }}>{upNext.completed ? "Undo" : "Complete"}</button>}
                </div>
              </div>
            </div>
          </div>

          {/* AI Teaser */}
          <div className="card ai-teaser">
            <div className="left">
              <div className="ai-avatar">AI</div>
              <div>
                <div style={{ fontWeight: 600 }}>Need help planning?</div>
                <div className="mini">Try: "Organize my tasks by energy level"</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
              <button onClick={() => navigate("/ai-assistant")}>Open</button>
              <div className="mini">AI Assistant</div>
            </div>
          </div>
        </section>

        <section className="recent">
          <h3 style={{ margin: "8px 0 12px 0" }}>Recent Projects</h3>
          <div className="projects-row fade-right" id="projectsRow">
            {recentProjects.length === 0 ? (
              <div className="project"><div style={{ fontWeight: 700 }}>Inbox</div><div className="mini">No projects yet</div></div>
            ) : recentProjects.map((p) => (
              <div key={p} className="project"><div style={{ fontWeight: 700 }}>{p}</div><div className="mini">Next action</div></div>
            ))}
          </div>
        </section>

        <div className="status">Small steps, big progress.</div>
      </main>
    </div>
  );
}
