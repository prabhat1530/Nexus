# 🚀 Nexus — Real-Time Social Media Platform

A production-grade, full-stack social media web application with real-time chat, notifications, and complete CRUD functionality. Built with React, Node.js, PostgreSQL, and Socket.IO.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-20-green) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue) ![Socket.IO](https://img.shields.io/badge/Socket.IO-4-black)

---

## ✨ Features

### 🔐 Authentication
- JWT-based auth (access + refresh tokens)
- Password hashing with bcrypt (12 rounds)
- Auto token refresh on expiry
- Protected routes

### 👤 User System
- User profiles with avatar, bio, stats
- Follow / Unfollow system
- User search with debounce
- Suggested users
- Online / Offline status tracking

### 📝 Post System (Full CRUD)
- Create, update, delete posts
- Image URL support with preview
- Like / Unlike with animation
- Comment system
- Infinite scrolling feed
- Explore page (all posts)

### 💬 Real-Time Chat
- One-to-one messaging
- Typing indicators
- Message seen/delivered status
- Chat history with pagination
- Real-time via Socket.IO

### 🔔 Real-Time Notifications
- Like, comment, follow notifications
- Real-time push via sockets
- Read / Unread state
- Notification count badge

### 🎨 UI/UX
- Dark theme with glassmorphism design
- Responsive (mobile + desktop)
- Loading skeletons
- Smooth animations
- Google Font (Inter)

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS 3 |
| Backend | Node.js, Express.js |
| Database | PostgreSQL, Sequelize ORM |
| Real-time | Socket.IO |
| Auth | JWT (access + refresh tokens), bcrypt |
| Security | Helmet, CORS, Rate Limiting, Input Validation |
| State | Context API + useReducer |

---

## 📁 Project Structure

```
├── server/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/         # Sequelize models
│   ├── routes/         # API routes
│   ├── sockets/        # Socket.IO handlers
│   ├── utils/          # JWT, helpers
│   └── server.js       # Entry point
│
├── client/
│   └── src/
│       ├── components/ # UI components
│       ├── context/    # State management
│       ├── hooks/      # Custom hooks
│       ├── pages/      # Page components
│       ├── services/   # API service layer
│       └── utils/      # Utilities
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+
- PostgreSQL 14+
- npm or yarn

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Real-Time\ Social\ Media\ Web\ Application
```

### 2. Setup Backend
```bash
cd server
cp .env.example .env
# Edit .env with your PostgreSQL connection string
npm install
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Environment Variables

Create `server/.env`:
```env
DATABASE_URL=postgres://username:password@localhost:5432/social_media_db
JWT_ACCESS_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Logout user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Current user |
| GET | `/api/users/:id` | Get user by ID |
| GET | `/api/users/search?q=` | Search users |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/follow/:id` | Follow/unfollow |
| GET | `/api/users/suggestions` | Suggested users |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts` | Create post |
| GET | `/api/posts/feed` | User feed |
| GET | `/api/posts/explore` | All posts |
| GET | `/api/posts/:id` | Single post |
| PUT | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post |
| PUT | `/api/posts/:id/like` | Like/unlike |
| POST | `/api/posts/:id/comment` | Add comment |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversations` | List conversations |
| POST | `/api/messages/conversations` | Create conversation |
| GET | `/api/messages/:convId` | Get messages |
| POST | `/api/messages/:convId` | Send message |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications |
| GET | `/api/notifications/unread-count` | Unread count |
| PUT | `/api/notifications/read` | Mark all read |

---

## ⚡ Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `sendMessage` | Client → Server | Send a message |
| `receiveMessage` | Server → Client | Receive a message |
| `typing` | Bidirectional | Typing indicator |
| `stopTyping` | Bidirectional | Stop typing |
| `newNotification` | Server → Client | New notification |
| `userOnline` | Server → Client | User came online |
| `userOffline` | Server → Client | User went offline |

---

## 🚀 Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render / Railway |
| Database | Supabase / Neon / Railway PostgreSQL |

---

## 📄 License

MIT License
