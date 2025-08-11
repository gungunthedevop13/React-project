import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";
import "./ProgressPage.css";

const COLORS = ["#4ade80", "#facc15", "#f87171"];

const BADGE_INFO = {
  "🐣 First Task": "Complete your first task",
  "🚀 Overachiever": "Complete 5 or more tasks",
  "🔥 3-Day Streak": "Complete tasks 3 days in a row",
  "🗓️ 7-Day Warrior": "Complete tasks 7 days in a row",
  "👶 Focus Rookie": "Study 60+ minutes in one day",
  "🗂️ Planner Pro": "Use all 5 predefined tags at least once",
};

const ProgressPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [history, setHistory] = useState([]);
  const [dailyCompletion, setDailyCompletion] = useState([]);
  const [studyTimeData, setStudyTimeData] = useState([]);
  const [badges, setBadges] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const completedHistory = JSON.parse(localStorage.getItem("history")) || [];

    setTasks(storedTasks);
    setHistory(completedHistory);

    const completed = storedTasks.filter((task) => task.completed).length;
    const inProgress = storedTasks.filter(
      (task) => !task.completed && new Date(task.dueDate) >= new Date()
    ).length;
    const overdue = storedTasks.filter(
      (task) => !task.completed && new Date(task.dueDate) < new Date()
    ).length;

    setProgressData([
      { name: "Completed", value: completed },
      { name: "In Progress", value: inProgress },
      { name: "Overdue", value: overdue },
    ]);

    const dateMap = {};
    const seen = new Set();
    completedHistory.forEach((task) => {
      const iso = task.completedAtISO || task.completedAtFormatted;
      if (!iso) return;
      const date = new Date(iso).toISOString().split("T")[0];
      const key = `${task.id}-${date}`;
      if (!seen.has(key)) {
        seen.add(key);
        dateMap[date] = (dateMap[date] || 0) + 1;
      }
    });
    const dateArray = Object.keys(dateMap)
      .map((date) => ({ date, completed: dateMap[date] }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    setDailyCompletion(dateArray);

    const studyMap = {};
    storedTasks.forEach((task) => {
      if (task.completedAtISO) {
        const date = new Date(task.completedAtISO).toISOString().split("T")[0];
        studyMap[date] = (studyMap[date] || 0) + (task.actualStudyMinutes || 0);
      }
    });
    const studyArray = Object.keys(studyMap)
      .map((date) => ({ date, minutes: studyMap[date] }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    setStudyTimeData(studyArray);

    const dates = Object.keys(dateMap).sort();
    let streak = 0;
    let maxStreak = 0;
    let prev = null;
    dates.forEach((dateStr) => {
      const date = new Date(dateStr);
      if (prev) {
        const diff = (date - prev) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          streak++;
        } else if (diff > 1) {
          streak = 1;
        }
      } else {
        streak = 1;
      }
      maxStreak = Math.max(maxStreak, streak);
      prev = date;
    });
    setCurrentStreak(streak);
    setLongestStreak(maxStreak);

    const unlocked = [];
    if (completed >= 1) unlocked.push("🐣 First Task");
    if (completed >= 5) unlocked.push("🚀 Overachiever");
    if (streak >= 3) unlocked.push("🔥 3-Day Streak");
    if (streak >= 7) unlocked.push("🗓️ 7-Day Warrior");
    if (Object.values(studyMap).some((min) => min >= 60)) unlocked.push("👶 Focus Rookie");
    const allTags = new Set();
    storedTasks.forEach((task) => task.tags?.forEach((t) => allTags.add(t)));
    if (["Work", "Personal", "Urgent", "Low Priority", "Learning"].every(tag => allTags.has(tag))) {
      unlocked.push("🗂️ Planner Pro");
    }

    const storedUnlocked = JSON.parse(localStorage.getItem("unlockedBadges")) || [];
    const newBadges = unlocked.filter(b => !storedUnlocked.includes(b));
    if (newBadges.length > 0) {
      newBadges.forEach(badge => showBadgePopup(badge));
    }
    localStorage.setItem("unlockedBadges", JSON.stringify(unlocked));

    setBadges(unlocked);
  }, []);

  const showBadgePopup = (badge) => {
    const popup = document.createElement("div");
    popup.className = "badge-popup";
    popup.innerText = `🏅 Badge Unlocked: ${badge}`;
    document.body.appendChild(popup);

    setTimeout(() => popup.classList.add("show"), 100);
    setTimeout(() => {
      popup.classList.remove("show");
      setTimeout(() => document.body.removeChild(popup), 300);
    }, 3000);
  };

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const progressPercent = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-6">
      <h1 className="text-3xl font-semibold mb-4">📈 Task Progress</h1>

      {/* Completion Progress Bar & Streak */}
      <div className="mb-6 p-4 bg-[#262626] rounded-2xl shadow">
        <div className="w-full bg-gray-700 rounded-xl h-4 mb-2">
          <div
            className="bg-green-500 h-4 rounded-xl transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-xs text-gray-300 flex justify-between">
          <span>{progressPercent.toFixed(1)}% tasks completed</span>
          <span>🔥 {currentStreak}-day streak (Longest: {longestStreak})</span>
        </div>
      </div>

      
       {/* Unlocked Badges Section */}
{badges.length > 0 && (
  <div className="unlocked-badges-container">
    <h2 className="unlocked-badges-title">🏆 Your Unlocked Badges</h2>
    <div className="unlocked-badges-list">
      {badges.map((badge, idx) => (
        <span key={idx} className="unlocked-badge">
          {badge}
        </span>
      ))}
    </div>
  </div>
)}


      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-80 bg-[#262626] rounded-2xl p-4 shadow">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={progressData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label
              >
                {progressData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Completed Tasks Per Day */}
        <div className="h-80 bg-[#262626] rounded-2xl p-4 shadow">
          <h2 className="text-base font-semibold mb-2">📊 Tasks Completed Per Day</h2>
          <ResponsiveContainer>
            <BarChart data={dailyCompletion}>
              <XAxis dataKey="date" stroke="#ccc" fontSize={10} />
              <YAxis stroke="#ccc" allowDecimals={false} fontSize={10} />
              <Tooltip />
              <Bar dataKey="completed" fill="#4ade80" barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart - Study Time */}
        <div className="h-80 bg-[#262626] rounded-2xl p-4 shadow md:col-span-2">
          <h2 className="text-base font-semibold mb-2">🕓 Study Time Per Day</h2>
          <ResponsiveContainer>
            <LineChart data={studyTimeData}>
              <XAxis dataKey="date" stroke="#ccc" fontSize={10} />
              <YAxis stroke="#ccc" fontSize={10} />
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="minutes" stroke="#38bdf8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Completed Task History */}
      <div className="bg-[#262626] rounded-2xl p-4 mt-10">
        <h2 className="text-base font-semibold mb-3">🗃️ Completed Task History</h2>
        {history.length === 0 ? (
          <p className="text-gray-400 text-sm">No task history yet.</p>
        ) : (
          <ul className="text-sm divide-y divide-gray-700">
            {Array.from(
              new Map(
                history.map((task) => [
                  `${task.id}-${new Date(task.completedAtISO || task.completedAtFormatted).toDateString()}`,
                  task,
                ])
              ).values()
            )
              .reverse()
              .map((task, index) => (
                <li key={index} className="flex justify-between py-2">
                  <span>{task.title}</span>
                  <span className="text-green-400">{task.completedAtFormatted}</span>
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* Back Button */}
      <div className="mt-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-xl"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ProgressPage;
