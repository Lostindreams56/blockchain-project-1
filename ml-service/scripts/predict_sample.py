"""
Local Offline Sample Prediction Utility
Loads serialized model artifact and predicts fraud risk on a sample wallet record without exposing an API.

Usage:
    python scripts/predict_sample.py --sample-index 0
"""

import argparse
import json
import logging
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pandas as pd
import numpy as np
import joblib

logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def determine_risk_tier(prob: float, opt_thresh: float) -> str:
    if prob >= max(0.80, opt_thresh + 0.20):
        return "CRITICAL RISK"
    elif prob >= opt_thresh:
        return "HIGH RISK"
    elif prob >= max(0.20, opt_thresh - 0.25):
        return "MEDIUM RISK"
    else:
        return "LOW RISK"


def predict_sample_record(
    model_path: Path,
    metadata_path: Path,
    data_path: Path,
    sample_index: int = 0,
) -> dict:
    if not model_path.exists():
        raise FileNotFoundError(f"Model artifact not found at {model_path}")
    if not metadata_path.exists():
        raise FileNotFoundError(f"Metadata file not found at {metadata_path}")
    if not data_path.exists():
        raise FileNotFoundError(f"Sample data not found at {data_path}")

    pipeline = joblib.load(model_path)
    with open(metadata_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    df = pd.read_csv(data_path)
    if sample_index < 0 or sample_index >= len(df):
        raise IndexError(f"sample_index {sample_index} out of range for dataset of {len(df)} rows.")

    target_col = meta["dataset_info"]["target_column"]
    feature_names = meta["feature_schema"]["feature_names"]
    opt_threshold = meta["evaluation_metrics"]["optimal_threshold"]

    sample_row = df.iloc[[sample_index]]
    actual_label = int(sample_row[target_col].iloc[0]) if target_col in sample_row.columns else None

    X_sample = sample_row[feature_names]
    prob = float(pipeline.predict_proba(X_sample)[0, 1])
    is_fraud_predicted = prob >= opt_threshold
    risk_tier = determine_risk_tier(prob, opt_threshold)

    print("\n" + "=" * 60)
    print("OFFLINE SAMPLE PREDICTION")
    print("=" * 60)
    print(f"Sample Row:          Index #{sample_index}")
    if actual_label is not None:
        actual_str = "Fraudulent (1)" if actual_label == 1 else "Legitimate (0)"
        print(f"Actual Ground Truth: {actual_str}")
    print(f"Predicted Risk Score:{prob:.4f} ({prob*100:.2f}%)")
    print(f"Calibrated Threshold:{opt_threshold:.2f}")
    print(f"Classification:      {'ILLICIT / FRAUD' if is_fraud_predicted else 'LEGITIMATE'}")
    print(f"Risk Tier:           {risk_tier}")
    print("=" * 60 + "\n")

    return {
        "sample_index": sample_index,
        "actual_label": actual_label,
        "risk_probability": round(prob, 4),
        "threshold": opt_threshold,
        "is_fraud": bool(is_fraud_predicted),
        "risk_tier": risk_tier,
    }


def main():
    parser = argparse.ArgumentParser(description="Run local prediction on a sample record.")
    parser.add_argument("--model", type=str, default="artifacts/ethereum_fraud_model_v1.joblib")
    parser.add_argument("--metadata", type=str, default="artifacts/model_metadata.json")
    parser.add_argument("--data", type=str, default="data/processed/test.csv")
    parser.add_argument("--sample-index", type=int, default=0)

    args = parser.parse_args()

    model_path = Path(args.model)
    if not model_path.is_absolute():
        if not model_path.exists() and (Path("ml-service") / model_path).exists():
            model_path = Path("ml-service") / model_path

    metadata_path = Path(args.metadata)
    if not metadata_path.is_absolute():
        if not metadata_path.exists() and (Path("ml-service") / metadata_path).exists():
            metadata_path = Path("ml-service") / metadata_path

    data_path = Path(args.data)
    if not data_path.is_absolute():
        if not data_path.exists() and (Path("ml-service") / data_path).exists():
            data_path = Path("ml-service") / data_path

    predict_sample_record(model_path, metadata_path, data_path, sample_index=args.sample_index)


if __name__ == "__main__":
    main()
