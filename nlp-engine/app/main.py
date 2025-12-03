# nlp-engine/app/main.py


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.nlp import router as nlp_router

app = FastAPI(
    title="AshishStockTracker NLP Engine",
    version="0.1.0",
)

# CORS - dev friendly; later tighten for prod
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # prod: only backend origin
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "nlp-engine"}


# All NLP endpoints under /nlp/...
app.include_router(nlp_router, prefix="/nlp", tags=["nlp"])
