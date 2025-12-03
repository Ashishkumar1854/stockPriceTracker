#File: nlp-engine/app/services/entity_extractor.py

from typing import List

import spacy

# Load spaCy model once
# Make sure to install: python -m spacy download en_core_web_sm
_nlp = spacy.load("en_core_web_sm")


def extract_entities(text: str) -> List[str]:
    """
    Extract simple ORG / GPE entities for context.
    Later you can switch to finance-specific NER.
    """
    doc = _nlp(text or "")
    entities = [ent.text for ent in doc.ents if ent.label_ in ("ORG", "GPE")]
    # de-duplicate
    return list(dict.fromkeys(entities))
