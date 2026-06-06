// =============================================================
// server.js — Personal Task Manager Backend
// Tech Stack: Node.js + Express.js
// Data Store: tasks.json (local file, no external DB)
// =============================================================

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto"); // Built-in Node module for generating unique IDs

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------------------------------------------------------
// Path to our JSON "database" file.
// __dirname ensures the path is always relative to THIS file,
// not wherever the process was launched from.
// ----------------------------------------------------------------
const TASKS_FILE = path.join(__dirname, "tasks.json");

// ================================================================
// MIDDLEWARE SETUP
// ================================================================

// cors() allows our frontend (running on a different port, e.g. 3000)
// to talk to this backend without browser security blocking it.
app.use(cors());

// express.json() parses incoming request bodies that have a
// Content-Type of "application/json" so we can read req.body easily.
app.use(express.json());

// ================================================================
// FILE HELPERS
// These two small helper functions keep file I/O in one place.
// If the logic ever changes (e.g. switching to a DB), we only
// update these functions — not every single route handler.
// ================================================================

/**
 * Reads tasks from the JSON file and returns them as a JS array.
 * If the file doesn't exist yet, it returns an empty array
 * so the app works even on a fresh install.
 */
function readTasks() {
  // Check whether the file exists before trying to read it
  if (!fs.existsSync(TASKS_FILE)) {
    return []; // First run: no file yet, so start with an empty list
  }
  const raw = fs.readFileSync(TASKS_FILE, "utf-8");
  return JSON.parse(raw); // Convert the JSON string back into a JS array
}

/**
 * Receives a JS array and writes it to the JSON file.
 * null, 2  → pretty-prints the JSON with 2-space indentation,
 * making the file human-readable if you open it in a text editor.
 */
function writeTasks(tasks) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), "utf-8");
}

// ================================================================
// ROUTES
// ================================================================

// ----------------------------------------------------------------
// GET /tasks
// Returns every task stored in the JSON file.
// ----------------------------------------------------------------
app.get("/tasks", (req, res) => {
  try {
    const tasks = readTasks();

    // Sort by createdAt descending so the newest task appears first.
    // The minus sign flips the default ascending order.
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(tasks);
  } catch (err) {
    // If file reading or JSON parsing blows up, send a 500 so the
    // client knows something went wrong on the server side.
    res.status(500).json({ error: "Failed to read tasks.", details: err.message });
  }
});

// ----------------------------------------------------------------
// POST /tasks
// Creates a new task and appends it to the JSON file.
// Body: { title (required), description (optional), dueDate (optional) }
// ----------------------------------------------------------------
app.post("/tasks", (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    // Validation: title is the only required field.
    // .trim() removes accidental whitespace so "   " is treated as empty.
    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Title is required." });
    }

    // Build the new task object following the agreed data model.
    const newTask = {
      id: crypto.randomUUID(),      // Guaranteed unique string (no collisions)
      title: title.trim(),
      description: description ? description.trim() : "", // Default to empty string
      dueDate: dueDate || null,      // null means "no due date"
      status: "pending",             // Every task starts as pending
      createdAt: new Date().toISOString(), // ISO string is easy to sort & display
    };

    const tasks = readTasks();
    tasks.push(newTask); // Add the new task to the array
    writeTasks(tasks);   // Persist the updated array back to the file

    // 201 Created is the correct HTTP status for a successful resource creation.
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: "Failed to create task.", details: err.message });
  }
});

// ----------------------------------------------------------------
// PUT /tasks/:id
// Updates an existing task's title, description, dueDate, or status.
// :id is a URL parameter — Express extracts it into req.params.id.
// ----------------------------------------------------------------
app.put("/tasks/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, status } = req.body;

    const tasks = readTasks();

    // Find the index of the task we want to update.
    // findIndex returns -1 if nothing matches.
    const taskIndex = tasks.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
      // 404 Not Found: the client sent an ID that doesn't exist in our store.
      return res.status(404).json({ error: `Task with id "${id}" not found.` });
    }

    // Merge the existing task with the incoming changes.
    // We use spread (...) so we only overwrite fields that were actually sent.
    // If the client sends only { status: "completed" }, title etc. stay untouched.
    const updatedTask = {
      ...tasks[taskIndex],
      // Only override a field when the client explicitly provided it
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(dueDate !== undefined && { dueDate }),
      ...(status !== undefined && { status }),
      updatedAt: new Date().toISOString(), // Track when the last edit happened
    };

    tasks[taskIndex] = updatedTask; // Replace the old task with the updated one
    writeTasks(tasks);

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: "Failed to update task.", details: err.message });
  }
});

// ----------------------------------------------------------------
// DELETE /tasks/:id
// Removes a single task from the JSON file by its ID.
// ----------------------------------------------------------------
app.delete("/tasks/:id", (req, res) => {
  try {
    const { id } = req.params;
    const tasks = readTasks();

    // Check whether the task actually exists before attempting deletion.
    const taskExists = tasks.some((t) => t.id === id);

    if (!taskExists) {
      return res.status(404).json({ error: `Task with id "${id}" not found.` });
    }

    // filter() returns a NEW array that excludes the deleted task.
    // This is safer than mutating the array in place (splice).
    const remaining = tasks.filter((t) => t.id !== id);
    writeTasks(remaining);

    // 200 with a message confirms which task was deleted.
    res.json({ message: `Task "${id}" deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task.", details: err.message });
  }
});

// ================================================================
// START SERVER
// ================================================================
app.listen(PORT, () => {
  console.log(`✅  Task Manager API is running at http://localhost:${PORT}`);
  console.log(`📁  Data file: ${TASKS_FILE}`);
});