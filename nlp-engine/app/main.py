from fastapi import FastAPI
app = FastAPI(title="Ashish NLP Service")

@app.get("/health")
async def health():
    return {"status":"ok"}

@app.post("/v1/process-article")
async def process_article(payload: dict):
    # stub: receive article, run sentiment/ner, store into DB via backend service
    return {"processed": True}
