"""
Dataset Inspection & Validation Script
Analyzes dataset schema, class imbalance, missingness, duplicates, constant features,
and data leakage risks. Writes inspection reports to reports/.

Usage:
    python scripts/inspect_dataset.py --input data/raw/transaction_dataset.csv --target FLAG
"""

import argparse
import json
import logging
from pathlib import Path
import sys

# Ensure src package is in path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pandas as pd
import numpy as np

from src.data_loader import (
    load_raw_dataset,
    validate_target_column,
    detect_candidate_targets,
    detect_leakage_identifiers,
)

logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def inspect_dataset(file_path: Path, target_col: str | None = None, output_dir: Path | None = None) -> dict:
    df = load_raw_dataset(file_path)

    n_rows, n_cols = df.shape
    file_size_mb = file_path.stat().st_size / (1024 * 1024)

    # 1. Missing values
    missing_series = df.isna().sum()
    cols_with_missing = {col: int(cnt) for col, cnt in missing_series.items() if cnt > 0}
    total_missing_cells = int(missing_series.sum())

    # 2. Duplicate rows
    exact_duplicates = int(df.duplicated().sum())
    # Duplicates excluding identifiers if address exists
    id_cols = detect_leakage_identifiers(df)
    feature_only_cols = [c for c in df.columns if c not in id_cols]
    feature_duplicates = int(df.duplicated(subset=feature_only_cols).sum()) if feature_only_cols else 0

    # 3. Constant and near-constant columns
    constant_cols = [col for col in df.columns if df[col].nunique() <= 1]
    quasi_constant_cols = [
        col for col in df.columns
        if df[col].nunique() > 1 and (df[col].value_counts(normalize=True).iloc[0] > 0.999)
    ]

    # 4. Target analysis
    candidate_targets = detect_candidate_targets(df)
    target_info = None

    if target_col is None:
        if len(candidate_targets) == 1:
            target_col = candidate_targets[0]
            logger.info(f"Target column not explicitly specified; detected candidate '{target_col}'.")
        else:
            logger.warning(
                f"Target column not specified. Candidate columns: {candidate_targets}. "
                "Specify with --target <col_name>."
            )

    if target_col:
        try:
            target_info = validate_target_column(df, target_col)
        except Exception as e:
            target_info = {"target_col": target_col, "error": str(e)}

    # 5. Data Types summary
    dtypes_summary = {str(dtype): int(count) for dtype, count in df.dtypes.value_counts().items()}
    columns_metadata = []
    for col in df.columns:
        col_type = str(df[col].dtype)
        nunique = int(df[col].nunique())
        n_null = int(df[col].isna().sum())
        columns_metadata.append({
            "name": col,
            "dtype": col_type,
            "unique_count": nunique,
            "null_count": n_null,
            "null_percentage": round(n_null / n_rows * 100, 2),
            "is_constant": col in constant_cols,
            "is_leakage_risk": col in id_cols,
        })

    # 6. Basic numeric summary
    numeric_df = df.select_dtypes(include=[np.number])
    numeric_stats = {}
    if not numeric_df.empty:
        desc = numeric_df.describe().to_dict()
        for col_name, stats in desc.items():
            numeric_stats[col_name] = {k: round(v, 4) if isinstance(v, (int, float)) and not np.isnan(v) else v for k, v in stats.items()}

    # Assemble complete inspection report
    report = {
        "dataset_metadata": {
            "file_name": file_path.name,
            "file_format": file_path.suffix,
            "file_size_mb": round(file_size_mb, 2),
            "total_rows": n_rows,
            "total_columns": n_cols,
            "data_types_breakdown": dtypes_summary,
        },
        "quality_and_integrity": {
            "exact_duplicate_rows": exact_duplicates,
            "feature_duplicate_rows": feature_duplicates,
            "columns_with_missing_values": cols_with_missing,
            "total_missing_cells": total_missing_cells,
            "constant_columns": constant_cols,
            "quasi_constant_columns": quasi_constant_cols,
            "potential_leakage_identifiers": id_cols,
        },
        "target_analysis": target_info,
        "candidate_targets_detected": candidate_targets,
        "columns_detail": columns_metadata,
        "numeric_summary": numeric_stats,
    }

    # Save reports
    if output_dir:
        output_dir.mkdir(parents=True, exist_ok=True)
        json_path = output_dir / "dataset_inspection_report.json"
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)
        logger.info(f"Structured inspection JSON written to: {json_path}")

        # Human-readable Markdown report
        md_path = output_dir / "dataset_inspection_report.md"
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(generate_markdown_summary(report))
        logger.info(f"Markdown inspection report written to: {md_path}")

    return report


