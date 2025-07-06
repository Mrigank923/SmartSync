# SmartSync

SmartSync is a real-time collaborative task management app inspired by Trello. It helps teams organize work, assign tasks smartly, and handle conflicts when multiple users try to update the same task.

---
## 🌐 Deployed App

👉 Live App: https://smart-sync-phi.vercel.app/

👉 Postman doc: https://www.postman.com/hotel-crew/workspace/public-doc/collection/39313531-9d691121-2a00-4ceb-996f-d84d7bda1ce5?action=share&creator=39313531

👉 Demo Video: Watch the demo

---
## 🚀 Project Overview

SmartSync allows users to:
- Register and log in with email verification (OTP-based)
- Create, edit, and delete tasks
- Drag and drop tasks across Todo, In Progress, and Done columns
- Collaborate in real-time via WebSockets
- Assign tasks automatically using Smart Assign
- Handle merge conflicts gracefully when editing tasks

The app is fully responsive and works on both desktop and mobile screens.

---

## 🛠 Tech Stack Used

**Frontend**
- React (CRA)
- React Router
- Axios
- Socket.IO Client
- Pure CSS (no frameworks)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT Authentication
- Nodemailer for OTP

---

## ⚙️ Setup and Installation

### 1️⃣ Clone the repo
```bash
git clone https://github.com/Mrigank923/smartsync.git
cd smartsync
```
### 2️⃣ Setup backend
```bash
cd backend
npm install
```
### Create a .env file in backend/:
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```
### Start the backend:
```bash
npm run dev
```
The backend will be at: http://localhost:5000

### 3️⃣ Setup frontend
```bash
cd ../frontend
npm install
npm start

```
The frontend will be at: http://localhost:3000

---
### ✨ Features List & Usage Guide
✅ User Authentication

Register with email + OTP verification

Login/logout securely using JWT

✅ Kanban-style Board

View tasks in Todo / In Progress / Done columns

Drag & drop tasks between columns

✅ Task Management

Add, edit, delete tasks through modal forms

Inline priority + status updates

✅ Smart Assign

Automatically assigns the task to the least busy user

✅ Conflict Handling

Detects when a task is edited simultaneously

Shows a modal for user to merge or overwrite

✅ Action Logs

View the last 20 actions performed on tasks

✅ Real-time Sync

WebSocket updates for all task changes

✅ Responsive Design

Works on mobile and desktop seamlessly