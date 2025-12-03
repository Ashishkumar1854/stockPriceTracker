#File: nlp-engine/app/models.py (overwrite)

from typing import List, Optional
from pydantic import BaseModel


class Article(BaseModel):
  title: str
  link: Optional[str] = None
  summary: Optional[str] = None


class AnalyzeRequest(BaseModel):
  company: str
  articles: List[Article]


class AnalyzedArticle(BaseModel):
  title: str
  link: Optional[str]
  summary: Optional[str]
  sentiment: dict
  entities: List[str]


class AnalyzeResponse(BaseModel):
  company: str
  article_count: int
  avg_compound: float
  predicted_move: str
  articles: List[AnalyzedArticle]
