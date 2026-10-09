"""
Unit tests for model training, threshold tuning, artifact serialization, and inference.
"""

import tempfile
from pathlib import Path
import pytest
import pandas as pd
import numpy as np
import joblib

from src.model_trainer import (
    train_and_compare_models,
    evaluate_predictions,
    find_optimal_threshold,
)
from src.preprocessor import build_preprocessor_pipeline


@pytest.fixture
def synthetic_train_val_data():
    np.random.seed(42)
    n_train = 120
    n_val = 40
    n_features = 8

    # Create synthetic dataset with slight separability
    X_train = pd.DataFrame(
        np.random.randn(n_train, n_features),
        columns=[f"feat_{i}" for i in range(n_features)],
    )
    # Fraud correlates positively with feat_0
    y_train = (X_train["feat_0"] > 0.6).astype(int)

    X_val = pd.DataFrame(
        np.random.randn(n_val, n_features),
        columns=[f"feat_{i}" for i in range(n_features)],
    )
    y_val = (X_val["feat_0"] > 0.6).astype(int)

    return X_train, y_train, X_val, y_val


def test_train_and_compare_models_executes_successfully(synthetic_train_val_data):
    X_train, y_train, X_val, y_val = synthetic_train_val_data

    results = train_and_compare_models(
        X_train=X_train,
        y_train=y_train,
        X_val=X_val,
        y_val=y_val,
        scale_pos_weight=2.0,
        random_state=42,
    )

    assert "comparison_results" in results
    assert "best_model_name" in results
    assert "best_pipeline" in results

    comparison = results["comparison_results"]
    assert "Baseline_Dummy" in comparison
    assert "Logistic_Regression" in comparison
    assert "Random_Forest" in comparison
    assert "XGBoost" in comparison

    for model_name, info in comparison.items():
        assert "training_time_seconds" in info
        metrics = info["val_metrics_optimal_threshold"]
        assert 0.0 <= metrics["precision"] <= 1.0
        assert 0.0 <= metrics["recall"] <= 1.0
        assert 0.0 <= metrics["pr_auc"] <= 1.0


def test_evaluate_predictions_metrics():
    y_true = np.array([0, 0, 1, 1])
    y_prob = np.array([0.1, 0.4, 0.8, 0.9])

    metrics = evaluate_predictions(y_true, y_prob, threshold=0.5)
    assert metrics["precision"] == 1.0
    assert metrics["recall"] == 1.0
    assert metrics["f1"] == 1.0
    assert metrics["confusion_matrix"]["tp"] == 2
    assert metrics["confusion_matrix"]["tn"] == 2
    assert metrics["confusion_matrix"]["fp"] == 0
    assert metrics["confusion_matrix"]["fn"] == 0


def test_find_optimal_threshold():
    y_true = np.array([0, 0, 0, 1, 1])
    y_prob = np.array([0.2, 0.3, 0.6, 0.7, 0.8])

    thresh, metrics = find_optimal_threshold(y_true, y_prob, min_precision=0.6)
    assert 0.1 <= thresh <= 0.9
    assert metrics["f1"] > 0


def test_artifact_serialization_and_inference(synthetic_train_val_data):
    X_train, y_train, X_val, y_val = synthetic_train_val_data

    results = train_and_compare_models(
        X_train=X_train,
        y_train=y_train,
        X_val=X_val,
        y_val=y_val,
        random_state=42,
    )
    pipeline = results["best_pipeline"]

    with tempfile.NamedTemporaryFile(suffix=".joblib", delete=False) as f:
        temp_path = Path(f.name)

    try:
        # Save pipeline
        joblib.dump(pipeline, temp_path)
        assert temp_path.exists() and temp_path.stat().st_size > 0

        # Reload pipeline
        loaded_pipeline = joblib.load(temp_path)

        # Predict on new unseen samples
        sample = X_val.iloc[:3]
        probs = loaded_pipeline.predict_proba(sample)

        # Output shape: (3, 2)
        assert probs.shape == (3, 2)
        # Probabilities sum to 1.0
        np.testing.assert_allclose(probs.sum(axis=1), np.ones(3), atol=1e-5)

        # Verify handling of unseen sample with missing values
        sample_with_nan = sample.copy()
        sample_with_nan.iloc[0, 0] = np.nan
        probs_nan = loaded_pipeline.predict_proba(sample_with_nan)
        assert not np.isnan(probs_nan).any()

    finally:
        if temp_path.exists():
            temp_path.unlink()
