from typing import Any

from pydantic import BaseModel


class AnalysisResult(BaseModel):
    analysis_id: str
    analysis: dict[str, Any]