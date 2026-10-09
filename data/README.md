# Dataset Repository

This directory serves as the local data repository for training datasets, benchmark evaluations, and feature dictionaries.

## Data Policy (Stage 1)
In accordance with Stage 1 requirements, no raw data files, mock transactions, or synthetic CSVs are stored in version control.
Actual dataset downloads (such as the Kaggle Ethereum Fraud Detection Dataset or Elliptic Graph Dataset) will be managed via reproducible download scripts in Stage 2.

## Planned Data Sources
- **Ethereum Fraud Detection Dataset**: Historical Ethereum accounts labeled for illicit behavior (e.g. Ponzi schemes, scams, phishing).
- **On-chain Feature Store**: Normalized aggregations of wallet metrics (transaction count, sent/received ether variance, token counts).
