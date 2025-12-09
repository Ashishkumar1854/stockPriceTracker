# nlp-engine/app/main.py
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# router must exist at app.api.nlp (your existing router file)
from app.api.nlp import router as nlp_router

logger = logging.getLogger("uvicorn")
logger.setLevel(logging.INFO)

# Read allowed origins from env (comma separated) or fallback to "*" for dev
_ALLOWED_ORIGINS = os.getenv("NLP_ALLOW_ORIGINS") or os.getenv("FRONTEND_URL") or "*"
if _ALLOWED_ORIGINS != "*":
    # allow list split by comma
    ALLOW_ORIGINS = [o.strip() for o in _ALLOWED_ORIGINS.split(",") if o.strip()]
else:
    ALLOW_ORIGINS = ["*"]

app = FastAPI(
    title="AshishStockTracker NLP Engine",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS - dev friendly; tighten for prod by setting NLP_ALLOW_ORIGINS or FRONTEND_URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOW_ORIGINS,
    allow_credentials=True,  # set True to allow cookie-based auth if you later use it
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    # Try to warm-up/load spacy model if available (silent failure if not installed)
    try:
        import spacy

        # prefer env-configured model name, fallback to en_core_web_sm
        model_name = os.getenv("SPACY_MODEL", "en_core_web_sm")
        logger.info(f"[nlp-engine] loading spaCy model '{model_name}' (if installed)...")
        try:
            # load using spacy.load (works if model is installed)
            nlp = spacy.load(model_name)
            # store on app state for other modules to reuse (optional)
            app.state.spacy_nlp = nlp
            logger.info("[nlp-engine] spaCy model loaded and cached on app.state.spacy_nlp")
        except Exception as e:
            # If model not installed or fails, log and continue — service still works with other analyzers
            logger.warning(
                f"[nlp-engine] spaCy model '{model_name}' not available or failed to load: {e}"
            )
    except Exception:
        # spacy not installed; fine for lightweight setups (we use VADER / rule engine by default)
        logger.info("[nlp-engine] spaCy not installed in environment; continuing without it")

    # optionally log env config for quick debug (non-sensitive)
    logger.info(f"[nlp-engine] allowed origins: {ALLOW_ORIGINS}")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "nlp-engine"}


# All NLP endpoints under /nlp/...
app.include_router(nlp_router, prefix="/nlp", tags=["nlp"])
