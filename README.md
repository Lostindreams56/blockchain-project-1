# Ethereum Fraud Detection & Risk Intelligence Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-v18-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-v4-black.svg)](https://expressjs.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Ready-009688.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

A production-minded, full-stack cybersecurity and on-chain threat intelligence platform engineered to detect illicit behavior, Ponzi contracts, phishing clusters, and high-risk wallet anomalies on the Ethereum blockchain using supervised machine learning (`XGBoost`) and explainable AI (`TreeSHAP`).

---

## 1. Architecture Overview

The system is architected as a modular, decoupled monorepo:

```text
ethereum-fraud-detection/
├── client/          # React + Vite + TypeScript + Tailwind CSS Frontend
├── server/          # Node.js + Express + TypeScript + Mongoose Backend API Gateway
├── ml-service/      # Python + FastAPI + XGBoost + SHAP Inference Microservice (Skeleton)
├── data/            # Dataset specifications & feature dictionaries
├── docs/            # Architecture blueprints & technical design documents
├── scripts/         # Workspace automation and environment utilities
├── .gitignore       # Root exclusion rules (protects credentials & models)
├── package.json     # Workspace management & concurrent execution
└── README.md        # Comprehensive system documentation
```

For complete technical specifications, sequence diagrams, and an explanation of the indexed blockchain data model, see [docs/architecture.md](docs/architecture.md).

---

## 2. Technology Stack

### Frontend (`client/`)
* **Interface Architecture**: Authentic **Windows 95 Retro Desktop Workstation** (`FraudOS 95`).
* **Core Framework**: React 18 with TypeScript and Vite.
* **Bevel & Theming Engine**: Custom 1995 2-stage outset/inset bevel borders, MS Sans Serif system typography, and color schemes (Classic Teal, Cobalt Navy, Terminal Matrix, Dark Charcoal).
* **Desktop Environment**: Draggable windows, taskbar with Start button, system tray, digital clock, window tabs, minimize/maximize/restore, and desktop shortcut icons.
* **Audio & Tactile Feedback**: In-memory retro sound synthesis using Web Audio API (zero audio assets, defaults to OFF) and mobile haptics (`navigator.vibrate`).
* **Routing**: React Router DOM with classic Windows dialogs for `/login`, `/register`, and `/404`.
* **State & Data Fetching**: TanStack Query (React Query) with Axios interceptors.

### Backend (`server/`)
* **Runtime**: Node.js LTS (v20+) with TypeScript and `tsx`
* **Web Framework**: Express
* **Database ODM**: Mongoose with MongoDB Atlas support
* **Validation**: Zod schema validation for runtime environment variables
* **Security**: Helmet security headers, CORS origin enforcement, and `express-rate-limit`
* **Observability**: Pino structured logger with redaction of secrets, tokens, and credentials
* **Testing**: Vitest with Supertest

### Machine Learning Service Foundation (`ml-service/`)
* **Framework**: Python FastAPI with Uvicorn
* **Data & Modeling**: Pandas, NumPy, scikit-learn, XGBoost, TreeSHAP, and Joblib
* *Note: Model training and serialization activate in Stage 2.*

---

## 3. Prerequisites

* **Node.js**: LTS version 20.x or higher (tested with Node v26)
* **npm**: v10.x or higher
* **Python**: 3.10+ (for `ml-service` in Stage 2)
* **MongoDB**: MongoDB Atlas connection URI or local MongoDB instance (optional in Stage 1; backend operates in graceful degraded mode if unreachable)

---

## 4. Quickstart & Installation

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd "ethereum-fraud-detection"

# Install root dependencies
npm install

# Install both backend and frontend dependencies
npm run install:all
```

> **Windows PowerShell Note**: If PowerShell blocks `npm`, run commands using `npm.cmd` (e.g., `npm.cmd install`).

### Step 2: Environment Configuration

Run the automated setup utility to generate local `.env` files from templates:

```bash
node scripts/verify-env.js
```

Or manually copy the `.env.example` templates:

```bash
# Server configuration
cp server/.env.example server/.env

# Client configuration
cp client/.env.example client/.env

# ML Service configuration
cp ml-service/.env.example ml-service/.env
```

---

## 5. Running the Application

### Option A: Run Full Stack Concurrently (Recommended)

From the workspace root, run:

```bash
npm run dev
```

This launches both the Express backend API (`http://localhost:5000`) and the Vite frontend (`http://localhost:5173`) in parallel with color-coded terminal outputs.

### Option B: Run Services Individually

**Terminal 1 — Backend API:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend Application:**
```bash
cd client
npm run dev
```

