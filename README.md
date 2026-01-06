# 🚀 TaskFlows

### A High-Performance, Secure Task Management Ecosystem

**TaskFlows** is a sophisticated task management platform built to bridge the gap between simple to-do lists and complex enterprise workflows. It features a "High-Contrast Glassmorphism" UI, precise time-budgeting engines, and a security-first backend architecture utilizing Audit Logs and Token Blacklisting.

---

## 🌟 Core Concepts & Architecture

### 1. The "Proposal" Workflow

Unlike standard CRUD apps, TaskFlows enforces a hierarchy. Standard users cannot clutter the active task board.

- **Flow:** User clicks "Propose Task" → Task created with status `proposed` → Manager receives notification in `ProposalApprovalModal` → Manager **Approves** (Active) or **Rejects** (Deleted).
- **Code Reference:** See `UserCreateTaskModal.jsx` and `AdminDashboard.jsx`.

### 2. The Time Engine

Time tracking is calculated server-side to prevent manipulation, but rendered client-side for immediate feedback.

- **Logic:** `Remaining Time = Current Estimate - (Current Time - Start Time)`
- **Visuals:** UI glows **Emerald** when active, **Amber** when on hold, and **Red** when the time budget is exceeded ("Over").
- **Code Reference:** `useTaskTimeCalculations.jsx` (Frontend) and `taskController.js` (Backend).

### 3. Security First

- **Audit Logging:** Every critical API action (POST/PUT/DELETE) is sanitized (passwords redacted) and logged to `api_audit.jsonl` for compliance.
- **Token Blacklisting:** Logout invalidates JWT by storing it in a MongoDB `BlacklistToken` collection with a TTL index to prevent replay attacks.
- **Defense:** Uses `helmet`, `xss-clean`, `hpp`, and `express-mongo-sanitize`.

---

## 🛠️ Tech Stack

### Frontend (Client)

- **Framework:** React 18 (Vite)
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS (Glassmorphism theme)
- **Routing:** React Router v6 with `ProtectedRoute`
- **Testing:** Vitest + React Testing Library

### Backend (API)

- **Runtime:** Node.js & Express
- **Database:** MongoDB & Mongoose
- **Authentication:** JWT + BCrypt
- **Validation:** Custom Middleware + Schema Validation
- **Testing:** MSW (Mock Service Worker)

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js v16+
- MongoDB (Local or Atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/Uppen-Sharma/TaskFlows.git
cd TaskFlows

2. Backend Setup

cd taskflows-backend
npm install

Create .env file:

PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflowsdb
JWT_SECRET=YOUR_SECURE_SECRET_KEY
JWT_EXPIRE=30d
ENABLE_AUDIT_LOGS=true
FRONTEND_URL=http://localhost:5173

Seed database:

npm run seed

Start server:

npm run dev

3. Frontend Setup

cd taskflows-frontend
npm install
npm run dev

🧪 Test Credentials (Seeded)
Role	Name	Email	Password	Capability
Manager	Sara Connor	sara@taskflow.com
	pass123	Approve proposals, manage tasks
User	Alice Johnson	alice@taskflow.com
	pass123	Propose tasks, manage timers
User	Bob Williams	bob@taskflow.com
	pass123	Standard user
📡 API Reference
Authentication

    POST /api/auth/register

    POST /api/auth/login

    POST /api/auth/logout

Tasks

    GET /api/data/tasks

    POST /api/data/tasks

    PATCH /api/data/tasks/:id/start-timer

    PATCH /api/data/tasks/:id/stop-timer

    PATCH /api/data/tasks/:id/manage-baseline

🧪 Testing

cd taskflows-frontend
npm run test

Key tests:

    authSlice.test.js

    taskService.test.jsx

    UserDashboard.test.jsx

📂 Project Structure

TaskFlows/
├── taskflows-backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
└── taskflows-frontend/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── features/
    │   ├── hooks/
    │   ├── pages/
    │   └── test/
    └── vite.config.js

📜 License

MIT License. See LICENSE for details.
<p align="center">Built with ❤️ by <strong>Binay Uppen Sharma</strong></p> ```
