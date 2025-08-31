# SmartSync Frontend

A modern React-based frontend for the SmartSync task management application.

## Features

- **User Authentication**: Register, login, and email verification with OTP
- **Task Management**: Create, edit, delete, and drag-and-drop tasks
- **Room Management**: Create and join collaborative rooms
- **Real-time Updates**: Socket.IO integration for live updates
- **Responsive Design**: Modern UI with mobile-friendly layout
- **Conflict Resolution**: Handle concurrent task updates

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file in the frontend directory:
   ```
   REACT_APP_API_URL=http://localhost:5001/api
   REACT_APP_SOCKET_URL=http://localhost:5001
   ```

3. **Start Development Server**:
   ```bash
   npm start
   ```

## API Integration

The frontend is now fully integrated with the backend API:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-otp` - Email verification
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks (with room filtering)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/smart-assign` - Smart assign task

### Rooms
- `GET /api/rooms` - Get user's rooms
- `POST /api/rooms` - Create new room
- `POST /api/rooms/join` - Join room
- `DELETE /api/rooms/:id/leave` - Leave room

## Key Changes Made

### 1. Updated API Service
- Changed base URL to use localhost for development
- Added automatic token handling
- Added 401 error handling with automatic logout

### 2. Enhanced Authentication
- Updated AuthContext with proper user management
- Added loading states and error handling
- Improved token management

### 3. Task Management
- Updated task model to match backend structure
- Added room support for tasks
- Enhanced task cards with better UI
- Added room filtering in Kanban board

### 4. Room Management
- New RoomManager component for creating/joining rooms
- Room filtering in task management
- Room-based task organization

### 5. UI Improvements
- Modern, responsive design
- Better loading states
- Improved error handling with toast notifications
- Enhanced navigation with protected routes

## Component Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.js
│   │   ├── Register.js
│   │   └── VerifyOtp.js
│   ├── KanbanBoard.js
│   ├── TaskCard.js
│   ├── TaskModal.js
│   ├── RoomManager.js
│   ├── Navbar.js
│   └── Toast.js
├── context/
│   └── AuthContext.js
├── services/
│   ├── api.js
│   └── socket.js
└── App.js
```

## Usage

1. **Register/Login**: Users can register with email verification or login directly
2. **Create Rooms**: Users can create collaborative rooms for team tasks
3. **Manage Tasks**: Create, edit, and organize tasks in a Kanban board
4. **Room Filtering**: Switch between personal tasks and room tasks
5. **Real-time Updates**: See changes from other users in real-time

## Development

The frontend uses:
- React 18 with hooks
- React Router for navigation
- Axios for API calls
- Socket.IO for real-time updates
- CSS modules for styling

## Backend Requirements

Make sure your backend is running on `http://localhost:5001` and has all the required endpoints implemented as documented in the backend routes.
