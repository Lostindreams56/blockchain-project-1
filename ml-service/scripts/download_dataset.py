"""
Dataset Download Utility for Ethereum Fraud Detection Dataset (Kaggle / Vagifa Mirror)

Provides automated retrieval from verified research mirrors or via Kaggle CLI / manual instructions.
"""

import os
import sys
import urllib.request
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

PRIMARY_MIRROR_URL = (
    "https://raw.githubusercontent.com/pankaj-00/Ethereum-Fraud-Detection/main/transaction_dataset.csv"
)
SECONDARY_MIRROR_URL = (
    "https://raw.githubusercontent.com/Abhaykumar04/ETHEREUM_FRAUD_DETECTION/main/transaction_dataset.csv"
)

KAGGLE_DATASET_ID = "vagifa/ethereum-frauddetection-dataset"
EXPECTED_FILENAME = "transaction_dataset.csv"


def download_dataset(output_dir: Path) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    target_path = output_dir / EXPECTED_FILENAME

    if target_path.exists() and target_path.stat().st_size > 1000:
        logger.info(f"Dataset already present at {target_path} ({target_path.stat().st_size / (1024*1024):.2f} MB).")
        return target_path

    logger.info(f"Target dataset not found locally. Initiating download to {target_path}...")

    # Attempt download from verified research repository mirror
    for url in [PRIMARY_MIRROR_URL, SECONDARY_MIRROR_URL]:
        try:
            logger.info(f"Attempting download from mirror: {url}")
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30) as response, open(target_path, "wb") as out_file:
                chunk_size = 64 * 1024
                while True:
                    chunk = response.read(chunk_size)
                    if not chunk:
                        break
                    out_file.write(chunk)
            
            size_mb = target_path.stat().st_size / (1024 * 1024)
            logger.info(f"Download successful! Saved {target_path.name} ({size_mb:.2f} MB).")
            return target_path
        except Exception as e:
            logger.warning(f"Mirror download failed ({e}). Trying next method...")

    # If mirror fails, prompt Kaggle CLI or manual instructions
    logger.info("Attempting download via Kaggle CLI (if configured)...")
    try:
        import subprocess
        result = subprocess.run(
            ["kaggle", "datasets", "download", "-d", KAGGLE_DATASET_ID, "-p", str(output_dir), "--unzip"],
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode == 0 and target_path.exists():
            logger.info(f"Kaggle CLI download successful: {target_path}")
            return target_path
    except Exception:
        pass

    logger.error("Could not download automatically.")
    logger.error("MANUAL SETUP INSTRUCTIONS:")
    logger.error(f"1. Visit https://www.kaggle.com/datasets/{KAGGLE_DATASET_ID}")
    logger.error(f"2. Download transaction_dataset.csv")
    logger.error(f"3. Place the file at: {target_path.resolve()}")
    sys.exit(1)


if __name__ == "__main__":
    script_dir = Path(__file__).resolve().parent
    default_data_dir = script_dir.parent / "data" / "raw"
    download_dataset(default_data_dir)
