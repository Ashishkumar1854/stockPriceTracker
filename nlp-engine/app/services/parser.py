#File: nlp-engine/app/services/parser.py
import re


def clean_text(text: str) -> str:
    if not text:
        return ""
    # basic clean: remove extra spaces, line breaks
    text = re.sub(r"\s+", " ", text)
    return text.strip()
