# Ethereum Fraud Detection — Machine Learning Pipeline

This service houses the end-to-end, reproducible Machine Learning pipeline for Ethereum fraud detection, risk scoring, and explainability.

> **Status (Stage 3 Complete):**  
> Complete ML pipeline implemented and verified. Models evaluated against Kaggle's labeled Ethereum fraud dataset. Serialized pipeline artifacts (`ethereum_fraud_model_v1.joblib`), metadata manifests (`model_metadata.json`), SHAP attribution visualizations, and 12 unit tests are verified.  
> *Note: FastAPI prediction endpoints and backend integration will be implemented in Stage 4.*

---

## 1. Dataset Attribution & Characteristics

- **Source Candidate**: [Kaggle Ethereum Fraud Detection Dataset](https://www.kaggle.com/datasets/vagifa/ethereum-frauddetection-dataset) (`vagifa/ethereum-frauddetection-dataset`)
- **Dataset File**: `transaction_dataset.csv` (2.75 MB, 9,841 rows, 51 columns)
- **Target Variable**: `FLAG` (Binary classification: `0` = Benign/Legitimate account, `1` = Illicit/Fraudulent account)
- **Class Distribution**:
  - Class 0 (Legitimate): 7,662 instances (77.86%)
  - Class 1 (Fraudulent): 2,179 instances (22.14%)
  - Imbalance Ratio: ~3.5:1
- **Feature Categories**:
  1. Transaction volumes & counts (sent/received transactions, unique incoming/outgoing counterparties).
  2. Time intervals (avg/min/max time between sent and received transactions).
  3. Ether values (total ETH sent/received, min/max/avg ETH values, closing wallet balance).
  4. ERC-20 token metrics (token transfer counts, unique tokens sent/received, total ERC-20 values).
- **Quality Findings**:
  - 7 zero-variance columns (`ERC20 avg time between sent tnx`, etc.) containing exclusively 0 or null values (filtered out via `VarianceThreshold`).
  - 829 accounts without ERC-20 activity had missing values for token features (imputed via median/zero).
  - 25 addresses appeared more than once, requiring entity-aware splitting to prevent memorization leakage.

---

## 2. Directory Structure

```text
ml-service/
├── artifacts/                            # Serialized model and metadata
│   ├── ethereum_fraud_model_v1.joblib    # Preprocessor + XGBoost Pipeline
│   └── model_metadata.json               # Full evaluation metrics and hyperparameters
├── data/
│   ├── raw/                              # Untouched raw dataset (gitignored)
│   └── processed/                        # Leak-free train/val/test splits (gitignored)
│       └── feature_names.json            # Final 45 input feature names
├── reports/                              # Detailed analysis reports & visual plots
│   ├── dataset_inspection_report.md
│   ├── eda_summary.md
│   ├── model_evaluation_report.md
│   ├── data_compatibility_analysis.md
│   └── figures/                          # EDA and SHAP visualizations (.png)
├── scripts/                              # Standalone CLI tools & pipeline stages
│   ├── download_dataset.py               # Dataset acquisition script
│   ├── inspect_dataset.py                # Schema & distribution validation
│   ├── preprocess_data.py                # Entity-aware splitting & cleaning
│   ├── eda.py                            # Exploratory Data Analysis & plot generation
│   ├── train.py                          # Multi-model training & threshold tuning
│   ├── evaluate.py                       # Standalone model evaluation on any CSV
│   └── predict_sample.py                 # Offline inference verification
├── src/                                  # Modular Python packages
│   ├── data_loader.py                    # Inspection & schema validation
│   ├── preprocessor.py                   # Custom sklearn transformers & splitting
│   ├── model_trainer.py                  # Model training & threshold calibration
│   └── explainer.py                      # SHAP TreeExplainer & visualization
├── tests/                                # Automated unit test suite (12 tests)
│   ├── test_data_loader.py
│   ├── test_preprocessor.py
│   └── test_model_pipeline.py
├── requirements.txt
└── README.md
```

---

## 3. Machine Learning Architecture & Results

### Entity-Aware Data Partitioning
To prevent address memorization leakage, samples are partitioned using `split_data_leakage_free` across unique address hashes:
- **Train Set (70%)**: 6,887 samples
- **Validation Set (15%)**: 1,475 samples (Used strictly for model selection and threshold calibration)
- **Held-Out Test Set (15%)**: 1,479 samples (Evaluated once on final selected model)

### Candidate Model Comparison (Validation Set)

| Model | ROC-AUC | PR-AUC | Precision | Recall | F1 Score | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Dummy (Most Frequent)** | 0.5000 | 0.2217 | 0.0000 | 0.0000 | 0.0000 | Majority baseline |
| **Logistic Regression** | 0.8354 | 0.7303 | 0.7423 | 0.5780 | 0.6499 | Linear baseline |
| **Random Forest** | 0.9984 | 0.9946 | 0.9632 | 0.9602 | 0.9617 | Strong ensemble |
| **XGBoost (Champion)** | **0.9985** | **0.9955** | **0.9841** | **0.9450** | **0.9641** | Calibrated threshold = 0.62 |

### Final Evaluation on Held-Out Test Set (1,479 samples)
- **ROC-AUC**: `0.9985`
- **PR-AUC**: `0.9955`
- **Precision**: `98.41%` (FP = 5)
- **Recall**: `94.50%` (FN = 18)
- **F1-Score**: `0.9641`
- **Confusion Matrix**: `TN: 1,147 | FP: 5 | FN: 18 | TP: 309`

---

## 4. Explainable AI (SHAP)

The pipeline incorporates **TreeSHAP** (`shap.TreeExplainer`) to compute exact Shapley feature attributions.

### Key Global Risk Drivers:
1. **`Time Diff between first and last (Mins)`**: Low account lifespan combined with high transaction frequency strongly flags temporary burner/scam wallets.
2. **`Avg min between sent tnx`**: Automated draining bots exhibit near-zero transaction latency.
3. **`total ether received` / `total Ether sent`**: Rapid turnover where received ETH is immediately forwarded to mixer/cashout contracts.
4. **`ERC20 uniq rec token name`**: Fraudulent phishing wallets often interact with spoofed or obscure token contracts.

Generated figures are saved in `reports/figures/`:
- `shap_summary_plot.png`: Global beeswarm distribution of SHAP values across all features.
- `shap_bar_plot.png`: Mean absolute SHAP value ranking.

---

## 5. Quickstart & Reproduction Commands

### Prerequisites
Python 3.10+ (tested on Python 3.13) with packages installed:
```bash
cd ml-service
pip install -r requirements.txt
```

### Step 1: Download or Place the Dataset
Run the automated downloader:
```bash
python scripts/download_dataset.py
```
*(If you do not have Kaggle API keys configured, follow the console prompt to place `transaction_dataset.csv` in `ml-service/data/raw/`)*

### Step 2: Inspect and Validate Dataset
```bash
python scripts/inspect_dataset.py
```
Outputs validation summary to `reports/dataset_inspection_report.md`.

### Step 3: Preprocess and Partition Data
```bash
python scripts/preprocess_data.py
```
Cleans features, removes entity leakage, and saves `train.csv`, `val.csv`, and `test.csv` to `data/processed/`.

### Step 4: Generate EDA Visualizations
```bash
python scripts/eda.py
```
Generates distribution charts and correlation plots in `reports/figures/`.

### Step 5: Train Models & Generate Explanations
```bash
python scripts/train.py
```
Trains candidate models, tunes decision threshold, performs held-out test evaluation, computes SHAP values, and serializes `artifacts/ethereum_fraud_model_v1.joblib` and `artifacts/model_metadata.json`.

### Step 6: Standalone Model Evaluation & Offline Inference
Evaluate the serialized pipeline against any CSV partition:
```bash
python scripts/evaluate.py --data-path data/processed/test.csv
```
Run offline inference on test samples:
```bash
python scripts/predict_sample.py
```

### Step 7: Run Unit Tests
```bash
pytest tests -v
```

---

## 6. Real-World Live Data Compatibility

As analyzed in `reports/data_compatibility_analysis.md`, the Kaggle dataset relies on **lifetime historical aggregate statistics** (e.g., `avg min between sent tnx`, `total ether received`, `ERC20 total Ether received`).

### Practical Reality:
- A standard raw Ethereum JSON-RPC node (`eth_getBalance`, `eth_getBlock`) **does not provide historical address aggregations** out of the box.
- To score live Ethereum wallets in Stage 4/5:
  1. An indexing layer (e.g., Etherscan API `account.txlist` and `account.tokentx`, or GoldRush/Alchemy) aggregates the wallet's historical transaction list.
  2. The raw transactions are compiled into the 45-feature vector expected by `artifacts/model_metadata.json`.
  3. The serialized pipeline computes the calibrated risk score and SHAP explanations.
