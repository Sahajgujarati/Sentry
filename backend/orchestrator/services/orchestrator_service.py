import uuid
from typing import Any

from backend.orchestrator.graph.workflow import build_workflow


class OrchestratorService:
    def __init__(self):
        self.workflow = build_workflow()

    def analyze(
        self,
        user_query: str,
        portfolio_id: str,
    ) -> dict[str, Any]:

        initial_state = {
            "user_query": user_query,
            "portfolio_id": portfolio_id,
        }

        result = self.workflow.invoke(initial_state)

        analysis_id = str(uuid.uuid4())

        return {
            "analysis_id": analysis_id,
            "analysis": result["final_analysis"],
        }