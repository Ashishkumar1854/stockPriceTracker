# nlp-engine/app/services/predictor.py
from typing import Dict


def rule_based_prediction(avg_compound: float, article_count: int) -> Dict:
    """
    Simple rule-based predictor for stock move based on average sentiment.

    Returns:
      {
        "move": "up" | "down" | "neutral",
        "confidence": float (0..1),
        "signal_strength": "none" | "weak" | "medium" | "strong",
        "reason": str
      }
    """

    # Defensive defaults
    avg = float(avg_compound or 0.0)
    n = int(article_count or 0)

    # No articles = no signal
    if n == 0:
        return {
            "move": "neutral",
            "confidence": 0.0,
            "signal_strength": "none",
            "reason": "No recent news articles found for this company.",
        }

    # Base on sentiment magnitude
    intensity = abs(avg)

    # Thresholds (tune later easily)
    if intensity >= 0.4:
        strength = "strong"
        base_conf = 0.9
    elif intensity >= 0.2:
        strength = "medium"
        base_conf = 0.75
    elif intensity >= 0.05:
        strength = "weak"
        base_conf = 0.6
    else:
        # Too close to zero, treat as neutral
        return {
            "move": "neutral",
            "confidence": 0.55,
            "signal_strength": "weak",
            "reason": "Overall sentiment is near neutral.",
        }

    # Direction
    if avg > 0:
        move = "up"
        direction_text = "positive"
    else:
        move = "down"
        direction_text = "negative"

    # Adjust confidence a bit with number of articles
    # e.g. 1 article => -0.1, many articles => +0.05
    if n <= 2:
        conf = max(0.4, base_conf - 0.1)
    elif n >= 8:
        conf = min(0.98, base_conf + 0.05)
    else:
        conf = base_conf

    reason = (
        f"{n} news articles with {direction_text} average sentiment "
        f"(compound={avg:.3f}), signal strength: {strength}."
    )

    return {
        "move": move,
        "confidence": round(conf, 3),
        "signal_strength": strength,
        "reason": reason,
    }


def predict_price_move(avg_compound: float, article_count: int = 0) -> str:
    """
    Lightweight wrapper used by the API controller. Returns string:
      "up", "down", or "neutral"
    Keeps compatibility with existing code that expects a simple label.
    """
    out = rule_based_prediction(avg_compound, article_count)
    # ensure valid label
    mv = out.get("move", "neutral")
    if mv not in ("up", "down", "neutral"):
        mv = "neutral"
    return mv
