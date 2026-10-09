# Model Evaluation & Benchmark Report

**Selected Model Architecture**: `XGBoost` (Version `1.0.0`)

**Evaluation Timestamp**: `2026-10-09T16:20:10.326347+00:00`

## 1. Candidate Models Comparison (Validation Set)

| Candidate Model | Val PR-AUC | Val Recall | Val F1-Score | Optimal Threshold | Training Time |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Baseline_Dummy** | 0.2231 | 0.2355 | 0.2316 | 0.50 | 0.178s |
| **Logistic_Regression** | 0.5233 | 0.6911 | 0.5947 | 0.50 | 1.539s |
| **Random_Forest** | 0.9920 | 0.9358 | 0.9563 | 0.66 | 0.516s |
| **XGBoost** | 0.9953 | 0.9633 | 0.9707 | 0.62 | 2.579s |

## 2. Final Held-Out Test Set Performance

Evaluated once on unseen test partition (`1479` samples) at decision threshold **`0.62`**:

- **Precision (Fraud)**: **`0.9841`** (Out of all flagged accounts, 98.4% are truly fraudulent)
- **Recall (Fraud)**: **`0.9450`** (Successfully detects 94.5% of all illicit accounts)
- **F1-Score**: **`0.9641`**
- **PR-AUC (Average Precision)**: **`0.9955`**
- **ROC-AUC**: **`0.9985`**

### Confusion Matrix (Test Set)

| | Predicted Legitimate | Predicted Fraud |
| :--- | :--- | :--- |
| **Actual Legitimate (0)** | True Negatives: **1,147** | False Positives: **5** |
| **Actual Fraud (1)** | False Negatives: **18** | True Positives: **309** |

## 3. Top SHAP Risk Attribution Factors

- **`Total ERC20 tnxs`**: Mean |SHAP| = `3.52108`
- **`Time Diff between first and last (Mins)`**: Mean |SHAP| = `1.37014`
- **`Unique Received From Addresses`**: Mean |SHAP| = `0.91980`
- **`ERC20 total Ether received`**: Mean |SHAP| = `0.57137`
- **`ERC20 max val rec`**: Mean |SHAP| = `0.53132`
- **`avg val received`**: Mean |SHAP| = `0.44483`
- **`Avg min between received tnx`**: Mean |SHAP| = `0.40352`
- **`total transactions (including tnx to create contract`**: Mean |SHAP| = `0.35575`

> **Interpretability Note**:
> Feature importance metrics denote statistical associations within the trained model and do not constitute definitive proof or legal verification that a given Ethereum address committed fraud.
