from typing import Any

from pydantic import BaseModel


class AnalyzeResponse(BaseModel):
    analysis_id: str
    analysis: dict[str, Any]