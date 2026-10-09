"""
Model Training & Comparison Engine
Trains candidate classifiers inside leakage-proof pipelines, computes fraud-specific metrics
(PR-AUC, Recall, F1), tunes decision thresholds on validation data, and evaluates on held-out test data.
"""

import time
import logging
from typing import Dict, Any, Tuple, List
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    average_precision_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
)

from src.preprocessor import build_preprocessor_pipeline

logger = logging.getLogger(__name__)


def get_candidate_models(scale_pos_weight: float = 3.52, random_state: int = 42) -> Dict[str, Any]:
    """
    Returns candidate models configured with fixed seeds and imbalance-aware weights.
    """
    return {
        "Baseline_Dummy": DummyClassifier(strategy="stratified", random_state=random_state),
        "Logistic_Regression": LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=random_state,
            solver="lbfgs",
        ),
        "Random_Forest": RandomForestClassifier(
            n_estimators=100,
            max_depth=12,
            min_samples_split=5,
            class_weight="balanced",
            random_state=random_state,
            n_jobs=-1,
        ),
        "XGBoost": XGBClassifier(
            n_estimators=150,
            max_depth=6,
            learning_rate=0.08,
            subsample=0.85,
            colsample_bytree=0.85,
            scale_pos_weight=scale_pos_weight,
            eval_metric="logloss",
            random_state=random_state,
            n_jobs=-1,
        ),
    }


def evaluate_predictions(
    y_true: pd.Series | np.ndarray,
    y_prob: np.ndarray,
    threshold: float = 0.5,
) -> Dict[str, Any]:
    """
    Calculates fraud-focused evaluation metrics for given probabilities and decision threshold.
    """
    y_pred = (y_prob >= threshold).astype(int)
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()

    return {
        "threshold": round(threshold, 4),
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 4),
        "f1": round(float(f1_score(y_true, y_pred, zero_division=0)), 4),
        "pr_auc": round(float(average_precision_score(y_true, y_prob)), 4),
        "roc_auc": round(float(roc_auc_score(y_true, y_prob)), 4),
        "confusion_matrix": {
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp),
        },
    }


def find_optimal_threshold(
    y_true: pd.Series | np.ndarray,
    y_prob: np.ndarray,
    min_precision: float = 0.70,
) -> Tuple[float, Dict[str, Any]]:
    """
    Finds optimal probability decision threshold on validation set
    to maximize F1 while maintaining acceptable precision.
    """
    best_thresh = 0.5
    best_f1 = -1.0
    best_metrics = {}

    for thresh in np.arange(0.10, 0.92, 0.02):
        metrics = evaluate_predictions(y_true, y_prob, threshold=thresh)
        # Prioritize F1 while ensuring precision meets floor
        if metrics["precision"] >= min_precision and metrics["f1"] > best_f1:
            best_f1 = metrics["f1"]
            best_thresh = thresh
            best_metrics = metrics

    if not best_metrics:
        # Fallback to standard 0.5
        best_metrics = evaluate_predictions(y_true, y_prob, threshold=0.5)
        best_thresh = 0.5

    return float(best_thresh), best_metrics


def train_and_compare_models(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_val: pd.DataFrame,
    y_val: pd.Series,
    scale_pos_weight: float = 3.52,
    random_state: int = 42,
) -> Dict[str, Any]:
    """
    Fits and evaluates all candidate models inside full sklearn Pipelines.
    Returns comparison summary and trained pipeline objects.
    """
    candidates = get_candidate_models(scale_pos_weight=scale_pos_weight, random_state=random_state)
    comparison_results = {}
    trained_pipelines = {}

    for model_name, classifier in candidates.items():
        logger.info(f"Training candidate model: {model_name}...")
        pipeline = Pipeline([
            ("preprocessor", build_preprocessor_pipeline()),
            ("classifier", classifier),
        ])

        start_time = time.time()
        pipeline.fit(X_train, y_train)
        train_time = round(time.time() - start_time, 3)

        # Validation evaluation at default threshold 0.5
        val_probs = pipeline.predict_proba(X_val)[:, 1]
        default_val_metrics = evaluate_predictions(y_val, val_probs, threshold=0.5)

        # Optimize threshold on validation data
        opt_threshold, opt_val_metrics = find_optimal_threshold(y_val, val_probs)

        trained_pipelines[model_name] = pipeline
        comparison_results[model_name] = {
            "model_name": model_name,
            "training_time_seconds": train_time,
            "val_metrics_default_threshold": default_val_metrics,
            "optimal_threshold": opt_threshold,
            "val_metrics_optimal_threshold": opt_val_metrics,
        }

        logger.info(
            f"[{model_name}] Val PR-AUC: {opt_val_metrics['pr_auc']:.4f} | "
            f"Val Recall: {opt_val_metrics['recall']:.4f} | "
            f"Val F1: {opt_val_metrics['f1']:.4f} (thresh={opt_threshold:.2f}, time={train_time}s)"
        )

    # Model selection based on validation PR-AUC and F1-Score
    best_model_name = max(
        comparison_results.keys(),
        key=lambda k: (
            comparison_results[k]["val_metrics_optimal_threshold"]["pr_auc"]
            + comparison_results[k]["val_metrics_optimal_threshold"]["f1"]
        ),
    )

    logger.info(f"Best selected model: {best_model_name}")

    return {
        "comparison_results": comparison_results,
        "best_model_name": best_model_name,
        "best_pipeline": trained_pipelines[best_model_name],
        "trained_pipelines": trained_pipelines,
    }
