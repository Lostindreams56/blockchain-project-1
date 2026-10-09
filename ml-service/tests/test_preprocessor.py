"""
Unit tests for data preprocessing and leakage-free splitting.
"""

import pytest
import pandas as pd
import numpy as np

from src.preprocessor import (
    prepare_features_and_target,
    split_data_leakage_free,
    build_preprocessor_pipeline,
)


@pytest.fixture
def synthetic_raw_df():
    # 50 rows synthetic dataset with intentional duplicate, inf values, and address column
    np.random.seed(42)
    n = 60
    addresses = [f"0x{i:040x}" for i in range(50)] + [f"0x{i:040x}" for i in range(10)]  # 10 repeat addresses

    df = pd.DataFrame({
        "Address": addresses,
        "Index": list(range(n)),
        "FLAG": np.random.choice([0, 1], size=n, p=[0.75, 0.25]),
        "feature_num1": np.random.exponential(scale=10, size=n),
        "feature_num2": np.random.normal(loc=5, scale=2, size=n),
        "ERC20 most sent token type": np.random.choice(["BAT", "USDT", "None"], size=n),
    })

    # Add infinite value and missing value
    df.loc[0, "feature_num1"] = np.inf
    df.loc[1, "feature_num2"] = -np.inf
    df.loc[2, "feature_num1"] = np.nan

    # Add exact duplicate row
    df = pd.concat([df, df.iloc[[5]]], ignore_index=True)
    return df


def test_prepare_features_and_target_removes_duplicates_and_leakage(synthetic_raw_df):
    initial_rows = len(synthetic_raw_df)
    X, y, entity_keys, feature_cols = prepare_features_and_target(
        synthetic_raw_df, target_col="FLAG"
    )

    # Exact duplicate was dropped
    assert len(X) == initial_rows - 1

    # Leakage and identifier columns are excluded from features
    assert "Address" not in feature_cols
    assert "Index" not in feature_cols
    assert "FLAG" not in feature_cols
    assert "ERC20 most sent token type" not in feature_cols
    assert "feature_num1" in feature_cols
    assert "feature_num2" in feature_cols

    # Infinite values converted to NaN for safe imputation
    assert not np.isinf(X["feature_num1"]).any()
    assert not np.isinf(X["feature_num2"]).any()


def test_split_data_leakage_free_prevents_address_leakage(synthetic_raw_df):
    X, y, entity_keys, _ = prepare_features_and_target(synthetic_raw_df, target_col="FLAG")

    X_train, X_val, X_test, y_train, y_val, y_test = split_data_leakage_free(
        X, y, entity_keys=entity_keys, val_size=0.2, test_size=0.2, random_state=42
    )

    # Check total lengths
    assert len(X_train) + len(X_val) + len(X_test) == len(X)

    # Verify zero entity/address overlap between train and test partitions
    train_entities = set(entity_keys.loc[X_train.index])
    test_entities = set(entity_keys.loc[X_test.index])
    val_entities = set(entity_keys.loc[X_val.index])

    assert len(train_entities.intersection(test_entities)) == 0
    assert len(train_entities.intersection(val_entities)) == 0
    assert len(val_entities.intersection(test_entities)) == 0


def test_preprocessor_pipeline_fit_isolation():
    # Verify that pipeline learns statistics ONLY on train set without leaking test set stats
    pipeline = build_preprocessor_pipeline()

    # Train data with median = 100
    X_train = pd.DataFrame({
        "feat1": [100.0, 100.0, np.nan],
        "feat2": [10.0, 20.0, 30.0],
    })

    # Test data with different values
    X_test = pd.DataFrame({
        "feat1": [np.nan],
        "feat2": [25.0],
    })

    pipeline.fit(X_train)
    imputer = pipeline.named_steps["imputer"]

    # Imputer statistics must equal training median (100.0)
    assert imputer.statistics_[0] == 100.0

    X_test_transformed = pipeline.transform(X_test)
    assert not np.isnan(X_test_transformed).any()
