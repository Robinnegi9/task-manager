# 📋 Personal Task Manager

A full-stack task management application built as a take-home assessment for **Studio Graphene**. Users can create, view, update, and delete personal tasks — with filtering, overdue highlighting, and persistent storage via a local JSON file.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Data Store | Local `tasks.json` file via Node's `fs` module |
| HTTP | Native `fetch` API |

---

## ✅ Features

- **Add tasks** with a title (required), description (optional), and due date (optional)
- **View all tasks** sorted by creation date — newest first
- **Toggle status** between Active and Completed with a single click
- **Edit tasks** inline — update title, description, or due date
- **Delete tasks** with a confirmation prompt before removal
- **Filter** the list by All, Active, or Completed
- **Active vs Completed counter** displayed in the header
- **Overdue highlight** — tasks past their due date are visually flagged in red
- **Empty state UI** — friendly messages when no tasks exist
- **Error handling** — clean banner shown if the backend is unreachable

---

## 📁 Project Structure

```
task-manager/
├── task-manager-backend/
│   ├── server.js          # Express API — all routes & file I/O logic
│   ├── tasks.json         # Local JSON data store
│   └── package.json
│
└── task-manager-frontend/
    ├── src/
    │   ├── App.jsx        # All React components & logic
    │   └── index.css      # Tailwind directives
    ├── index.html
    └── package.json
```

---

## ⚙️ How to Run Locally

You need **Node.js v18+** installed. Clone the repo, then follow the steps below.

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/task-manager.git
cd task-manager
```

### 2. Start the Backend

```bash
cd task-manager-backend
npm install
npm run dev
```

The backend will start at: `http://localhost:5000`

> The `tasks.json` file is created automatically on first run if it doesn't exist.

### 3. Start the Frontend

Open a **new terminal** (keep the backend running), then:

```bash
cd task-manager-frontend
npm install
npm run dev
```

The frontend will start at: `http://localhost:5173`

### 4. Open in Browser

```
http://localhost:5173
```

Both terminals must be running simultaneously for the app to work.

---

## 🔌 API Endpoints

Base URL: `http://localhost:5000`

| Method | Endpoint | Description | Success | Error |
|---|---|---|---|---|
| GET | `/tasks` | Fetch all tasks (newest first) | 200 | 500 |
| POST | `/tasks` | Create a new task (`title` required) | 201 | 400 |
| PUT | `/tasks/:id` | Update title, description, dueDate, or status | 200 | 404 |
| DELETE | `/tasks/:id` | Delete a task by ID | 200 | 404 |

### Example Request — Create a Task

```json
POST /tasks
Content-Type: application/json

{
  "title": "Finish assessment",
  "description": "Submit before the deadline",
  "dueDate": "2026-06-10"
}
```

### Example Response

```json
{
  "id": "a1b2c3d4-...",
  "title": "Finish assessment",
  "description": "Submit before the deadline",
  "dueDate": "2026-06-10",
  "status": "pending",
  "createdAt": "2026-06-06T10:00:00.000Z"
}
```

---

## 🔮 Honesty & Future Improvements

### What works perfectly
- Full CRUD (Create, Read, Update, Delete) — end-to-end
- Status filtering (All / Active / Completed)
- Local data persistence via `tasks.json` — survives server restarts
- Overdue task detection and visual highlighting
- Clean error handling — the UI gracefully informs the user if the backend is unreachable

### What I would add with more time
- **Drag-and-drop reordering** — let users manually prioritise their task list (using a library like `@dnd-kit/core`)
- **Real database** — replace `tasks.json` with MongoDB or PostgreSQL for scalability and concurrent-user safety
- **User authentication** — add JWT-based login so multiple users can each have their own private task lists
- **Search by title** — a live search input to quickly filter tasks by keyword
- **Unit & integration tests** — Jest on the backend, React Testing Library on the frontend

---

## 👨‍💻 Author

Built by **[Your Name]** as part of the Studio Graphene Junior Full Stack Developer assessment.
