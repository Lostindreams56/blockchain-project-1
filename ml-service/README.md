# Ethereum Fraud Detection — Machine Learning Inference Service

This microservice provides high-throughput transaction risk scoring and feature attribution (SHAP explainability) for Ethereum wallet addresses.

> **Status (Stage 1 Foundation):**
> Architectural skeleton and dependency definitions are established. Model training pipelines, serialized weights (`.joblib`), and live inference endpoints will be implemented in **Stage 2: Machine Learning & Feature Engineering Pipeline**.

---

## Directory Structure

```text
ml-service/
├── app/                  # FastAPI inference application
│   ├── __init__.py
│   └── main.py           # API endpoints & health check skeleton
├── training/             # Data cleaning, feature engineering & model training scripts
│   └── README.md
├── tests/                # Model evaluation and API test suites
│   └── __init__.py
├── artifacts/            # Serialized model weights, scalers, and feature metadata
│   ├── .gitkeep
│   └── README.md
├── requirements.txt      # Core Python dependencies
└── .env.example          # Environment variables template
```

---

## Planned Core Capabilities (Stage 2)

1. **Transaction & Behavioral Feature Engineering**:
   - Time between transactions, variance of incoming/outgoing values, contract creation frequency, ERC-20 token diversity, turnover ratios.
2. **Model Architecture**:
   - Gradient boosted decision trees (`XGBoost`) trained on labeled Ethereum fraudulent/illicit wallet datasets (e.g., Ponzi schemes, phishing, wash trading).
3. **Explainable AI (XAI)**:
   - TreeSHAP explainer for computing local feature contributions, allowing compliance officers and analysts to understand why an address was flagged.
4. **FastAPI Inference Microservice**:
   - `POST /api/v1/predict/wallet`: Accepts engineered wallet feature vectors and returns risk score (0.0 to 1.0), risk tier (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), and top-k contributing risk drivers.

---

## Setup (For Future Stages)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start FastAPI dev server (when implemented in Stage 2)
uvicorn app.main:app --reload --port 8000
```
