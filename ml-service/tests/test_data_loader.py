"""
Unit tests for data loader and target column validation.
Uses synthetic temporary CSV fixtures without requiring external downloads.
"""

import tempfile
from pathlib import Path
import pytest
import pandas as pd
import numpy as np

from src.data_loader import (
    load_raw_dataset,
    validate_target_column,
    detect_candidate_targets,
    detect_leakage_identifiers,
)


@pytest.fixture
def sample_csv():
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
        f.write("Index ,Address ,FLAG, sent_tx , rec_tx \n")
        f.write("1,0x1111111111111111111111111111111111111111,0,10,20\n")
        f.write("2,0x2222222222222222222222222222222222222222,1,5,0\n")
        f.write("3,0x3333333333333333333333333333333333333333,0,12,15\n")
        temp_path = Path(f.name)
    yield temp_path
    if temp_path.exists():
        temp_path.unlink()


def test_load_raw_dataset_strips_column_whitespaces(sample_csv):
    df = load_raw_dataset(sample_csv)
    # Column names must be stripped of trailing spaces
    assert "Index" in df.columns
    assert "Address" in df.columns
    assert "FLAG" in df.columns
    assert "sent_tx" in df.columns
    assert "rec_tx" in df.columns
    assert len(df) == 3


def test_validate_target_column_success(sample_csv):
    df = load_raw_dataset(sample_csv)
    info = validate_target_column(df, "FLAG")
    assert info["target_col"] == "FLAG"
    assert info["is_binary"] is True
    assert info["class_counts"] == {0: 2, 1: 1}
    assert info["missing_count"] == 0


def test_validate_target_column_missing_fails():
    df = pd.DataFrame({"colA": [1, 2], "colB": [3, 4]})
    with pytest.raises(ValueError, match="not found in dataset columns"):
        validate_target_column(df, "NONEXISTENT")


def test_validate_target_column_single_class_fails():
    df = pd.DataFrame({"FLAG": [0, 0, 0], "value": [1, 2, 3]})
    with pytest.raises(ValueError, match="at least 2 distinct classes"):
        validate_target_column(df, "FLAG")


def test_detect_leakage_identifiers():
    df = pd.DataFrame({
        "Address": ["0x1", "0x2", "0x3"],
        "Index": [1, 2, 3],
        "FLAG": [0, 1, 0],
        "feature_1": [10.5, 20.1, 15.0],
    })
    leakage = detect_leakage_identifiers(df)
    assert "Address" in leakage
    assert "Index" in leakage
    assert "feature_1" not in leakage
    assert "FLAG" not in leakage
