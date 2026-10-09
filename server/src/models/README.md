# Mongoose Models

This directory will contain Mongoose schemas and models for the Ethereum Fraud Detection & Risk Intelligence Platform.

## Planned Schemas (Stage 2 & Stage 3):
- **User / Auth**: User profiles, password hashes, refresh tokens, role-based permissions (Auditor, Analyst, Admin).
- **WalletInvestigation**: Tracked addresses, risk flags, tags, investigation status, notes.
- **RiskAssessment**: ML model inference results, feature attribution scores (SHAP values), risk tier, classification timestamp.
- **AuditLog**: Traceability for analyst actions, export requests, and configuration changes.

No database models or collections are seeded in Stage 1 per architecture design.
