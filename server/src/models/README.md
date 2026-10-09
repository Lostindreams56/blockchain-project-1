# Mongoose Models

This directory contains Mongoose schemas and models for the Ethereum Fraud Detection & Risk Intelligence Platform.

## Implemented Schemas (Stage 2):
- **User (`User.ts`)**:
  - `name`: String, trimmed (2-100 characters)
  - `email`: String, trimmed, lowercase, unique index
  - `passwordHash`: String, bcrypt hash (`select: false` by default for safety)
  - `role`: Enum `['user', 'analyst', 'admin']`, default `'user'`
  - `createdAt`, `updatedAt`: Timestamps
  - `toJSON` transform: safely removes `passwordHash` and internal Mongoose `__v`

- **Session (`Session.ts`)**:
  - `userId`: ObjectId reference to `User`
  - `tokenHash`: SHA-256 hash of refresh token string (unique index)
  - `familyId`: UUID token family identifier for automated reuse detection
  - `isRevoked`: Boolean flag for immediate invalidation
  - `userAgent`, `ipAddress`: Client audit metadata
  - `expiresAt`: Date with MongoDB TTL index (`expireAfterSeconds: 0`) for automatic expiration cleanup

## Planned Schemas (Stage 3+):
- **WalletInvestigation**: Tracked addresses, risk flags, tags, investigation status, notes.
- **RiskAssessment**: ML model inference results, feature attribution scores (SHAP values), risk tier, classification timestamp.
- **AuditLog**: Traceability for analyst actions, export requests, and configuration changes.
