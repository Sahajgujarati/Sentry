from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    query: str
    portfolio_id: str