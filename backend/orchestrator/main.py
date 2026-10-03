from fastapi import FastAPI

from backend.orchestrator.api.analyze import router as analyze_router
from backend.orchestrator.api.health import router as health_router


app = FastAPI(
    title="Sentry Orchestrator",
    description="AI Financial Intelligence and Risk Orchestration API",
    version="0.1.0",
)


app.include_router(
    analyze_router,
    prefix="/api",
    tags=["analysis"],
)

app.include_router(
    health_router,
    prefix="/api",
    tags=["health"],
)