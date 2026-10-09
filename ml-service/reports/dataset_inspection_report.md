# Dataset Inspection & Validation Report

**File Name**: `transaction_dataset.csv` | **Size**: `2.75 MB` | **Dimensions**: `9841` rows × `51` columns

## 1. Executive Quality Summary

- **Exact Duplicate Rows**: 0
- **Feature Duplicate Rows**: 546
- **Columns with Missing Values**: 25
- **Constant Columns (Zero Variance)**: ['ERC20 avg time between sent tnx', 'ERC20 avg time between rec tnx', 'ERC20 avg time between rec 2 tnx', 'ERC20 avg time between contract tnx', 'ERC20 min val sent contract', 'ERC20 max val sent contract', 'ERC20 avg val sent contract']
- **Quasi-Constant Columns (>99.9% single value)**: ['min value sent to contract', 'max val sent to contract', 'avg value sent to contract', 'total ether sent contracts']
- **Leakage Identifiers Detected**: `['raw_row_id', 'Index', 'Address']`

## 2. Target Variable Verification

- **Configured Target Column**: `FLAG`
  - Class `0` (Legitimate): **7,662** samples (77.86%)
  - Class `1` (Fraud / Illicit): **2,179** samples (22.14%)
- **Class Imbalance Ratio**: ~3.52:1

## 3. Columns Detail

| Column Name | Type | Unique Count | Missing Count | Missing % | Leakage Risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `raw_row_id` | int64 | 9841 | 0 | 0.0% | ⚠️ YES |
| `Index` | int64 | 4729 | 0 | 0.0% | ⚠️ YES |
| `Address` | object | 9816 | 0 | 0.0% | ⚠️ YES |
| `FLAG` | int64 | 2 | 0 | 0.0% | No |
| `Avg min between sent tnx` | float64 | 5013 | 0 | 0.0% | No |
| `Avg min between received tnx` | float64 | 6223 | 0 | 0.0% | No |
| `Time Diff between first and last (Mins)` | float64 | 7810 | 0 | 0.0% | No |
| `Sent tnx` | int64 | 641 | 0 | 0.0% | No |
| `Received Tnx` | int64 | 727 | 0 | 0.0% | No |
| `Number of Created Contracts` | int64 | 20 | 0 | 0.0% | No |
| `Unique Received From Addresses` | int64 | 256 | 0 | 0.0% | No |
| `Unique Sent To Addresses` | int64 | 258 | 0 | 0.0% | No |
| `min value received` | float64 | 4589 | 0 | 0.0% | No |
| `max value received` | float64 | 6302 | 0 | 0.0% | No |
| `avg val received` | float64 | 6767 | 0 | 0.0% | No |
| `min val sent` | float64 | 4719 | 0 | 0.0% | No |
| `max val sent` | float64 | 6647 | 0 | 0.0% | No |
| `avg val sent` | float64 | 5854 | 0 | 0.0% | No |
| `min value sent to contract` | float64 | 3 | 0 | 0.0% | No |
| `max val sent to contract` | float64 | 4 | 0 | 0.0% | No |
| `avg value sent to contract` | float64 | 4 | 0 | 0.0% | No |
| `total transactions (including tnx to create contract` | int64 | 897 | 0 | 0.0% | No |
| `total Ether sent` | float64 | 5868 | 0 | 0.0% | No |
| `total ether received` | float64 | 6728 | 0 | 0.0% | No |
| `total ether sent contracts` | float64 | 4 | 0 | 0.0% | No |
| `total ether balance` | float64 | 5717 | 0 | 0.0% | No |
| `Total ERC20 tnxs` | float64 | 300 | 829 | 8.42% | No |
| `ERC20 total Ether received` | float64 | 3460 | 829 | 8.42% | No |
| `ERC20 total ether sent` | float64 | 1415 | 829 | 8.42% | No |
| `ERC20 total Ether sent contract` | float64 | 29 | 829 | 8.42% | No |

*...and 21 additional columns documented in JSON report.*