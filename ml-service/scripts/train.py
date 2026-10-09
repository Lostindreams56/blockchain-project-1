"""
Model Training & Artifact Serialization Pipeline
Trains candidate models, tunes probability threshold on validation set,
evaluates winning pipeline on held-out test set, computes SHAP explainability,
and saves production joblib artifacts and metadata.

Usage:
    python scripts/train.py --data-dir data/processed --artifacts-dir artifacts --reports-dir reports
"""

import argparse
import hashlib
import json
import logging
import platform
from datetime import datetime, timezone
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pandas as pd
import numpy as np
import joblib
import sklearn
import xgboost
import shap

from src.model_trainer import (
    train_and_compare_models,
    evaluate_predictions,
)
from src.explainer import explain_model_predictions

logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def compute_file_sha256(path: Path) -> str | None:
    if not path.exists():
        return None
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()


def run_training_pipeline(
    data_dir: Path,
    artifacts_dir: Path,
    reports_dir: Path,
    target_col: str = "FLAG",
    random_state: int = 42,
) -> dict:
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    reports_dir.mkdir(parents=True, exist_ok=True)

    # 1. Load partitioned datasets
    train_path = data_dir / "train.csv"
    val_path = data_dir / "val.csv"
    test_path = data_dir / "test.csv"
    features_path = data_dir / "feature_names.json"

    if not (train_path.exists() and val_path.exists() and test_path.exists()):
        raise FileNotFoundError(
            f"Preprocessed partition files missing in {data_dir}. Run scripts/preprocess_data.py first."
        )

    logger.info("Loading preprocessed partitions...")
    train_df = pd.read_csv(train_path)
    val_df = pd.read_csv(val_path)
    test_df = pd.read_csv(test_path)

    with open(features_path, "r", encoding="utf-8") as f:
        feature_names = json.load(f)

    X_train = train_df[feature_names]
    y_train = train_df[target_col]

    X_val = val_df[feature_names]
    y_val = val_df[target_col]

    X_test = test_df[feature_names]
    y_test = test_df[target_col]

    # Calculate scale_pos_weight based on training set class ratio
    neg_count = int((y_train == 0).sum())
    pos_count = int((y_train == 1).sum())
    imbalance_ratio = round(neg_count / max(pos_count, 1), 3)

    logger.info(
        f"Training set: {len(X_train)} samples ({pos_count} fraud, {neg_count} legit, ratio={imbalance_ratio}:1)"
    )

    # 2. Train and compare models on Validation data
    comparison = train_and_compare_models(
        X_train=X_train,
        y_train=y_train,
        X_val=X_val,
        y_val=y_val,
        scale_pos_weight=imbalance_ratio,
        random_state=random_state,
    )

    best_model_name = comparison["best_model_name"]
    best_pipeline = comparison["best_pipeline"]
    opt_threshold = comparison["comparison_results"][best_model_name]["optimal_threshold"]

    # 3. Held-out Test Set Evaluation (Evaluated ONCE on unseen test partition)
    logger.info(f"Evaluating selected model ({best_model_name}) on unseen held-out TEST partition...")
    test_probs = best_pipeline.predict_proba(X_test)[:, 1]
    test_metrics_default = evaluate_predictions(y_test, test_probs, threshold=0.5)
    test_metrics_optimal = evaluate_predictions(y_test, test_probs, threshold=opt_threshold)

    logger.info(
        f"[FINAL TEST RESULTS - {best_model_name} (thresh={opt_threshold:.2f})]\n"
        f"  Precision: {test_metrics_optimal['precision']:.4f}\n"
        f"  Recall:    {test_metrics_optimal['recall']:.4f}\n"
        f"  F1-Score:  {test_metrics_optimal['f1']:.4f}\n"
        f"  PR-AUC:    {test_metrics_optimal['pr_auc']:.4f}\n"
        f"  ROC-AUC:   {test_metrics_optimal['roc_auc']:.4f}"
    )

    # 4. Generate SHAP Model Explanations
    logger.info("Computing SHAP model explainability artifacts...")
    shap_sample = X_val.head(500)
    shap_results = explain_model_predictions(
        pipeline=best_pipeline,
        X_sample=shap_sample,
        feature_names=feature_names,
        output_dir=reports_dir,
    )

    # 5. Serialize Artifacts
    model_artifact_path = artifacts_dir / "ethereum_fraud_model_v1.joblib"
    joblib.dump(best_pipeline, model_artifact_path, compress=3)
    logger.info(f"Serialized winning pipeline to: {model_artifact_path}")

    # Raw dataset checksum if raw file exists
    raw_path = data_dir.parent / "raw" / "transaction_dataset.csv"
    raw_checksum = compute_file_sha256(raw_path) if raw_path.exists() else None

    metadata = {
        "model_version": "1.0.0",
        "selected_algorithm": best_model_name,
        "artifact_filename": str(model_artifact_path.name),
        "training_timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "dataset_info": {
            "source": "Kaggle (vagifa/ethereum-frauddetection-dataset)",
            "license": "CC0: Public Domain / Research Use",
            "raw_sha256": raw_checksum,
            "train_samples": len(X_train),
            "val_samples": len(X_val),
            "test_samples": len(X_test),
            "target_column": target_col,
            "positive_class": "1 (Fraudulent / Illicit Account)",
            "negative_class": "0 (Legitimate Account)",
        },
        "preprocessing_pipeline": [
            "SimpleImputer(strategy='median')",
            "VarianceThreshold(threshold=0.0)",
            "RobustScaler()",
        ],
        "feature_schema": {
            "feature_count": len(feature_names),
            "feature_names": feature_names,
        },
        "evaluation_metrics": {
            "optimal_threshold": opt_threshold,
            "test_set_optimal": test_metrics_optimal,
            "test_set_default_0_5": test_metrics_default,
            "validation_results_all_models": comparison["comparison_results"],
        },
        "explainability_summary": {
            "top_risk_features": shap_results["top_features"][:10],
            "disclaimer": shap_results["disclaimer"],
        },
        "environment_and_reproducibility": {
            "random_seed": random_state,
            "python_version": platform.python_version(),
            "os": platform.platform(),
            "library_versions": {
                "scikit_learn": sklearn.__version__,
                "xgboost": xgboost.__version__,
                "shap": shap.__version__,
                "pandas": pd.__version__,
                "numpy": np.__version__,
                "joblib": joblib.__version__,
            },
        },
    }

    metadata_path = artifacts_dir / "model_metadata.json"
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    logger.info(f"Model metadata written to: {metadata_path}")

    # 6. Generate Markdown Evaluation Report
    md_report_path = reports_dir / "model_evaluation_report.md"
    with open(md_report_path, "w", encoding="utf-8") as f:
        f.write(generate_evaluation_markdown(metadata))
    logger.info(f"Markdown evaluation report written to: {md_report_path}")

    return metadata


