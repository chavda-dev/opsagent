<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=6366f1&height=200&section=header&text=OpsAgent&fontSize=72&fontColor=ffffff&fontAlignY=38&desc=AI-Powered%20Business%20Operations%20Dashboard&descAlignY=58&descSize=18&descColor=a5b4fc&animation=fadeIn" width="100%" />

<br/>

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=18&duration=3000&pause=1000&color=6366F1&center=true&vCenter=true&multiline=true&repeat=true&width=600&height=60&lines=Natural+language+%E2%86%92+Database+operations;Inventory+%E2%80%A2+Orders+%E2%80%A2+Appointments+%E2%80%A2+Analytics" alt="Typing SVG" />

<br/><br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Gemini](https://img.shields.io/badge/Google-Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-a855f7?style=for-the-badge)](LICENSE)

</div>

---

## What is OpsAgent?

OpsAgent is a **natural language business operations dashboard**. Instead of navigating forms and menus, you describe what you need in plain English — the AI agent translates it into database operations and shows you the result instantly.

```
> "Show low stock items"
> "Mark all pending orders as fulfilled"
> "Add 50kg of flour to inventory"
> "How many appointments do I have today?"
```

Built for the **Google Cloud Rapid Agent Hackathon** — MongoDB track.

---

## Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|:---|:---|:---|
| **Frontend** | React 18 + Vite | UI framework |
| **Styling** | Tailwind CSS + Framer Motion | Dark theme + animations |
| **Charts** | Recharts | Analytics visualizations |
| **Backend** | Node.js + Express | REST API server |
| **Database** | MongoDB Atlas | Persistent storage |
| **DB Protocol** | MongoDB MCP Server | AI ↔ DB bridge |
| **AI / NLU** | Google Gemini API | Natural language → structured intent |
| **Notifications** | react-hot-toast | Real-time alerts |

</div>

---

## Features

<details>
<summary><b>📊 Dashboard</b></summary>
<br/>

- 4 live KPI cards: Total Inventory Value, Pending Orders, Today's Appointments, Low Stock Count
- Recent orders table with status badges
- Low stock alert list sorted by urgency
- Trend indicators on each KPI

</details>

<details>
<summary><b>📦 Inventory Management</b></summary>
<br/>

- Sortable, filterable table with category filter
- Full-row red highlight for low stock items (< 10 units)
- Slide-in drawer for adding new items
- Click any row to edit in a detail drawer
- CSV export of current filtered view

</details>

<details>
<summary><b>🛒 Orders — Kanban Board</b></summary>
<br/>

- Four-column pipeline: **Pending → Processing → Fulfilled → Cancelled**
- Order cards with customer name, items, total, timestamp
- Click a card to open detail drawer and change status
- CSV export

</details>

<details>
<summary><b>📅 Appointments — Calendar</b></summary>
<br/>

- Week view with color-coded appointment blocks
- List view toggle
- Navigate between weeks with prev/next controls
- Click any appointment for full details

</details>

<details>
<summary><b>📈 Analytics</b></summary>
<br/>

- Orders over time (area chart)
- Revenue trend (line chart)
- Orders by status (donut chart)
- Low stock items (horizontal bar chart)
- Inventory value by category (bar chart)

</details>

<details>
<summary><b>🤖 Agent Terminal</b></summary>
<br/>

- VS Code-style terminal panel (toggle with `Ctrl+\``)
- Inline data tables rendered inside terminal responses
- Quick-command chips for common queries
- Structured output blocks — not a chat UI

</details>

<details>
<summary><b>⚡ Real-time & UX</b></summary>
<br/>

- Low stock polling every 60 seconds with toast notifications
- Badge count on Inventory sidebar icon
- CMD+K global search across all collections
- Connection status indicator with auto-reconnect
- Framer Motion drawer animations throughout

</details>

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **MongoDB Atlas** account + cluster ([free tier works](https://www.mongodb.com/cloud/atlas/register))
- **Google Gemini API key** ([get one here](https://aistudio.google.com/apikey))

### 1. Clone

```bash
git clone https://github.com/your-username/opsagent.git
cd opsagent
```

### 2. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
PORT=3001
```

### 4. Run

```bash
# Terminal 1 — backend
cd server
node src/index.js

# Terminal 2 — frontend
cd client
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)**

---

## Agent Commands

| Command | Action |
|:---|:---|
| `Show all inventory` | List every inventory item |
| `Show low stock items` | Filter items below threshold |
| `Add 50 units of milk` | Insert a new inventory record |
| `Show pending orders` | List orders awaiting fulfillment |
| `Mark all pending orders as fulfilled` | Bulk-update order status |
| `Appointments today` | Show today's scheduled appointments |
| `Business summary` | Counts and recent records across all collections |

---

## Deployment

This project is configured for [Render](https://render.com).

**Backend** — deploy as a Web Service from the `server/` directory.

**Frontend** — deploy as a Static Site from the `client/` directory.
- Build command: `npm run build`
- Publish directory: `dist`
- Set env var: `VITE_API_URL=https://your-backend.onrender.com`

---

## Screenshots

> Screenshots / demo GIF coming soon.

---

## Project Structure

```
opsagent/
├── client/               # React + Vite frontend
│   └── src/
│       ├── pages/        # Dashboard, Inventory, Orders, Appointments, Analytics
│       ├── components/   # Layout (Sidebar, TopBar, AgentTerminal) + shared
│       ├── hooks/        # useConnection, useLowStockAlerts
│       └── api.js        # Fetch wrapper
├── server/               # Express backend
│   └── src/
│       ├── agent/        # Gemini NLU + plan executor
│       ├── mcp/          # MongoDB MCP client + tool wrappers
│       ├── routes/       # REST endpoints
│       └── index.js      # Entry point
└── .env.example
```

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=6366f1&height=100&section=footer&animation=fadeIn" width="100%" />

Built for **Google Cloud Rapid Agent Hackathon 2026**

</div>
