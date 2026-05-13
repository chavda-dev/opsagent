# OpsAgent

**AI-powered business operations dashboard**

---

## About

OpsAgent is a natural language operations agent for small businesses. Instead of navigating menus or writing queries, you describe what you need in plain English — "show low stock items", "mark order #42 as fulfilled", "add a new inventory item" — and the agent handles it.

It manages three core domains:
- **Inventory** — track stock levels, get low-stock alerts, add and update items
- **Orders** — view and move orders through a Kanban pipeline (Pending → Processing → Fulfilled)
- **Appointments** — schedule and track customer appointments on a week calendar

A persistent agent terminal is available on every page, so you can issue commands without leaving your current view.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Charts | Recharts |
| Routing | React Router v6 |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| DB Protocol | MongoDB MCP Server (`@mongodb-js/mongodb-mcp-server`) |
| AI | Google Gemini API |
| Notifications | react-hot-toast |

---

## Features

- **Dashboard** — KPI cards (inventory value, pending orders, today's appointments, low stock count) with recent orders and low stock alerts
- **Inventory management** — sortable/filterable table, slide-in drawers for add and edit, CSV export, full-row red highlight for low stock
- **Kanban orders** — drag-free status pipeline with click-to-move cards
- **Calendar appointments** — week view and list toggle, color-coded by status
- **Analytics** — orders over time, revenue trend, orders by status (donut), low stock bar chart, inventory value by category
- **Agent terminal** — VS Code-style command panel, inline data tables in responses, quick-command chips
- **Global search** — CMD+K spotlight across all collections
- **Low stock alerts** — polls every 60 seconds, toast notification on new detections, badge on sidebar nav
- **Connection recovery** — live status indicator, reconnect button when MongoDB is unreachable

---

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster
- A Google Gemini API key (get one at [aistudio.google.com](https://aistudio.google.com))

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd opsagent

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Configuration

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
PORT=3001
```

### Run

Open two terminals:

```bash
# Terminal 1 — backend
cd server
node src/index.js

# Terminal 2 — frontend
cd client
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

---

## Usage

Type natural language commands into the Agent terminal (click **Agent** in the top bar or press `Ctrl+\``):

| Command | What it does |
|---|---|
| `Show all inventory` | Lists every inventory item |
| `Show low stock items` | Filters items with quantity below threshold |
| `Add 50 units of milk` | Inserts a new inventory record |
| `Show pending orders` | Lists orders with status "pending" |
| `Mark all pending orders as fulfilled` | Bulk-updates order status |
| `Appointments today` | Shows today's scheduled appointments |
| `Business summary` | Returns counts and recent records across all collections |

---

## Screenshots

> Screenshots coming soon.

---

## License

MIT
