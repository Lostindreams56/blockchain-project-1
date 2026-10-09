"""
Data Preprocessing CLI Script
Executes cleaning, leakage prevention, and stratified splitting. Saves processed partitions
and feature schema to data/processed/.

Usage:
    python scripts/preprocess_data.py --input data/raw/transaction_dataset.csv --target FLAG
"""

import argparse
import json
import logging
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pandas as pd

from src.data_loader import load_raw_dataset
from src.preprocessor import prepare_features_and_target, split_data_leakage_free

logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def preprocess_and_save(
    input_path: Path,
    target_col: str,
    output_dir: Path,
    reports_dir: Path | None = None,
    val_size: float = 0.15,
    test_size: float = 0.15,
    random_state: int = 42,
) -> dict:
    output_dir.mkdir(parents=True, exist_ok=True)

    df = load_raw_dataset(input_path)
    X, y, entity_keys, feature_names = prepare_features_and_target(df, target_col=target_col)

    X_train, X_val, X_test, y_train, y_val, y_test = split_data_leakage_free(
        X,
        y,
        entity_keys=entity_keys,
        val_size=val_size,
        test_size=test_size,
        random_state=random_state,
    )

    # Save partitioned datasets
    train_df = pd.concat([X_train, y_train], axis=1)
    val_df = pd.concat([X_val, y_val], axis=1)
    test_df = pd.concat([X_test, y_test], axis=1)

    train_path = output_dir / "train.csv"
    val_path = output_dir / "val.csv"
    test_path = output_dir / "test.csv"

    train_df.to_csv(train_path, index=False)
    val_df.to_csv(val_path, index=False)
    test_df.to_csv(test_path, index=False)

    # Save feature names schema
    schema_path = output_dir / "feature_names.json"
    with open(schema_path, "w", encoding="utf-8") as f:
        json.dump(feature_names, f, indent=2)

    summary = {
        "raw_input": str(input_path.name),
        "target_column": target_col,
        "total_features": len(feature_names),
        "feature_names": feature_names,
        "partitions": {
            "train": {
                "samples": len(train_df),
                "fraud_count": int((y_train == 1).sum()),
                "legitimate_count": int((y_train == 0).sum()),
                "fraud_rate": float(y_train.mean()),
                "file": str(train_path.name),
            },
            "val": {
                "samples": len(val_df),
                "fraud_count": int((y_val == 1).sum()),
                "legitimate_count": int((y_val == 0).sum()),
                "fraud_rate": float(y_val.mean()),
                "file": str(val_path.name),
            },
            "test": {
                "samples": len(test_df),
                "fraud_count": int((y_test == 1).sum()),
                "legitimate_count": int((y_test == 0).sum()),
                "fraud_rate": float(y_test.mean()),
                "file": str(test_path.name),
            },
        },
    }

    if reports_dir:
        reports_dir.mkdir(parents=True, exist_ok=True)
        report_path = reports_dir / "preprocessing_summary.json"
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2)
        logger.info(f"Preprocessing report written to {report_path}")

    logger.info(f"Partitions successfully written to {output_dir.resolve()}")
    return summary


def main():
    parser = argparse.ArgumentParser(description="Preprocess Ethereum fraud detection dataset.")
    parser.add_argument("--input", type=str, default="data/raw/transaction_dataset.csv")
    parser.add_argument("--target", type=str, default="FLAG")
    parser.add_argument("--output-dir", type=str, default="data/processed")
    parser.add_argument("--reports-dir", type=str, default="reports")
    parser.add_argument("--val-size", type=float, default=0.15)
    parser.add_argument("--test-size", type=float, default=0.15)
    parser.add_argument("--seed", type=int, default=42)

    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.is_absolute():
        if not input_path.exists() and (Path("ml-service") / input_path).exists():
            input_path = Path("ml-service") / input_path

    out_dir = Path(args.output_dir)
    if not out_dir.is_absolute() and not out_dir.exists() and (Path("ml-service") / out_dir).parent.exists():
        out_dir = Path("ml-service") / out_dir

    rep_dir = Path(args.reports_dir)
    if not rep_dir.is_absolute() and not rep_dir.exists() and (Path("ml-service") / rep_dir).parent.exists():
        rep_dir = Path("ml-service") / rep_dir

    summary = preprocess_and_save(
        input_path=input_path,
        target_col=args.target,
        output_dir=out_dir,
        reports_dir=rep_dir,
        val_size=args.val_size,
        test_size=args.test_size,
        random_state=args.seed,
    )

    print("\n" + "=" * 60)
    print("PREPROCESSING COMPLETED")
    print("=" * 60)
    print(f"Features:   {summary['total_features']} selected features")
    for name, part in summary["partitions"].items():
        print(f"{name.upper():<10} {part['samples']} samples | {part['fraud_count']} fraud ({part['fraud_rate']:.1%})")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
