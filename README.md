# 🚀 TaskFlows

### A High-Performance, Secure Task Management Ecosystem

**TaskFlows** is a sophisticated task management platform built to bridge the gap between simple to-do lists and complex enterprise workflows. It features a **High-Contrast Glassmorphism UI**, precise time-budgeting engines, and a **security-first backend architecture** utilizing Audit Logs and Token Blacklisting.

---

## 🌟 Core Concepts & Architecture

### 1. The Proposal Workflow
Unlike standard CRUD apps, TaskFlows enforces a hierarchical workflow. Standard users cannot clutter the active task board.

- **Flow:** User clicks **Propose Task** → Task created with status `proposed` →  
  Manager receives notification in `ProposalApprovalModal` →  
  Manager **Approves** (Active) or **Rejects** (Deleted)
- **Code Reference:** `UserCreateTaskModal.jsx`, `AdminDashboard.jsx`

### 2. The Time Engine
Time tracking is calculated server-side to prevent manipulation while remaining reactive on the client.

- **Logic:** `Remaining Time = Current Estimate - (Current Time - Start Time)`
- **Visual Indicators:** - 🟢 **Emerald:** Active  
  - 🟠 **Amber:** Paused  
  - 🔴 **Red:** Time exceeded
- **Code Reference:** `useTaskTimeCalculations.jsx` (Frontend), `taskController.js` (Backend)

### 3. Security First Architecture
- **Audit Logging:** All critical API actions (POST / PUT / DELETE) are sanitized and logged to `api_audit.jsonl`
- **Token Blacklisting:** JWTs are invalidated on logout using a MongoDB `BlacklistToken` collection with TTL indexing
- **Security Middleware:** `helmet`, `xss-clean`, `hpp`, `express-mongo-sanitize`

---

## 🛠️ Tech Stack

### Frontend (Client)
- React 18 (Vite)
- Redux Toolkit
- Tailwind CSS (Glassmorphism theme)
- React Router v6 (`ProtectedRoute`)
- Vitest + React Testing Library

### Backend (API)
- Node.js & Express
- MongoDB & Mongoose
- JWT Authentication + BCrypt
- Custom Validation Middleware
- MSW (Mock Service Worker)

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v16+
- MongoDB (Local or Atlas)

### 1. Clone Repository
```bash
git clone [https://github.com/Uppen-Sharma/TaskFlows.git](https://github.com/Uppen-Sharma/TaskFlows.git)
cd TaskFlows
```
2. Backend Setup

Navigate to the backend folder and install dependencies:
Bash

cd taskflows-backend
npm install

Create a .env file in the taskflows-backend root directory:
Code snippet

PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflowsdb
JWT_SECRET=YOUR_SECURE_SECRET_KEY
JWT_EXPIRE=30d
ENABLE_AUDIT_LOGS=true
FRONTEND_URL=http://localhost:5173

Seed the database with test users and data:
Bash

npm run seed

Start the backend server:
Bash

npm run dev

3. Frontend Setup

Open a new terminal, navigate to the frontend folder, and start the app:
Bash

cd taskflows-frontend
npm install
npm run dev

🧪 Test Credentials (Seeded)
Role	Name	Email	Password	Capability
Manager	Sara Connor	sara@taskflow.com	pass123	Approve proposals, manage tasks
User	Alice Johnson	alice@taskflow.com	pass123	Propose tasks, manage timers
User	Bob Williams	bob@taskflow.com	pass123	Standard user
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

To run frontend tests:
Bash

cd taskflows-frontend
npm run test

Key Test Files:

    authSlice.test.js

    taskService.test.jsx

    UserDashboard.test.jsx


<p align="center"> Built with ❤️ by <strong>Binay Uppen Sharma</strong> </p>
