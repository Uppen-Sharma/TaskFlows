TaskFlows 🚀

TaskFlows is a robust, full-stack Task Management System built with the MERN stack. It features role-based access control (RBAC), real-time time tracking, a sophisticated proposal workflow, and a premium "High-Contrast Glass" UI.



🌟 Key Features

🔐 Authentication & Security

    Secure Login/Register: JWT-based authentication with bcrypt password hashing.

    Secure Logout: Token blacklisting mechanism using Redis/MongoDB TTL to instantly invalidate tokens upon logout.

    Role-Based Access Control (RBAC): Distinct dashboards and permissions for Users and Managers.

    Audit Logging: Tracks every API request, user context, and payload in api_audit.jsonl for security compliance.

📋 Workflow & Task Management

    Proposal System: Standard users cannot create tasks directly; they must Propose a task. Managers review proposals via a dedicated modal to Accept or Reject them.

    Time Budgeting: Tasks use a precise Days : Hours : Minutes time budget system, converted automatically to minutes for database storage.

    Real-Time Timer: Users can Start and Stop timers on their tasks. The system tracks exact timestamps and calculates remaining time dynamically.

    Baseline Requests: Users can request adjustments to the estimated time, which Managers must approve.

🎨 UI/UX

    Premium Design: A "High-Contrast Glassmorphism" theme using Tailwind CSS with deep blurs, glowing accents, and custom scrollbars.

    Responsive Dashboards: Separate, optimized views for Users (Task execution) and Managers (Team oversight).

    Interactive Components: Custom multi-select dropdowns, digital time tumblers, and animated stat cards.

🛠️ Tech Stack

Frontend

    React (Vite): Fast, modern UI library.

    Redux Toolkit: Global state management for Auth, Tasks, and Users.

    Tailwind CSS: Utility-first styling.

    React Router: Client-side routing with protected guards.

    React Hot Toast: Beautiful notifications.

Backend

    Node.js & Express: RESTful API architecture.

    MongoDB & Mongoose: NoSQL database with advanced schema validation.

    JWT (JSON Web Tokens): Stateless authentication.

    HTTPS (Local): Configured to run securely with self-signed certificates in development.

🚀 Getting Started

Prerequisites

    Node.js (v16+)

    MongoDB (Local or Atlas)

    Git

1. Clone the Repository

Bash

git clone https://github.com/Uppen-Sharma/TaskFlows.git
cd TaskFlows

2. Backend Setup

Navigate to the backend folder and install dependencies:
Bash

cd taskflows-backend
npm install

Environment Variables: Create a .env file in taskflows-backend/:
Code snippet

PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflowsdb
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d
NODE_ENV=development

SSL Certificates (For HTTPS): Run this in the backend root to generate local keys:
Bash

openssl req -nodes -new -x509 -keyout key.pem -out cert.pem -days 365

Seed the Database: Populate the DB with sample Users and Tasks (Recommended):
Bash

npm run seed

Start the Server:
Bash

npm run dev

Server runs on https://localhost:5000

3. Frontend Setup

Open a new terminal, navigate to the frontend folder:
Bash

cd taskflows-frontend
npm install

Start React:
Bash

npm run dev

App runs on http://localhost:5173

🧪 Testing & Credentials

The Seeder creates the following default accounts:
Role	Email	Password	Usage
Manager	sara@taskflow.com	pass123	Full control, create tasks, approve proposals.
User	alice@taskflow.com	pass123	Propose tasks, track time, request baseline changes.
User	bob@taskflow.com	pass123	Standard employee account.

📡 API Endpoints

Auth

    POST /api/auth/register - Create new user

    POST /api/auth/login - Login & Get Token

    POST /api/auth/logout - Invalidate Token

Data (Protected)

    GET /api/data/tasks - Fetch tasks (Filtered by Role)

    POST /api/data/tasks - Create Task (Manager) or Propose Task (User)

    PATCH /api/data/tasks/:id - Update Status

    DELETE /api/data/tasks/:id - Delete Task (Manager Only)

    PATCH /api/data/tasks/:id/start-timer - Start Timer

    PATCH /api/data/tasks/:id/stop-timer - Stop Timer

📂 Project Structure

TaskFlows/
├── taskflows-backend/
│   ├── config/         # DB Connection
│   ├── controllers/    # Logic for Auth & Tasks
│   ├── middleware/     # Protect, Manager, Audit Log
│   ├── models/         # Mongoose Schemas (User, Task, Blacklist)
│   └── routes/         # API Route Definitions
│
└── taskflows-frontend/
    ├── src/
    │   ├── app/        # Redux Store
    │   ├── components/ # Shared UI (Header, Footer, Inputs)
    │   ├── features/   # Redux Slices & Feature Components
    │   │   ├── auth/   # Login/Register Forms
    │   │   ├── tasks/  # Task Cards, Forms, Modals
    │   │   └── users/  # User Lists
    │   ├── hooks/      # Custom Hooks (useTaskDashboard)
    │   ├── lib/        # API Service Layers
    │   └── pages/      # Admin & User Dashboards

📄 License

This project is licensed under the MIT License.

Built with ❤️ by Binay Uppen Sharma
