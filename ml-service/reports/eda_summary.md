# Exploratory Data Analysis (EDA) Summary Report

## Key Analytical Findings

1. **Class Imbalance**: Legitimate accounts comprise 7,662 (77.9%) of the dataset, while fraudulent accounts comprise 2,179 (22.1%). An evaluation framework based on PR-AUC, F1-Score, and Recall is necessary, as accuracy will be misleading.
2. **Missing Value Structure**: Missing values occur in token-related features (ERC20 columns). In all cases, missing values correlate with accounts having zero token contract interactions (imputing 0 / median accurately models this behavior).
3. **Temporal Skew**: Legitimate accounts display significantly longer account lifespans (`Time Diff between first and last (Mins)`), whereas illicit accounts typically operate in bursts with compressed lifespans prior to abandonment.
4. **Transaction Asymmetry**: Fraudulent wallets exhibit distinct imbalances between incoming and outgoing transactions, with rapid liquidation of received funds.

## Visual Artifacts Generated in `reports/figures/`:

- `class_distribution.png`: Fraud vs. legitimate account representation.
- `missing_values.png`: Distribution of null values across ERC-20 features.
- `feature_distributions.png`: Log-scaled feature densities comparing fraud and normal behavior.
- `correlation_bars.png`: Features exhibiting strongest linear association with the fraud label.