#File: nlp-engine/app/services/scraper_manager.py
import urllib.parse
from datetime import datetime
from typing import List, Dict, Any

import feedparser


def fetch_company_news(company: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Fetch latest news for a company using Google News RSS.
    This is a simple scraper; for production you'd switch to a paid API.
    """
    query = urllib.parse.quote(f"{company} stock")
    url = (
        f"https://news.google.com/rss/search?q={query}"
        "&hl=en-IN&gl=IN&ceid=IN:en"
    )

    feed = feedparser.parse(url)
    articles: List[Dict[str, Any]] = []

    for entry in feed.entries[:limit]:
        published = getattr(entry, "published", None)
        articles.append(
            {
                "title": getattr(entry, "title", ""),
                "link": getattr(entry, "link", None),
                "summary": getattr(entry, "summary", ""),
                "published": published,
            }
        )

    return articles
