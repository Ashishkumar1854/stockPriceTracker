#File: nlp-engine/app/services/predictor.py
def predict_price_move(avg_compound: float) -> str:
    """
    Very simple rule-based predictor for Phase 2.
    Phase 3 will replace this with proper ML.
    """
    if avg_compound >= 0.3:
        return "up"
    elif avg_compound <= -0.3:
        return "down"
    else:
        return "neutral"
