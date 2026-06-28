# Synaptica

🔗 **Live Demo → [synaptica.vercel.app](https://synaptica.vercel.app/)**

A sleek, all-in-one study planner built with React + Vite. Manage tasks, track time, stay focused, and get AI-powered study help — all in one place, with no backend required.

---

## Features

### Task Management
- Create tasks with title, priority, due date, estimated time, tags, notes, and recurrence
- Add subtasks to any task
- Filter by priority, tags, and status; sort by created date, due date, or priority
- Quick-search across all tasks
- View completed tasks separately

### Multiple Views
- **List View** — default task list with full detail
- **Board View** — Kanban-style drag-and-drop columns (powered by `react-beautiful-dnd`)
- **Calendar View** — monthly calendar using FullCalendar with task overlays

### Focus Tools
- **Pomodoro Timer** — session-based focus timer with audio notification and session locking
- **Stopwatch** — simple precision timer for open-ended sessions

### Notes
- Rich-text note editor powered by Quill
- Notes persisted to localStorage

### Timetable
- Visual weekly timetable for scheduling recurring study blocks

### Progress Tracking
- Visual charts (Recharts) showing completed vs pending tasks and study patterns

### AI Study Assistant
- Powered by OpenRouter (GPT-3.5-turbo)
- Three built-in modes:
  - **Summarizer** — condenses study notes into 5 bullet points
  - **Flashcard Generator** — turns notes into term:definition pairs
  - **Quiz Generator** — creates 5-question quizzes from any material
- Chat history saved per session in localStorage; supports new/delete chat management
- Voice input via Web Speech API

### Auth & Profile
- Signup / Login flow (localStorage-based, no backend)
- Profile page with user settings

### Dark Mode
- Full dark/light toggle via `DarkModeContext`, persisted across sessions

### Offline Ready
- Entirely localStorage-driven — works with no internet (except AI assistant)

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | React 19 + Vite 7 |
| Routing | React Router DOM 7 |
| Styling | Tailwind CSS 4, custom CSS modules |
| Animation | Framer Motion, Lottie React |
| Drag & Drop | react-beautiful-dnd |
| Calendar | FullCalendar (daygrid + interaction) |
| Charts | Recharts |
| Rich Text | Quill / react-quill |
| Dates | date-fns, Day.js |
| AI API | OpenRouter (GPT-3.5-turbo via `fetch`) |
| HTTP | Axios |
| Tilt effects | react-parallax-tilt |
| Confetti | react-confetti |

---

## Getting Started

### Prerequisites
- Node.js 18+
- An [OpenRouter](https://openrouter.ai/) API key (free tier available)

### Installation

```bash
git clone https://github.com/your-username/synaptica.git
cd synaptica
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

> ⚠️ Never commit your `.env` file. Make sure `.env` is listed in `.gitignore`.

### Run Locally

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── components/          # Page-level components (Dashboard, Notes, Profile, etc.)
│   ├── Home.jsx         # Quick-capture landing page
│   ├── Dashboard.jsx    # Main task hub
│   ├── BoardView.jsx    # Kanban board
│   ├── CalendarView.jsx # Calendar task view
│   ├── PomodoroTimer.jsx
│   ├── StopwatchPage.jsx
│   ├── NotesPage.jsx
│   ├── ProfilePage.jsx
│   ├── LoginPage.jsx
│   └── SignupPage.jsx
├── pages/               # Full-page routes
│   ├── AIStudyassistantPage.jsx
│   ├── ProgressPage.jsx
│   ├── TimetablePage.jsx
│   └── Calendar.jsx
├── views/               # View wrappers
│   ├── BoardViewWrapper.jsx
│   └── CalendarViewWrapper.jsx
├── context/
│   └── DarkModeContext.jsx
├── api.js               # OpenRouter API call handler
├── SidebarLayout.jsx    # Shared sidebar shell for /dashboard/* routes
├── App.jsx              # Route definitions
└── main.jsx
```

---

## Routes

| Path | Page |
|---|---|
| `/` | Welcome / splash |
| `/login` | Login |
| `/signup` | Signup |
| `/home` | Quick task capture |
| `/notes` | Rich-text notes |
| `/profile` | User profile |
| `/timetable` | Weekly timetable |
| `/progress` | Charts & progress |
| `/ai-assistant` | AI Study Assistant |
| `/calendar` | Full calendar page |
| `/dashboard` | Task dashboard (list view) |
| `/dashboard/today` | Today's tasks |
| `/dashboard/completed` | Completed tasks |
| `/dashboard/calendar-view` | Dashboard calendar |
| `/dashboard/board` | Kanban board |
| `/dashboard/focus` | Pomodoro timer |
| `/dashboard/stopwatch` | Stopwatch |

---

## Data Persistence

All data is stored in `localStorage`. No backend or database is required.

| Key | Contents |
|---|---|
| `tasks` | All task objects |
| `savedChats` | AI assistant chat history |
| `darkMode` | Theme preference |

---

## AI Assistant Notes

The AI assistant uses the [OpenRouter](https://openrouter.ai/) API as a proxy to GPT-3.5-turbo. Each mode sends a structured prompt based on the user's input:

- `summarizer` → `"Summarize this: <input>"`
- `quiz` → `"Make 5 quiz questions from: <input>"`
- `flashcard` → `"Make flashcards (term: definition) from: <input>"`

The API key is read from `VITE_OPENROUTER_API_KEY` at build time via Vite's `import.meta.env`.

---

## License

MIT