def generate_evaluation_markdown(meta: dict) -> str:
    m = meta["evaluation_metrics"]
    test_opt = m["test_set_optimal"]
    cm = test_opt["confusion_matrix"]
    val_res = m["validation_results_all_models"]

    md = [
        "# Model Evaluation & Benchmark Report\n",
        f"**Selected Model Architecture**: `{meta['selected_algorithm']}` (Version `{meta['model_version']}`)\n",
        f"**Evaluation Timestamp**: `{meta['training_timestamp_utc']}`\n",
        "## 1. Candidate Models Comparison (Validation Set)\n",
        "| Candidate Model | Val PR-AUC | Val Recall | Val F1-Score | Optimal Threshold | Training Time |",
        "| :--- | :--- | :--- | :--- | :--- | :--- |",
    ]

    for name, r in val_res.items():
        opt = r["val_metrics_optimal_threshold"]
        md.append(
            f"| **{name}** | {opt['pr_auc']:.4f} | {opt['recall']:.4f} | {opt['f1']:.4f} | {r['optimal_threshold']:.2f} | {r['training_time_seconds']}s |"
        )

    md.extend([
        "\n## 2. Final Held-Out Test Set Performance\n",
        f"Evaluated once on unseen test partition (`{meta['dataset_info']['test_samples']}` samples) at decision threshold **`{m['optimal_threshold']:.2f}`**:\n",
        f"- **Precision (Fraud)**: **`{test_opt['precision']:.4f}`** (Out of all flagged accounts, {test_opt['precision']:.1%} are truly fraudulent)",
        f"- **Recall (Fraud)**: **`{test_opt['recall']:.4f}`** (Successfully detects {test_opt['recall']:.1%} of all illicit accounts)",
        f"- **F1-Score**: **`{test_opt['f1']:.4f}`**",
        f"- **PR-AUC (Average Precision)**: **`{test_opt['pr_auc']:.4f}`**",
        f"- **ROC-AUC**: **`{test_opt['roc_auc']:.4f}`**\n",
        "### Confusion Matrix (Test Set)\n",
        "| | Predicted Legitimate | Predicted Fraud |",
        "| :--- | :--- | :--- |",
        f"| **Actual Legitimate (0)** | True Negatives: **{cm['tn']:,}** | False Positives: **{cm['fp']:,}** |",
        f"| **Actual Fraud (1)** | False Negatives: **{cm['fn']:,}** | True Positives: **{cm['tp']:,}** |\n",
        "## 3. Top SHAP Risk Attribution Factors\n",
    ])

    for item in meta["explainability_summary"]["top_risk_features"][:8]:
        score = item.get("mean_abs_shap") or item.get("importance", 0.0)
        md.append(f"- **`{item['feature']}`**: Mean |SHAP| = `{score:.5f}`")

    md.extend([
        "\n> **Interpretability Note**:",
        f"> {meta['explainability_summary']['disclaimer']}\n",
    ])

    return "\n".join(md)