**Terminal 3 — Python ML Service (Starter Skeleton):**
```bash
cd ml-service
python -m venv venv
.\venv\Scripts\Activate.ps1    # On Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## 6. Health & Diagnostic Endpoints

| Service | Endpoint | Method | Purpose |
| :--- | :--- | :--- | :--- |
| **Backend** | `http://localhost:5000/api/v1/health` | `GET` | Process liveness probe, uptime, and metadata |
| **Backend** | `http://localhost:5000/api/v1/ready` | `GET` | Dependency readiness probe (MongoDB connection state) |
| **ML Microservice** | `http://localhost:8000/health` | `GET` | Python FastAPI liveness check |
| **Frontend UI** | `http://localhost:5173/` | `GET` | Web console with live backend API telemetry |

---

## 7. Testing & Quality Verification

Run backend automated test suite:
```bash
npm --prefix server run test
```

Run TypeScript strict type checking across all workspaces:
```bash
npm run typecheck
```

Build production bundles:
```bash
npm run build
```

---

## 8. Troubleshooting Tips

### 1. Backend Port Collision (`EADDRINUSE: 5000`)
If port 5000 is occupied (e.g., by macOS AirPlay Receiver or another Node process), adjust `PORT=5001` in `server/.env` and update `VITE_API_BASE_URL=http://localhost:5001/api/v1` in `client/.env`.

### 2. MongoDB Standby / Connection Warning
The backend is intentionally designed **not** to crash if MongoDB Atlas is temporarily unreachable. The server starts normally and serves `/api/v1/health`. If MongoDB is not yet configured, `/api/v1/ready` will accurately report `status: "not_ready"` with `readyState: 0` (disconnected). Add your MongoDB Atlas connection string to `server/.env` when ready.

### 3. Windows PowerShell Script Execution Policy
If running `npm run ...` throws `File ...\npm.ps1 cannot be loaded because running scripts is disabled`, use:
```powershell
npm.cmd run dev
```
Or temporarily bypass the policy for your terminal session:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### 4. CORS Errors in Browser
Ensure `CLIENT_URL=http://localhost:5173` matches the exact host and port serving the Vite client application in `server/.env`.

---

## 9. Project Roadmap & Implementation Stages

- [x] **Stage 1: Project Foundation & Baseline Monorepo Scaffold**
  - Modular Express + TypeScript backend with Zod, Helmet, rate limiting, and Pino.
  - React 18 + Vite + TypeScript + Tailwind CSS dark-themed frontend console.
  - Readiness and liveness probes (`/api/v1/health`, `/api/v1/ready`).
- [x] **Stage 2: Secure Authentication & Session Management**
  - Robust JWT authentication with access token in memory and rotating HttpOnly refresh cookies.
  - Revocable user sessions stored in MongoDB Atlas, password hashing via bcrypt.
  - Security suite: CSRF protection, rate limiting on `/login` and `/register`, safe user sanitization.
  - Professional cybersecurity-themed `/login`, `/register`, and protected `/dashboard` frontend.
  - 18 automated backend Vitest integration tests covering full auth lifecycles.
- [x] **Stage 3: Ethereum Fraud Detection Machine Learning Pipeline**
  - Real Kaggle dataset acquisition (`vagifa/ethereum-frauddetection-dataset`, 9,841 accounts, 51 features).
  - Preprocessing engine with entity-aware stratified splitting to guarantee 0 address memorization leakage.
  - Exploratory data analysis (EDA) with automated distribution, class imbalance, and correlation plots.
  - Benchmark comparison across baseline Dummy, Logistic Regression, Random Forest, and XGBoost.
  - Champion model: **XGBoost Classifier** achieving **0.9985 ROC-AUC**, **0.9955 PR-AUC**, **98.41% Precision**, and **94.50% Recall** at calibrated threshold 0.62.
  - Explainable AI (XAI) using TreeSHAP generating global beeswarm and feature importance rankings.
  - Artifact serialization (`ethereum_fraud_model_v1.joblib`, `model_metadata.json`).
  - Real-world blockchain compatibility analysis for RPC & Etherscan ingestion.
  - 12 automated unit tests (`pytest`) covering data loader, preprocessor, and model pipeline.
- [ ] **Stage 4: FastAPI Prediction Service & Inference Integration**
  - High-throughput FastAPI endpoints (`/predict`, `/explain`).
  - Integration with Node.js backend gateway and real-time wallet risk scoring.
- [ ] **Stage 5: Blockchain Ingestion, Case Management & Interactive Forensics**
  - Real-time address feature extraction via Etherscan / Ethereum RPC.
  - Risk radar charts, transaction counterparty network graphs, and investigator notes.
