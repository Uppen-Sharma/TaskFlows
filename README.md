🚀 TaskFlows
A High-Performance, Secure Task Management Ecosystem

TaskFlows is a sophisticated task management platform built to bridge the gap between simple to-do lists and complex enterprise workflows. It features a "High-Contrast Glassmorphism" UI, precise time-budgeting engines, and a security-first backend architecture utilizing Audit Logs and Token Blacklisting.
🌟 Core Concepts & Architecture
1. The "Proposal" Workflow

Unlike standard CRUD apps, TaskFlows enforces a hierarchy. Standard users cannot clutter the active task board.

    Flow: User clicks "Propose Task" → Task created with status proposed → Manager receives notification in ProposalApprovalModal → Manager Approves (Active) or Rejects (Deleted).

    Code Reference: See UserCreateTaskModal.jsx and AdminDashboard.jsx.

2. The Time Engine

Time tracking is calculated server-side to prevent manipulation, but rendered client-side for immediate feedback.

    Logic: Remaining Time = Current Estimate - (Current Time - Start Time).

    Visuals: The UI glows Emerald when active, Amber when on hold, and Red when the time budget is exceeded ("Over").

    Code Reference: useTaskTimeCalculations.jsx (Frontend) and taskController.js (Backend).

3. Security First

    Audit Logging: Every critical API action (POST/PUT/DELETE) is sanitized (passwords redacted) and logged to api_audit.jsonl for compliance.

    Token Blacklisting: Logout isn't just client-side. The JWT is added to a MongoDB BlacklistToken collection with a TTL index to prevent replay attacks.

    Defense: Implements helmet, xss-clean, hpp, and express-mongo-sanitize.

🛠️ Tech Stack
Frontend (Client)

    Framework: React 18 (Vite)

    State Management: Redux Toolkit (Slices for Auth, Tasks, Users)

    Styling: Tailwind CSS (Custom "Glass" theme, Backdrop Blur, Animations)

    Routing: React Router v6 with ProtectedRoute wrappers

    Testing: Vitest + React Testing Library

Backend (API)

    Runtime: Node.js & Express

    Database: MongoDB & Mongoose

    Authentication: JWT (JSON Web Tokens) + BCrypt

    Validation: Custom Middleware + Mongoose Schema Validation

    Testing: MSW (Mock Service Worker) for API interception

🚀 Installation & Setup
Prerequisites

    Node.js (v16+)

    MongoDB (Running locally on port 27017 or Atlas URI)

1. Clone the Repository
Bash