def generate_markdown_summary(report: dict) -> str:
    meta = report["dataset_metadata"]
    quality = report["quality_and_integrity"]
    target = report.get("target_analysis") or {}

    md = [
        "# Dataset Inspection & Validation Report\n",
        f"**File Name**: `{meta['file_name']}` | **Size**: `{meta['file_size_mb']} MB` | **Dimensions**: `{meta['total_rows']}` rows × `{meta['total_columns']}` columns\n",
        "## 1. Executive Quality Summary\n",
        f"- **Exact Duplicate Rows**: {quality['exact_duplicate_rows']}",
        f"- **Feature Duplicate Rows**: {quality['feature_duplicate_rows']}",
        f"- **Columns with Missing Values**: {len(quality['columns_with_missing_values'])}",
        f"- **Constant Columns (Zero Variance)**: {quality['constant_columns'] if quality['constant_columns'] else 'None'}",
        f"- **Quasi-Constant Columns (>99.9% single value)**: {quality['quasi_constant_columns'] if quality['quasi_constant_columns'] else 'None'}",
        f"- **Leakage Identifiers Detected**: `{quality['potential_leakage_identifiers']}`\n",
        "## 2. Target Variable Verification\n",
    ]

    if "target_col" in target and "class_counts" in target:
        counts = target["class_counts"]
        total = sum(counts.values())
        md.append(f"- **Configured Target Column**: `{target['target_col']}`")
        for cls, count in counts.items():
            pct = round(count / total * 100, 2)
            label_desc = "Fraud / Illicit" if cls in (1, "1", True) else "Legitimate"
            md.append(f"  - Class `{cls}` ({label_desc}): **{count:,}** samples ({pct}%)")
        ratio = round(max(counts.values()) / min(counts.values()), 2)
        md.append(f"- **Class Imbalance Ratio**: ~{ratio}:1\n")
    else:
        md.append("- Target column not verified or contained errors.\n")

    md.append("## 3. Columns Detail\n")
    md.append("| Column Name | Type | Unique Count | Missing Count | Missing % | Leakage Risk |")
    md.append("| :--- | :--- | :--- | :--- | :--- | :--- |")
    for c in report["columns_detail"][:30]:  # Top 30 for summary
        leakage = "⚠️ YES" if c["is_leakage_risk"] else "No"
        md.append(f"| `{c['name']}` | {c['dtype']} | {c['unique_count']} | {c['null_count']} | {c['null_percentage']}% | {leakage} |")

    if len(report["columns_detail"]) > 30:
        md.append(f"\n*...and {len(report['columns_detail']) - 30} additional columns documented in JSON report.*")

    return "\n".join(md)


def main():
    parser = argparse.ArgumentParser(description="Inspect and validate Ethereum fraud detection dataset.")
    parser.add_argument(
        "--input",
        type=str,
        default="data/raw/transaction_dataset.csv",
        help="Path to input dataset CSV (relative to ml-service or workspace root)",
    )
    parser.add_argument(
        "--target",
        type=str,
        default="FLAG",
        help="Target classification column name (default: FLAG)",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="reports",
        help="Directory to save inspection reports (default: reports)",
    )

    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.is_absolute():
        # Check relative to cwd or ml-service
        if not input_path.exists() and (Path("ml-service") / input_path).exists():
            input_path = Path("ml-service") / input_path

    out_dir = Path(args.output_dir)
    if not out_dir.is_absolute() and not out_dir.exists() and (Path("ml-service") / out_dir).parent.exists():
        out_dir = Path("ml-service") / out_dir

    logger.info(f"Inspecting dataset at: {input_path}")
    report = inspect_dataset(input_path, target_col=args.target, output_dir=out_dir)

    meta = report["dataset_metadata"]
    quality = report["quality_and_integrity"]
    target = report.get("target_analysis") or {}

    print("\n" + "=" * 60)
    print("DATASET INSPECTION SUMMARY")
    print("=" * 60)
    print(f"File:         {meta['file_name']} ({meta['file_size_mb']} MB)")
    print(f"Shape:        {meta['total_rows']} rows × {meta['total_columns']} columns")
    print(f"Duplicates:   {quality['exact_duplicate_rows']} exact, {quality['feature_duplicate_rows']} feature duplicates")
    print(f"Missing Data: {len(quality['columns_with_missing_values'])} columns have missing cells")
    print(f"Constant:     {len(quality['constant_columns'])} constant columns (zero variance)")
    print(f"Leakage Risk: {quality['potential_leakage_identifiers']}")
    if "class_counts" in target:
        print(f"Target:       '{target['target_col']}' -> {target['class_counts']}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
