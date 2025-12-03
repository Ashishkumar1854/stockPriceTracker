#File: nlp-engine/app/services/sentiment_analyzer.py

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

_analyzer = SentimentIntensityAnalyzer()


def analyze_text(text: str) -> dict:
    """
    Return sentiment scores + label for given text.
    """
    scores = _analyzer.polarity_scores(text or "")
    compound = scores["compound"]

    if compound >= 0.2:
        label = "positive"
    elif compound <= -0.2:
        label = "negative"
    else:
        label = "neutral"

    return {"label": label, "scores": scores}
