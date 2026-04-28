# 🚗 CarConnect

> A full-stack platform connecting car owners with mechanics — featuring real-time fault detection, OBD2 integration via ESP32, appointment scheduling, and live notifications.

![CarConnect Banner](https://img.shields.io/badge/CarConnect-v1.0-blue?style=for-the-badge&logo=car)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=flat&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat&logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat&logo=docker)
![ESP32](https://img.shields.io/badge/ESP32-Arduino-E7352C?style=flat&logo=arduino)

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Arduino / ESP32 Setup](#arduino--esp32-setup)
- [Deployment](#deployment)
- [API Endpoints](#api-endpoints)

---

## About

CarConnect solves the communication gap between car owners and mechanics. Instead of calling garages or showing up without information, the app allows:

- **Clients** to report faults (manually or automatically via OBD2), view real-time vehicle data, and book appointments
- **Mechanics** to receive fault reports, respond with price estimates, manage their schedule, and track repair history

---

## Features

### Client Side
- 🔐 Register / Login with role-based access
- 📊 Dashboard with fault stats and quick actions
- 🚨 Report faults manually or receive automatic alerts from ESP32
- 📡 View real-time vehicle data (engine temp, RPM, battery voltage, DTC codes)
- 📅 Book appointments from mechanic's available slots
- 📜 View full fault and repair history

### Mechanic Side
- 🔧 Dashboard with incoming fault requests
- ✅ Accept faults and update status (Pending → In Progress → Resolved)
- 💰 Send price estimates and repair time
- 📅 Manage available appointment slots
- 🔔 Real-time notifications via Socket.io

### Hardware (ESP32 + OBD2)
- 📟 Reads live vehicle data via ELM327 Bluetooth adapter
- 📤 Sends data to server every 10 seconds over WiFi
- ⚠️ Auto-creates fault reports when DTC error codes are detected

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│              React App (localhost:3000)                 │
└────────────────────────┬────────────────────────────────┘
                         │ REST API / Socket.io
┌────────────────────────▼────────────────────────────────┐
│                       BACKEND                           │
│           Node.js + Express (localhost:5000)            │
│                    JWT Auth                             │
└──────────┬──────────────────────────┬───────────────────┘
           │                          │
┌──────────▼──────────┐   ┌───────────▼───────────────────┐
│      MongoDB        │   │        ESP32 + ELM327          │
│  (localhost:27017)  │   │   Reads OBD2 → Sends via WiFi  │
└─────────────────────┘   └───────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Material UI, Chart.js, Axios |
| Backend | Node.js, Express.js, Socket.io, JWT |
| Database | MongoDB, Mongoose |
| Hardware | ESP32, ELM327 Bluetooth OBD2, Arduino IDE |
| DevOps | Docker, GitHub Actions CI/CD, Oracle Cloud, Duck DNS, Nginx, Let's Encrypt |

---

## Project Structure

```
CarConnect/
├── frontend/                   # React Application
│   └── src/
│       ├── App.jsx             # Main router
│       ├── context/
│       │   └── AuthContext.jsx # Global auth state
│       ├── services/
│       │   └── api.jsx         # Axios instance + interceptors
│       ├── components/
│       │   └── shared/
│       │       └── Navbar.jsx
│       └── pages/
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           ├── ClientDashboard.jsx
│           ├── MechanicDashboard.jsx
│           ├── FaultReportPage.jsx
│           ├── VehicleDataPage.jsx
│           ├── AppointmentsPage.jsx
│           └── FaultHistoryPage.jsx
│
├── backend/                    # Node.js API
│   ├── server.js               # Entry point + Socket.io
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── models/
│   │   ├── User.js
│   │   ├── FaultReport.js
│   │   ├── Appointment.js
│   │   └── SensorData.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── faults.js
│   │   ├── appointments.js
│   │   └── sensorData.js
│   └── middleware/
│       └── auth.js             # JWT middleware
│
├── arduino/                    # ESP32 Code
│   ├── CarConnect_ESP32.ino    # Main file
│   ├── config.h                # WiFi + server settings
│   ├── wifi_manager.h/cpp      # WiFi connection
│   ├── obd2_reader.h/cpp       # OBD2 data reading
│   └── server_sender.h/cpp     # HTTP data upload
│
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD Pipeline
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB installed locally
- Git

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/osayl12/CarConnect.git
cd CarConnect
```

**2. Start the Backend**
```bash
cd backend
npm install
node server.js
```

**3. Start the Frontend**
```bash
cd frontend
npm install
npm start
```

The app will open at `http://localhost:3000`

### Environment Variables

Create a `.env` file inside `/backend`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/carconnect
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:3000
```

---

## Arduino / ESP32 Setup

### Hardware Required
| Component | Description |
|-----------|-------------|
| ESP32 DevKit | Main microcontroller with WiFi |
| ELM327 Bluetooth v1.5 | OBD2 adapter (PIC18F25K80 chip) |
| Jumper Wires | For connections |

### Wiring

```
ELM327 TX  →  ESP32 GPIO16 (RX2)
ELM327 RX  →  ESP32 GPIO17 (TX2)
ELM327 GND →  ESP32 GND
ELM327 VCC →  ESP32 VIN (5V)
```

### Arduino Setup
1. Install [Arduino IDE](https://www.arduino.cc/en/software)
2. Add ESP32 board URL in Preferences:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Install libraries: `ArduinoJson`, `ELMduino`
4. Edit `arduino/config.h` with your WiFi credentials, server URL, and MongoDB user ID
5. Upload `CarConnect_ESP32.ino` to your ESP32

---

## Deployment

### CI/CD Pipeline (GitHub Actions + Docker)

Every push to `main` automatically:
1. Builds Docker images for frontend and backend
2. Pushes images to DockerHub
3. SSHs into the Oracle Cloud server and deploys

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | DockerHub username |
| `DOCKERHUB_TOKEN` | DockerHub access token |
| `SSH_HOST` | Oracle server IP |
| `SSH_USER` | SSH username (ubuntu) |
| `SSH_KEY` | Private SSH key |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT secret key |

### Live URL
```
https://carconnect.duckdns.org
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Faults
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/faults/my-faults` | Client: get own faults |
| GET | `/api/faults/mechanic-faults` | Mechanic: get all faults |
| POST | `/api/faults` | Create fault report |
| PATCH | `/api/faults/:id/status` | Update fault status |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments/available` | Get available slots |
| POST | `/api/appointments/add-slot` | Mechanic: add slot |
| PATCH | `/api/appointments/:id/book` | Client: book slot |
| PATCH | `/api/appointments/:id/cancel` | Cancel appointment |

### Sensor Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sensor-data` | ESP32: send vehicle data |
| GET | `/api/sensor-data/latest` | Get latest reading |
| GET | `/api/sensor-data/history` | Get history |

---

## 👨‍💻 Developer

**Osayl** — Kinneret College of Technology  
Final Year Project — Software Engineering Track

---

*Built with ❤️ using React, Node.js, MongoDB, ESP32, and Docker*
