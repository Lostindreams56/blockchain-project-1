"""
Data Preprocessing & Leakage-Free Dataset Splitting Pipeline
Implements strict feature sanitation, entity-aware splitting, and sklearn Pipeline components.
"""

from pathlib import Path
import logging
from typing import Tuple, List, Dict, Any
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import RobustScaler
from sklearn.feature_selection import VarianceThreshold

from src.data_loader import detect_leakage_identifiers

logger = logging.getLogger(__name__)

# Known identifier and text token columns in Ethereum transaction datasets
DEFAULT_EXCLUDE_COLUMNS = [
    "Address",
    "Index",
    "raw_row_id",
    "Unnamed: 0",
    "ERC20 most sent token type",
    "ERC20_most_rec_token_type",
]


def prepare_features_and_target(
    df: pd.DataFrame,
    target_col: str = "FLAG",
    exclude_columns: List[str] | None = None,
) -> Tuple[pd.DataFrame, pd.Series, pd.Series | None, List[str]]:
    """
    Separates features and target, drops leakage/identifier columns,
    and handles infinite numeric values.
    Returns: (X, y, entity_keys, feature_names)
    """
    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found in dataframe.")

    # Remove exact duplicate rows
    initial_len = len(df)
    df = df.drop_duplicates().copy()
    duplicates_removed = initial_len - len(df)
    if duplicates_removed > 0:
        logger.info(f"Removed {duplicates_removed} exact duplicate rows.")

    # Preserve entity address key for entity-aware group splitting if present
    entity_keys = df["Address"].copy() if "Address" in df.columns else None

    # Determine columns to drop
    to_drop = set(DEFAULT_EXCLUDE_COLUMNS)
    if exclude_columns:
        to_drop.update(exclude_columns)

    # Detect additional dynamic leakage columns (e.g. raw index columns)
    dynamic_leakage = detect_leakage_identifiers(df)
    to_drop.update(dynamic_leakage)

    # Always drop target from features
    to_drop.add(target_col)

    feature_cols = [c for c in df.columns if c not in to_drop]

    X = df[feature_cols].copy()
    y = df[target_col].copy()

    # Convert non-numeric values to numeric where feasible
    for col in X.columns:
        if X[col].dtype == object:
            # Try converting to numeric, non-convertible become NaN
            X[col] = pd.to_numeric(X[col], errors="coerce")

    # Replace infinite values with NaN so imputers handle them cleanly
    X = X.replace([np.inf, -np.inf], np.nan)

    logger.info(f"Prepared feature matrix with shape {X.shape} and {len(feature_cols)} feature columns.")
    return X, y, entity_keys, feature_cols


def split_data_leakage_free(
    X: pd.DataFrame,
    y: pd.Series,
    entity_keys: pd.Series | None = None,
    val_size: float = 0.15,
    test_size: float = 0.15,
    random_state: int = 42,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, pd.Series]:
    """
    Performs stratified train/validation/test split while ensuring that identical
    entities (addresses) never leak across train and evaluation partitions.
    """
    total_eval_size = val_size + test_size
    relative_test_ratio = test_size / total_eval_size

    if entity_keys is not None and entity_keys.nunique() < len(entity_keys):
        # Multiple records per address exist: deduplicate by address first or split by entity
        # to guarantee zero address leakage
        logger.info(
            f"Entity keys detected with {entity_keys.nunique()} unique addresses among {len(entity_keys)} rows. "
            "Enforcing entity isolation across splits."
        )

        unique_entities = pd.DataFrame({"Address": entity_keys, "target": y}).drop_duplicates(subset=["Address"])
        
        train_entities, eval_entities = train_test_split(
            unique_entities["Address"],
            test_size=total_eval_size,
            stratify=unique_entities["target"],
            random_state=random_state,
        )

        eval_subset = unique_entities[unique_entities["Address"].isin(eval_entities)]
        val_entities, test_entities = train_test_split(
            eval_subset["Address"],
            test_size=relative_test_ratio,
            stratify=eval_subset["target"],
            random_state=random_state,
        )

        train_idx = entity_keys.isin(train_entities)
        val_idx = entity_keys.isin(val_entities)
        test_idx = entity_keys.isin(test_entities)

        X_train, y_train = X[train_idx].copy(), y[train_idx].copy()
        X_val, y_val = X[val_idx].copy(), y[val_idx].copy()
        X_test, y_test = X[test_idx].copy(), y[test_idx].copy()
    else:
        # Standard stratified split
        X_train, X_eval, y_train, y_eval = train_test_split(
            X, y, test_size=total_eval_size, stratify=y, random_state=random_state
        )

        X_val, X_test, y_val, y_test = train_test_split(
            X_eval, y_eval, test_size=relative_test_ratio, stratify=y_eval, random_state=random_state
        )

    logger.info(
        f"Data split completed -> Train: {X_train.shape[0]} ({y_train.mean():.1%} fraud), "
        f"Val: {X_val.shape[0]} ({y_val.mean():.1%} fraud), "
        f"Test: {X_test.shape[0]} ({y_test.mean():.1%} fraud)"
    )

    return X_train, X_val, X_test, y_train, y_val, y_test


def build_preprocessor_pipeline(
    variance_threshold: float = 0.0,
) -> Pipeline:
    """
    Constructs an isolated, leak-free scikit-learn preprocessing pipeline.
    Steps:
      1. SimpleImputer (median): handles missing values
      2. VarianceThreshold: removes constant and zero-variance features
      3. RobustScaler: scales skewed financial features with robust IQR statistics
    """
    return Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("variance_filter", VarianceThreshold(threshold=variance_threshold)),
            ("scaler", RobustScaler(with_centering=True, with_scaling=True)),
        ]
    )
