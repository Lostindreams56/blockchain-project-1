"""
Ethereum Fraud Detection ML Microservice - FastAPI Starter Entrypoint
Provides health check and sets the schema foundation for ML model inference in Stage 2.
"""

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(
    title="Ethereum Fraud Detection ML Microservice",
    description="Machine Learning inference service for on-chain wallet fraud and risk scoring.",
    version="1.0.0",
)


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    ML Service liveness probe.
    """
    return HealthResponse(
        status="ok",
        service="ethereum-fraud-ml-service",
        version="1.0.0",
    )


# NOTE: Full model prediction endpoints, SHAP explainability pipelines,
# and feature scaling transformations will be implemented in Stage 2.
