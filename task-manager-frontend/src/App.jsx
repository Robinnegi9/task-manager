// =============================================================
// App.jsx — Personal Task Manager Frontend
// Tech Stack: React (Vite) + Tailwind CSS + Fetch API
// Backend: http://localhost:5000/tasks
// =============================================================

import { useState, useEffect } from "react";

// ── API base URL — change this if your backend runs on a different port
const API_URL = "https://task-manager-3796.onrender.com/tasks";

// ================================================================
// HELPER: Check if a task is overdue
// A task is overdue when:
//   1. It has a due date set
//   2. That date is in the past (before today)
//   3. The task is NOT already completed
// ================================================================
function isOverdue(task) {
  if (!task.dueDate || task.status === "completed") return false;
  const due = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

// ================================================================
// HELPER: Format an ISO date string to a readable label
// e.g. "2026-06-30" → "Jun 30, 2026"
// ================================================================
function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ================================================================
// SUB-COMPONENT: AddTaskForm
// ================================================================
function AddTaskForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, dueDate }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add task.");
      }
      setTitle("");
      setDescription("");
      setDueDate("");
      onAdd();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
      <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
        <span className="text-2xl">✍️</span> Add New Task
      </h2>
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Task title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 transition resize-none"
        />
        <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-400 tracking-wide">
              📅 Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
            />
          </div>
          <div className="flex flex-col justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition"
            >
              {loading ? "Adding…" : "+ Add Task"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

// ================================================================
// SUB-COMPONENT: TaskCard
// ================================================================
function TaskCard({ task, onRefresh }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);
  const [editDueDate, setEditDueDate] = useState(task.dueDate || "");
  const [loading, setLoading] = useState(false);

  const overdue = isOverdue(task);
  const completed = task.status === "completed";

  async function handleToggle() {
    try {
      const newStatus = completed ? "pending" : "completed";
      await fetch(`${API_URL}/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      onRefresh();
    } catch {
      alert("Could not update task. Is the backend running?");
    }
  }
  async function handleSave() {
    if (!editTitle.trim()) return;
    setLoading(true);
    try {
      await fetch(`${API_URL}/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          dueDate: editDueDate,
        }),
      });
      setIsEditing(false);
      onRefresh();
    } catch {
      alert("Could not save changes. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );
    if (!confirmed) return;
    try {
      await fetch(`${API_URL}/${task.id}`, { method: "DELETE" });
      onRefresh();
    } catch {
      alert("Could not delete task. Is the backend running?");
    }
  }

  const cardBorder = overdue
    ? "border-l-4 border-l-red-400 bg-red-50"
    : completed
    ? "border-l-4 border-l-emerald-400 bg-emerald-50/40"
    : "border-l-4 border-l-violet-300 bg-white";

  return (
    <div className={`rounded-2xl shadow-sm border border-slate-100 p-5 transition-all ${cardBorder}`}>
      {isEditing ? (
        <div className="flex flex-col gap-3">
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="Title *"
          />
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            rows={2}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            placeholder="Description"
          />
          <input
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition"
            >
              {loading ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold px-4 py-1.5 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            checked={completed}
            onChange={handleToggle}
            className="mt-1 w-4 h-4 accent-violet-600 cursor-pointer flex-shrink-0"
            title={completed ? "Mark as active" : "Mark as completed"}
          />
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm ${completed ? "line-through text-slate-400" : "text-slate-700"}`}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{task.description}</p>
            )}
            {task.dueDate && (
              <span className={`inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                overdue
                  ? "bg-red-100 text-red-600"
                  : completed
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-slate-100 text-slate-500"
              }`}>
                {overdue ? "⚠️ Overdue · " : "📅 "}{formatDate(task.dueDate)}
              </span>
            )}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-slate-400 hover:text-violet-600 bg-slate-100 hover:bg-violet-50 px-3 py-1.5 rounded-lg transition font-medium"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-xs text-slate-400 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-3 py-1.5 rounded-lg transition font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ================================================================
// MAIN COMPONENT: App
// ================================================================
export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  async function fetchTasks() {
    setLoading(true);
    setServerError(""); // clear any previous error
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTasks(data);
    } catch {
      // This fires when the backend is completely unreachable
      setServerError("Cannot connect to the server. Please make sure the backend is running on port 5000.");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((t) => {
    if (filter === "Active") return t.status === "pending";
    if (filter === "Completed") return t.status === "completed";
    return true;
  });

  const activeCount = tasks.filter((t) => t.status === "pending").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  const filters = ["All", "Active", "Completed"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
            Task Manager
          </h1>
          <p className="text-slate-500 text-sm mt-1">Stay on top of your day</p>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block"></span>
              <span className="text-sm text-slate-600 font-medium">{activeCount} Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span className="text-sm text-slate-600 font-medium">{completedCount} Completed</span>
            </div>
          </div>
        </div>

        {/* ── SERVER ERROR BANNER ─────────────────────────────── */}
        {serverError && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            <span className="text-xl">🔌</span>
            <span>{serverError}</span>
          </div>
        )}

        {/* ── ADD TASK FORM ───────────────────────────────────── */}
        <AddTaskForm onAdd={fetchTasks} />

        <div className="flex gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                filter === f
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-violet-300 hover:text-violet-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">
              {filter === "Completed" ? "🏆" : filter === "Active" ? "🎯" : "📋"}
            </div>
            <p className="text-slate-500 font-medium">
              {filter === "All"
                ? "No tasks yet. Add one above!"
                : filter === "Active"
                ? "No active tasks. You're all caught up!"
                : "No completed tasks yet. Keep going!"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} onRefresh={fetchTasks} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}