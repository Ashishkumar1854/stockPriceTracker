# nlp-engine/app/api/nlp.py

from fastapi import APIRouter, Query
from typing import List

from app.models import AnalyzeRequest, AnalyzeResponse, Article
from app.services.scraper_manager import fetch_company_news
from app.services.sentiment_analyzer import analyze_text
from app.services.entity_extractor import extract_entities
from app.services.predictor import predict_price_move  # <- wrapper that returns "up"/"down"/"neutral"

router = APIRouter()


@router.get("/scrape")
async def scrape_news(
    company: str = Query(..., description="Company name or ticker"),
    limit: int = Query(5, ge=1, le=20),
):
    """
    Return raw scraped articles (list of dicts).
    """
    articles = fetch_company_news(company, limit=limit)
    return {"company": company, "count": len(articles), "articles": articles}


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_news(req: AnalyzeRequest):
    """
    Analyze provided articles for sentiment & entities.
    Accepts body: { company: str, articles: [{ title, link, summary }, ...] }
    Returns AnalyzeResponse (company, article_count, avg_compound, predicted_move, articles)
    """
    enriched = []
    compounds: list[float] = []

    for art in req.articles:
        text = f"{art.title or ''}. {art.summary or ''}"
        sentiment = analyze_text(text)
        ents = extract_entities(text)
        enriched.append(
            {
                "title": art.title,
                "link": art.link,
                "summary": art.summary,
                "sentiment": sentiment,
                "entities": ents,
            }
        )
        # guard - sentiment structure assumed to contain scores.compound
        compounds.append(sentiment.get("scores", {}).get("compound", 0.0))

    avg_compound = sum(compounds) / len(compounds) if compounds else 0.0
    article_count = len(enriched)

    # Use wrapper that returns label expected by your Analyzer consumer
    predicted_move = predict_price_move(avg_compound, article_count)

    return AnalyzeResponse(
        company=req.company,
        article_count=article_count,
        avg_compound=avg_compound,
        predicted_move=predicted_move,
        articles=enriched,
    )


@router.get("/scrape-and-analyze", response_model=AnalyzeResponse)
async def scrape_and_analyze(
    company: str = Query(...),
    limit: int = Query(5, ge=1, le=20),
):
    """
    End-to-end: scrape latest company news and analyze.
    Useful for quick tests: GET /nlp/scrape-and-analyze?company=TCS&limit=5
    """
    raw_articles = fetch_company_news(company, limit=limit)

    # convert to AnalyzeRequest-compatible structure
    articles = [
        Article(title=a.get("title"), link=a.get("link"), summary=a.get("summary"))
        for a in raw_articles
    ]

    req = AnalyzeRequest(company=company, articles=articles)
    return await analyze_news(req)
