"""
Data Loader & Dataset Validation Utilities
Provides reliable file reading, column name sanitization, and target column validation.
"""

from pathlib import Path
import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)


def load_raw_dataset(file_path: Path | str) -> pd.DataFrame:
    """
    Loads raw CSV dataset and standardizes column names by stripping extraneous whitespaces.
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Dataset file not found at: {path.resolve()}")

    df = pd.read_csv(path)

    # Strip leading/trailing spaces from column names (common in Ethereum transaction datasets)
    df.columns = [str(col).strip() for col in df.columns]

    # Handle unnamed leading index column if present
    if "" in df.columns:
        df = df.rename(columns={"": "raw_row_id"})
    elif "Unnamed: 0" in df.columns:
        df = df.rename(columns={"Unnamed: 0": "raw_row_id"})

    logger.info(f"Loaded dataset from {path.name} with shape: {df.shape}")
    return df


def validate_target_column(df: pd.DataFrame, target_col: str) -> dict:
    """
    Validates that the target column exists and contains valid classification labels.
    Returns summary statistics for the target.
    """
    if target_col not in df.columns:
        candidates = detect_candidate_targets(df)
        raise ValueError(
            f"Configured target column '{target_col}' not found in dataset columns: {list(df.columns[:10])}... "
            f"Candidate target columns detected: {candidates}"
        )

    target_series = df[target_col].dropna()
    unique_vals = sorted(target_series.unique().tolist())

    if len(unique_vals) < 2:
        raise ValueError(
            f"Target column '{target_col}' contains only {len(unique_vals)} unique class: {unique_vals}. "
            "Binary or multi-class classification requires at least 2 distinct classes."
        )

    counts = df[target_col].value_counts().to_dict()
    missing_count = int(df[target_col].isna().sum())

    return {
        "target_col": target_col,
        "unique_values": unique_vals,
        "class_counts": counts,
        "missing_count": missing_count,
        "is_binary": len(unique_vals) == 2,
    }


def detect_candidate_targets(df: pd.DataFrame) -> list[str]:
    """
    Discovers potential target label columns based on naming heuristics and low cardinality.
    """
    candidates = []
    known_target_names = {"flag", "target", "label", "fraud", "is_fraud", "class", "illicit"}

    for col in df.columns:
        col_lower = col.lower()
        if col_lower in known_target_names or any(name in col_lower for name in ["flag", "fraud", "label"]):
            candidates.append(col)
        elif df[col].nunique() == 2 and not col.lower().startswith("is_"):
            candidates.append(col)

    return list(dict.fromkeys(candidates))


def detect_leakage_identifiers(df: pd.DataFrame) -> list[str]:
    """
    Identifies high-risk identifier columns and indices that must be excluded
    to prevent target leakage or memorization.
    """
    leakage_cols = []
    known_id_names = {"address", "index", "raw_row_id", "unnamed: 0", "hash", "tx_hash", "id"}

    for col in df.columns:
        col_lower = col.lower()
        if col_lower in known_id_names:
            leakage_cols.append(col)
        elif df[col].dtype == object and df[col].nunique() > 0.8 * len(df):
            # Very high cardinality string column (likely hashes or addresses)
            leakage_cols.append(col)

    return list(dict.fromkeys(leakage_cols))
