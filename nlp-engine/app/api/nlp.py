# nlp-engine/app/api/nlp.py
from fastapi import APIRouter, Query
from typing import List

from app.models import AnalyzeRequest, AnalyzeResponse, Article
from app.services.scraper_manager import fetch_company_news
from app.services.sentiment_analyzer import analyze_text
from app.services.entity_extractor import extract_entities
from app.services.predictor import predict_price_move, rule_based_prediction

router = APIRouter()


@router.get("/scrape")
async def scrape_news(
    company: str = Query(..., description="Company name or ticker"),
    limit: int = Query(5, ge=1, le=20),
):
    articles = fetch_company_news(company, limit=limit)
    return {"company": company, "count": len(articles), "articles": articles}


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_news(req: AnalyzeRequest):
    # (same as before) — returns simplified AnalyzeResponse with predicted_move string
    enriched = []
    compounds = []

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
        compounds.append(sentiment.get("scores", {}).get("compound", 0.0))

    avg_compound = sum(compounds) / len(compounds) if compounds else 0.0
    article_count = len(enriched)
    predicted_move = predict_price_move(avg_compound, article_count)

    return AnalyzeResponse(
        company=req.company,
        article_count=article_count,
        avg_compound=avg_compound,
        predicted_move=predicted_move,
        articles=enriched,
    )


@router.post("/analyze-full")
async def analyze_news_full(req: AnalyzeRequest):
    """
    Returns the full analysis including the rule-based prediction object:
      { company, article_count, avg_compound, predicted_move, prediction: {move,confidence,reason,...}, articles }
    """
    enriched = []
    compounds = []

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
        compounds.append(sentiment.get("scores", {}).get("compound", 0.0))

    avg_compound = sum(compounds) / len(compounds) if compounds else 0.0
    article_count = len(enriched)

    # full rule-based details (dict)
    prediction = rule_based_prediction(avg_compound, article_count)
    predicted_move = prediction.get("move", "neutral")

    return {
        "company": req.company,
        "article_count": article_count,
        "avg_compound": avg_compound,
        "predicted_move": predicted_move,
        "prediction": prediction,   # full object: confidence, reason, signal_strength
        "articles": enriched,
    }


@router.get("/scrape-and-analyze", response_model=AnalyzeResponse)
async def scrape_and_analyze(
    company: str = Query(...),
    limit: int = Query(5, ge=1, le=20),
):
    raw_articles = fetch_company_news(company, limit=limit)

    articles = [
        Article(title=a.get("title"), link=a.get("link"), summary=a.get("summary"))
        for a in raw_articles
    ]

    req = AnalyzeRequest(company=company, articles=articles)
    return await analyze_news(req)
