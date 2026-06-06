# Personal Task Manager

A simple full-stack to-do app built as a take-home assessment for Studio Graphene.

Live Frontend: https://task-manager-chi-eosin-55.vercel.app/
Live Backend: https://task-manager-3796.onrender.com

Note: The backend is on Render's free tier, so the first load after inactivity can take around 30-60 seconds to wake up.

---

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express.js
- Storage: Local tasks.json file using Node's fs module

---

## Features

- Add a task with a title (required), description, and due date
- View all tasks sorted by creation date, newest first
- Mark a task as complete or incomplete
- Edit a task's title, description, or due date
- Delete a task with a confirmation prompt
- Filter tasks by All, Active, or Completed
- Shows a count of active and completed tasks
- Tasks with a past due date are highlighted in red
- Shows a simple empty state when there are no tasks
- If the backend is unreachable, a clear error message is shown instead of a broken screen

---

## How to Run Locally

You need Node.js installed. Clone the repo first.

### 1. Start the backend

```bash
cd task-manager-backend
npm install
npm run dev
```

This starts the API at http://localhost:5000

### 2. Start the frontend

Open a new terminal and run:

```bash
cd task-manager-frontend
npm install
npm run dev
```

This starts the app at http://localhost:5173

Keep both terminals running at the same time.

---

## API Endpoints

Base URL: http://localhost:5000

| Method | Endpoint | What it does |
|---|---|---|
| GET | /tasks | Get all tasks |
| POST | /tasks | Create a new task (title is required) |
| PUT | /tasks/:id | Update a task |
| DELETE | /tasks/:id | Delete a task |

---

## What Works

- Full CRUD works end to end
- Data is saved to a tasks.json file so it survives server restarts
- Basic try/catch error handling on both frontend and backend
- If the backend is down, the frontend shows a clean message instead of crashing

---

## What I Would Add With More Time

- Drag and drop to reorder tasks
- A proper database like MongoDB instead of a JSON file
- User login so multiple people can have their own task lists
- Search by task title
- Basic tests using Jest