def main():
    parser = argparse.ArgumentParser(description="Train and evaluate Ethereum fraud detection models.")
    parser.add_argument("--data-dir", type=str, default="data/processed")
    parser.add_argument("--artifacts-dir", type=str, default="artifacts")
    parser.add_argument("--reports-dir", type=str, default="reports")
    parser.add_argument("--target", type=str, default="FLAG")
    parser.add_argument("--seed", type=int, default=42)

    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    if not data_dir.is_absolute():
        if not data_dir.exists() and (Path("ml-service") / data_dir).exists():
            data_dir = Path("ml-service") / data_dir

    art_dir = Path(args.artifacts_dir)
    if not art_dir.is_absolute() and not art_dir.exists() and (Path("ml-service") / art_dir).parent.exists():
        art_dir = Path("ml-service") / art_dir

    rep_dir = Path(args.reports_dir)
    if not rep_dir.is_absolute() and not rep_dir.exists() and (Path("ml-service") / rep_dir).parent.exists():
        rep_dir = Path("ml-service") / rep_dir

    meta = run_training_pipeline(
        data_dir=data_dir,
        artifacts_dir=art_dir,
        reports_dir=rep_dir,
        target_col=args.target,
        random_state=args.seed,
    )

    print("\n" + "=" * 60)
    print("TRAINING PIPELINE COMPLETE")
    print("=" * 60)
    print(f"Winner:    {meta['selected_algorithm']}")
    print(f"Artifact:  {meta['artifact_filename']}")
    opt = meta["evaluation_metrics"]["test_set_optimal"]
    print(f"Test PR-AUC: {opt['pr_auc']:.4f} | Recall: {opt['recall']:.4f} | F1: {opt['f1']:.4f}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
