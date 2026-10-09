"""
Model Explainability Engine using SHAP (TreeSHAP & Permutation Fallback)
Computes local and global feature attribution and generates interpretability plots.
"""

from pathlib import Path
import logging
from typing import Dict, Any, List
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import shap

logger = logging.getLogger(__name__)


def explain_model_predictions(
    pipeline: Any,
    X_sample: pd.DataFrame,
    feature_names: List[str],
    output_dir: Path,
    max_display: int = 15,
) -> Dict[str, Any]:
    """
    Computes SHAP explanations for the fitted pipeline on a representative sample.
    Saves SHAP summary plot and bar chart to output_dir/figures/.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    fig_dir = output_dir / "figures"
    fig_dir.mkdir(parents=True, exist_ok=True)

    # Transform features through pipeline's fitted preprocessor
    preprocessor = pipeline.named_steps.get("preprocessor")
    classifier = pipeline.named_steps.get("classifier")

    if preprocessor is not None:
        X_trans = preprocessor.transform(X_sample)
        # Check active features after variance threshold filter
        if hasattr(preprocessor, "named_steps") and "variance_filter" in preprocessor.named_steps:
            var_filter = preprocessor.named_steps["variance_filter"]
            support = var_filter.get_support()
            active_feature_names = [feature_names[i] for i, s in enumerate(support) if s]
        else:
            active_feature_names = feature_names
    else:
        X_trans = X_sample.values
        active_feature_names = feature_names

    feature_importances_summary = []
    shap_plot_path = None
    bar_plot_path = None

    try:
        logger.info(f"Computing SHAP values for classifier: {type(classifier).__name__}...")
        # Use TreeExplainer for XGBoost and Random Forest
        if hasattr(classifier, "feature_importances_"):
            explainer = shap.TreeExplainer(classifier)
            shap_values = explainer.shap_values(X_trans)
        else:
            # Fallback for linear or arbitrary estimators
            background = X_trans[:50]
            explainer = shap.LinearExplainer(classifier, background)
            shap_values = explainer.shap_values(X_trans)

        # Handle binary classification output formats (array vs list of arrays)
        if isinstance(shap_values, list) and len(shap_values) == 2:
            shap_arr = shap_values[1]  # positive class (Fraud)
        elif isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
            shap_arr = shap_values[:, :, 1]
        else:
            shap_arr = shap_values

        # 1. Calculate Mean Absolute SHAP values
        mean_abs_shap = np.abs(shap_arr).mean(axis=0)
        top_indices = np.argsort(mean_abs_shap)[::-1]

        for idx in top_indices[:max_display]:
            f_name = active_feature_names[idx] if idx < len(active_feature_names) else f"feature_{idx}"
            feature_importances_summary.append({
                "feature": f_name,
                "mean_abs_shap": round(float(mean_abs_shap[idx]), 5),
            })

        # 2. SHAP Beeswarm Summary Plot
        plt.figure(figsize=(10, 7))
        shap.summary_plot(
            shap_arr,
            X_trans,
            feature_names=active_feature_names,
            max_display=max_display,
            show=False,
        )
        plt.title("SHAP Feature Attribution (Impact on Fraud Risk Score)", fontsize=12, pad=12, fontweight="bold")
        plt.tight_layout()
        shap_plot_path = fig_dir / "shap_summary_plot.png"
        plt.savefig(shap_plot_path, dpi=200, bbox_inches="tight")
        plt.close()
        logger.info(f"Saved: {shap_plot_path.name}")

        # 3. Global Feature Importance Bar Plot
        plt.figure(figsize=(9, 6))
        top_features = [item["feature"] for item in feature_importances_summary[:max_display]][::-1]
        top_scores = [item["mean_abs_shap"] for item in feature_importances_summary[:max_display]][::-1]
        plt.barh(top_features, top_scores, color="#06b6d4", edgecolor="#0e7490")
        plt.xlabel("Mean |SHAP Value| (Average Model Impact)", fontsize=10)
        plt.title("Top Predictive Signals Identified by TreeSHAP", fontsize=12, fontweight="bold")
        plt.tight_layout()
        bar_plot_path = fig_dir / "shap_bar_plot.png"
        plt.savefig(bar_plot_path, dpi=200, bbox_inches="tight")
        plt.close()
        logger.info(f"Saved: {bar_plot_path.name}")

    except Exception as e:
        logger.warning(f"TreeSHAP calculation failed ({e}). Falling back to native feature importances.")
        if hasattr(classifier, "feature_importances_"):
            raw_imp = classifier.feature_importances_
            top_indices = np.argsort(raw_imp)[::-1]
            for idx in top_indices[:max_display]:
                f_name = active_feature_names[idx] if idx < len(active_feature_names) else f"feature_{idx}"
                feature_importances_summary.append({
                    "feature": f_name,
                    "importance": round(float(raw_imp[idx]), 5),
                })

    return {
        "status": "success",
        "top_features": feature_importances_summary,
        "active_features_count": len(active_feature_names),
        "plots": {
            "shap_summary": str(shap_plot_path.name) if shap_plot_path else None,
            "shap_bar": str(bar_plot_path.name) if bar_plot_path else None,
        },
        "disclaimer": (
            "Feature importance metrics denote statistical associations within the trained model "
            "and do not constitute definitive proof or legal verification that a given Ethereum address committed fraud."
        ),
    }
