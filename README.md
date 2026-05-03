# 🗳️ Live Polling System

A real-time polling application where users can create polls, share them via a unique link, and watch results update live as votes come in — no page refresh needed.

Built with **TypeScript**, **Node.js**, **React**, **WebSockets (`ws`)**, **Prisma**, and **PostgreSQL**.

---

## ✨ Features

- 🔐 JWT-based authentication (register / login)
- 📊 Create polls with multiple options and optional expiry
- 🔗 Shareable poll links via unique `shareCode`
- ⚡ Real-time vote updates powered by WebSockets
- 📈 Live animated bar charts using Chart.js
- 🚫 Duplicate vote prevention (per user & anonymous token)
- 🛑 Admin can close/reopen polls at any time
- 📱 Responsive UI

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Backend | Node.js + Express |
| WebSockets | `ws` library |
| ORM | Prisma |
| Database | PostgreSQL (NeonDB) |
| Frontend | React + Vite |
| Charts | Chart.js |
| Auth | JSON Web Tokens (JWT) |
| Deployment | Railway (backend) + Vercel (frontend) |

---

## 📁 Project Structure

```
live-polling/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handler logic
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic
│   │   ├── ws/              # WebSocket server & handlers
│   │   ├── middleware/      # Auth, error handling
│   │   └── db/
│   │       └── prisma/      # Prisma client + schema
│   └── index.ts
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── hooks/           # useWebSocket, usePoll
        └── api/             # Fetch wrappers
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL database (local or hosted via [NeonDB](https://neon.tech))

### 1. Clone the repo

```bash
git clone https://github.com/your-username/live-polling-system.git
cd live-polling-system
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
DATABASE_URL="postgresql://user:password@host/dbname"
JWT_SECRET="your_super_secret_key"
PORT=3000
```

Run Prisma migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Start the dev server:

```bash
npm run dev
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:3000`.

---

## 🔌 API Endpoints

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Login and receive JWT |

### Polls

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/polls` | ✅ | Create a new poll |
| GET | `/api/polls/:shareCode` | ❌ | Get poll by share code |
| DELETE | `/api/polls/:id` | ✅ | Delete a poll |
| PATCH | `/api/polls/:id/close` | ✅ | Close/reopen a poll |

### Votes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/votes` | ❌ | Submit a vote (auth optional) |

---

## ⚡ WebSocket Events

The WebSocket server runs alongside Express on the same port.

| Event | Direction | Payload | Description |
|---|---|---|---|
| `subscribe` | Client → Server | `{ pollId }` | Subscribe to a poll's live updates |
| `vote_update` | Server → Client | `{ pollId, results }` | Broadcast new vote counts to all subscribers |
| `poll_closed` | Server → Client | `{ pollId }` | Notify clients when a poll is closed |

---

## 🗄️ Database Schema

```
User       ──< Poll      (one user creates many polls)
Poll       ──< Option    (one poll has many options)
Poll       ──< Vote      (one poll has many votes)
Option     ──< Vote      (one option has many votes)
User       ──< Vote      (optional — null for anonymous voters)
```

Duplicate votes are prevented via a `@@unique([pollId, userId])` constraint on the `Vote` model.

---

## 🖼️ Screenshots

> _Add screenshots or a demo GIF here once the UI is complete._

---

## 📌 Roadmap

- [x] Project setup & DB schema
- [ ] Auth routes (register / login)
- [ ] Poll CRUD routes
- [ ] Vote submission
- [ ] WebSocket real-time layer
- [ ] React frontend
- [ ] Live chart UI
- [ ] Deployment

---

## 📄 License

MIT
