# SmartSync Logic Doc

This document explains the key logic behind **SmartSync's Smart Assign** feature and **Conflict Handling** system.

---

## 🚀 Smart Assign Logic

The **Smart Assign** feature helps automatically assign tasks to the team member who has the least workload.

### 📝 How it works:
1️⃣ When a user clicks the **Smart Assign** button on a task, a request is sent to the backend.

2️⃣ The backend queries the database to:
- List all users who can be assigned the task.
- Count how many tasks are currently assigned to each user.
- Determine which user has the fewest active tasks.

3️⃣ The backend updates the task’s `assignedUser` field with that user’s ID.

4️⃣ A WebSocket event is emitted so that all connected clients see the updated assignment instantly.

### 🌟 Example scenario:
- Alice has 3 tasks.
- Bob has 1 task.
- Charlie has 2 tasks.

➡ When Smart Assign is triggered, the task will automatically be assigned to **Bob**, as he has the fewest tasks.

This helps ensure fair distribution of work without manual assignment.

---

## ⚡ Conflict Handling Logic

Conflict handling ensures that when multiple users are editing the same task at the same time, their changes don’t overwrite each other without review.

### 📝 How it works:
1️⃣ Each task has a field called `updatedAt` — this timestamp tracks the last time the task was modified.

2️⃣ When a user submits a task update, their request includes the `updatedAt` value they last saw.

3️⃣ The backend checks:
- If the `updatedAt` value in the database matches the `updatedAt` value sent by the user → ✅ No conflict → Update is applied.
- If the values don’t match → ⚠️ Conflict detected → The backend responds with **409 Conflict** status and sends back:
  - The server’s current version of the task (the latest one)
  - The client’s attempted version

4️⃣ The frontend displays a **Conflict Modal** showing both versions side-by-side.

5️⃣ The user chooses how to resolve:
- **Merge:** They can combine parts of both versions and submit the merged task.
- **Overwrite:** They can force their version to replace the server version.

### 🌟 Example scenario:
- Alice opens a task and edits the title.
- Bob, at the same time, opens the same task and changes the priority.
- Bob clicks **Save** → The server updates the task and updates `updatedAt`.
- Alice clicks **Save** → The server sees her `updatedAt` is outdated → Responds with a conflict.
- Alice sees both versions and decides how to proceed.

This prevents accidental overwrites and keeps team collaboration safe.

---

## ✅ Summary

Smart Assign and Conflict Handling work together to:
- Distribute tasks fairly without extra work.
- Protect data integrity during collaborative editing.

These features make SmartSync reliable and efficient for team task management.

