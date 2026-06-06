# 🌊 KumbhFlow: Real-Time Crowd Intelligence & Safety Platform

> **Ujjain Simhastha 2028 Next-Gen Crowd Management Solution** > A high-performance, real-time analytics and predictive dispatch dashboard designed to prevent stampedes, optimize pilgrim routing, and manage sector capacities dynamically during massive religious congregations.

🌐 **Live Frontend Application:** [kumbhflow-nine.vercel.app](https://kumbhflow-nine.vercel.app)  
⚙️ **Live Backend API Gateway:** [kumbhflow-backend.onrender.com](https://kumbhflow-backend.onrender.com)

---

## 🚀 Core Features

* 📊 **Command Center Dashboard:** High-level metrics tracking total pilgrim inflow, critical density zones, active alerts, and an overall safety index score.
* 🛰️ **Live WebSocket Streaming:** Real-time data synchronization utilizing Socket.io to push automated crowd updates every 8 seconds without manual refreshing.
* 🤖 **Predictive Congestion Engine:** Simulates crowd build-up dynamics to warn command centers of high-risk bottlenecks before they turn critical.
* 🚨 **Emergency Dispatch & Broadcast:** Instant control room interface to issue emergency rerouting alerts and push live notifications directly to specific infrastructure sectors.
* 🗺️ **Dynamic Resource Allocation:** Interface for micro-level deployment of emergency personnel, medical units, and physical barriers based on current crowd density.

---

## 🛠️ Architecture & Tech Stack

KumbhFlow is built using a decoupled **MERN** architecture engineered for low-latency updates:

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React.js, Tailwind CSS, Lucide Icons | Responsive command control panel interface |
| **Backend** | Node.js, Express.js | Event-driven REST API gateway & orchestration |
| **Real-Time** | Socket.io | Bi-directional WebSocket pipelines for instantaneous pushes |
| **Database** | MongoDB Atlas | Distributed cloud database utilizing optimized indexing |
| **Automation** | Node-Cron | Background task automation handling the crowd simulator loop |

---

## 📂 Repository Structure

```text
kumbhflow/
├── client/              # React Frontend Application
│   ├── src/
│   │   ├── components/  # Dashboard, Predictor, & Control panels
│   │   └── context/     # AppContext.js (Global Socket/Axios State)
│   └── package.json
└── server/              # Node.js/Express Backend Server
    ├── middleware/      # Data Seeder & Crowd Simulation Engines
    ├── routes/          # REST API Endpoints (Sectors, Alerts, Analytics)
    ├── index.js         # Express App & WebSocket Server Initialization
    └── package.json
