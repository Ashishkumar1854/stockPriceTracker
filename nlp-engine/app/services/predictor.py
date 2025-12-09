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

  # No articles = no signal
  if article_count == 0:
    return {
      "move": "neutral",
      "confidence": 0.0,
      "signal_strength": "none",
      "reason": "No recent news articles found for this company."
    }

  # Base on sentiment magnitude
  intensity = abs(avg_compound or 0.0)

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
      "reason": "Overall sentiment is near neutral."
    }

  # Direction
  if avg_compound > 0:
    move = "up"
    direction_text = "positive"
  else:
    move = "down"
    direction_text = "negative"

  # Adjust confidence a bit with number of articles
  # e.g. 1 article => -0.1, many articles => +0.05
  if article_count <= 2:
    conf = max(0.4, base_conf - 0.1)
  elif article_count >= 8:
    conf = min(0.98, base_conf + 0.05)
  else:
    conf = base_conf

  reason = (
    f"{article_count} news articles with "
    f"{direction_text} average sentiment (compound={avg_compound:.3f}), "
    f"signal strength: {strength}."
  )

  return {
    "move": move,
    "confidence": conf,
    "signal_strength": strength,
    "reason": reason,
  }
