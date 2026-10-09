# Machine Learning Training Pipeline

This directory is reserved for offline data exploration, feature engineering, and model training routines.

## Scope for Stage 2:
1. `preprocess.py`: Cleans raw transaction features, handles class imbalance, normalizes distributions.
2. `train.py`: Trains XGBoost and Random Forest classifiers, executes cross-validation and hyperparameter tuning.
3. `evaluate.py`: Generates confusion matrices, ROC-AUC curves, precision-recall trade-off plots, and SHAP summary plots.
4. `export.py`: Serializes the winning model and preprocessor pipelines to `../artifacts/`.

Per Stage 1 requirements, no mock models or synthetic predictions are created here.
