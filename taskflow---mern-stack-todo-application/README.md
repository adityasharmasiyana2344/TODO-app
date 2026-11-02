# TaskFlow - Full-Stack MERN Todo Application

A modern, full-stack Todo Management Application built with the **MERN Stack** (**M**ongoDB, **E**xpress.js, **R**eact.js, and **N**ode.js) with TypeScript and Tailwind CSS.

![TaskFlow Screenshot](https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80)

---

## 🚀 Features

- **Full MERN Stack CRUD Operations**:
  - `POST /api/todos`: Add new tasks with validation.
  - `GET /api/todos`: Fetch all tasks with status, search, and category filters.
  - `PUT /api/todos/:id`: Update existing tasks (title, description, priority, category, due date).
  - `DELETE /api/todos/:id`: Safely delete tasks with confirmation modal.
  - `PATCH /api/todos/:id/complete`: Toggle completion status with line-through animation.
  - `GET /api/todos/stats`: Real-time aggregate dashboard metrics.
- **MongoDB & Mongoose Schema**:
  - Fully typed Mongoose Schema (`_id`, `title`, `description`, `completed`, `priority`, `category`, `dueDate`, `createdAt`, `updatedAt`).
  - Seamless support for **MongoDB Atlas** or **local MongoDB instances** via `MONGODB_URI`.
  - Built-in resilient fallback with persistent disk storage (`data/todos.json`) ensuring 100% offline uptime and zero-configuration testing.
  - In-app MongoDB connection modal to test and connect your MongoDB Atlas cluster with live feedback.
- **Modern Dashboard UI**:
  - Blue, Purple, and White theme with rounded cards and subtle depth.
  - Real-time statistics counters for Total, Pending, and Completed tasks, plus an animated Completion Rate progress bar.
  - Interactive Filter tabs: **All**, **Pending**, **Completed**.
  - Dynamic full-text search and category/priority dropdown filtering.
  - Sorting by Newest, Oldest, Priority, or Alphabetical.
  - Batch operations: Complete all tasks and clear completed tasks.
  - Toast notification system providing feedback for every user action.
  - Fully responsive across mobile phones, tablets, and desktop displays.

---

## 🛠️ Tech Stack

- **Frontend**:
  - [React 19](https://react.dev/)
  - [Tailwind CSS v4](https://tailwindcss.com/)
  - [Lucide Icons](https://lucide.dev/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Vite](https://vitejs.dev/)
- **Backend**:
  - [Node.js](https://nodejs.org/)
  - [Express.js](https://expressjs.com/)
  - [Mongoose](https://mongoosejs.com/)
  - [MongoDB](https://www.mongodb.com/)
- **Tooling**:
  - `tsx` for high-performance TypeScript server execution.

---

## 📂 Project Structure

```text
├── data/
│   └── todos.json                   # Persistent local storage fallback
├── server/
│   ├── config/
│   │   └── db.ts                    # MongoDB / Mongoose connection manager
│   ├── controllers/
│   │   └── todoController.ts        # REST API request handlers & validation
│   ├── models/
│   │   └── Todo.ts                  # Mongoose Todo schema & interface
│   ├── routes/
│   │   └── todoRoutes.ts            # Express router endpoints
│   └── storage/
│       └── fileStore.ts             # Persistent document storage engine
├── src/
│   ├── components/
│   │   ├── Header.tsx               # Brand header with live DB status badge
│   │   ├── StatsDashboard.tsx       # Real-time task statistics & progress bar
│   │   ├── TodoInput.tsx            # Task creation form with expandable options
│   │   ├── FilterBar.tsx            # Status tabs, search, category & sort controls
│   │   ├── TodoCard.tsx             # Interactive task card with animations
│   │   ├── EditTodoModal.tsx        # Modal for editing tasks
│   │   ├── DeleteConfirmModal.tsx   # Safe deletion confirmation modal
│   │   ├── MongoStatusModal.tsx     # Live MongoDB inspector & URI switcher
│   │   ├── EmptyState.tsx           # Friendly empty states
│   │   └── Toast.tsx                # Toast notification system
│   ├── services/
│   │   └── api.ts                   # Typed HTTP client for /api endpoints
│   ├── types/
│   │   └── todo.ts                  # TypeScript models & enums
│   ├── App.tsx                      # Main application dashboard
│   ├── main.tsx                     # React root mount
│   └── index.css                    # Tailwind CSS configuration
├── server.ts                        # Unified Express backend & Vite middleware entry
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚡ Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- Optional: A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI or a running local MongoDB instance.

### 2. Installation

Clone the repository and install all dependencies:

```bash
git clone https://github.com/your-username/mern-todo-app.git
cd mern-todo-app
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your configuration:

```env
PORT=3000
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/tododb?retryWrites=true&w=majority"
```

> **Note**: If `MONGODB_URI` is omitted, the application automatically runs in **Embedded Persistent Mode**, using local file-backed storage (`data/todos.json`) matching the exact Mongoose schema. You can also connect to MongoDB Atlas at runtime using the in-app **Database Settings** modal!

### 4. Running the Development Server

Start the full-stack server (runs Express API and Vite frontend on port 3000):

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build & Execution

To compile the production frontend and launch the server:

```bash
npm run build
npm start
```

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/todos` | Fetch all todos (supports `?status=pending\|completed`, `?search=...`, `?category=...`, `?priority=...`, `?sortBy=newest\|oldest\|priority\|title`) |
| `POST` | `/api/todos` | Create a new task (body: `{ title, description, priority, category, dueDate }`) |
| `GET` | `/api/todos/:id` | Fetch a single task by MongoDB ID |
| `PUT` | `/api/todos/:id` | Update an existing task |
| `DELETE` | `/api/todos/:id` | Delete a task permanently |
| `PATCH` | `/api/todos/:id/complete` | Toggle task completed status (body: `{ completed: boolean }`) |
| `GET` | `/api/todos/stats` | Retrieve aggregate counts, completion rate, and priority breakdown |
| `GET` | `/api/status` | Check MongoDB connection status and health |
| `POST` | `/api/config/mongo` | Dynamically test and switch MongoDB connection |

---

## 📄 License

Apache-2.0
