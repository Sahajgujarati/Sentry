from fastapi import APIRouter

from backend.orchestrator.schemas.request import AnalyzeRequest
from backend.orchestrator.schemas.response import AnalyzeResponse
from backend.orchestrator.services.orchestrator_service import (
    OrchestratorService,
)


router = APIRouter()

orchestrator_service = OrchestratorService()


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest):
    result = orchestrator_service.analyze(
        user_query=request.query,
        portfolio_id=request.portfolio_id,
    )

    return result