"""
Model Evaluation CLI Script
Loads a serialized model artifact and evaluates performance on a specified test/benchmark dataset.

Usage:
    python scripts/evaluate.py --model artifacts/ethereum_fraud_model_v1.joblib --data data/processed/test.csv --target FLAG
"""

import argparse
import json
import logging
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pandas as pd
import joblib
from sklearn.metrics import classification_report, confusion_matrix, average_precision_score, roc_auc_score

logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def evaluate_artifact(
    model_path: Path,
    data_path: Path,
    target_col: str = "FLAG",
    threshold: float = 0.5,
) -> dict:
    if not model_path.exists():
        raise FileNotFoundError(f"Model artifact not found at {model_path}")
    if not data_path.exists():
        raise FileNotFoundError(f"Evaluation data not found at {data_path}")

    logger.info(f"Loading model pipeline from: {model_path.resolve()}")
    pipeline = joblib.load(model_path)

    logger.info(f"Loading evaluation dataset from: {data_path.resolve()}")
    df = pd.read_csv(data_path)

    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found in dataset.")

    y_true = df[target_col]
    X = df.drop(columns=[target_col])

    # Predict probabilities
    y_prob = pipeline.predict_proba(X)[:, 1]
    y_pred = (y_prob >= threshold).astype(int)

    pr_auc = float(average_precision_score(y_true, y_prob))
    roc_auc = float(roc_auc_score(y_true, y_prob))
    cm = confusion_matrix(y_true, y_pred)
    report = classification_report(y_true, y_pred, output_dict=True, zero_division=0)

    print("\n" + "=" * 60)
    print(f"EVALUATION RESULTS (Threshold = {threshold:.2f})")
    print("=" * 60)
    print(f"Dataset:       {data_path.name} ({len(df):,} samples)")
    print(f"PR-AUC:        {pr_auc:.4f}")
    print(f"ROC-AUC:       {roc_auc:.4f}")
    print("\nConfusion Matrix:")
    print(f"  TN: {cm[0, 0]:<6} | FP: {cm[0, 1]:<6}")
    print(f"  FN: {cm[1, 0]:<6} | TP: {cm[1, 1]:<6}")
    print("\nClassification Report:")
    print(classification_report(y_true, y_pred, digits=4, zero_division=0))
    print("=" * 60 + "\n")

    return {
        "pr_auc": pr_auc,
        "roc_auc": roc_auc,
        "confusion_matrix": cm.tolist(),
        "classification_report": report,
    }


def main():
    parser = argparse.ArgumentParser(description="Evaluate serialized Ethereum fraud detection model.")
    parser.add_argument("--model", type=str, default="artifacts/ethereum_fraud_model_v1.joblib")
    parser.add_argument("--data", type=str, default="data/processed/test.csv")
    parser.add_argument("--target", type=str, default="FLAG")
    parser.add_argument("--threshold", type=float, default=0.5)

    args = parser.parse_args()

    model_path = Path(args.model)
    if not model_path.is_absolute():
        if not model_path.exists() and (Path("ml-service") / model_path).exists():
            model_path = Path("ml-service") / model_path

    data_path = Path(args.data)
    if not data_path.is_absolute():
        if not data_path.exists() and (Path("ml-service") / data_path).exists():
            data_path = Path("ml-service") / data_path

    evaluate_artifact(model_path, data_path, target_col=args.target, threshold=args.threshold)


if __name__ == "__main__":
    main()
