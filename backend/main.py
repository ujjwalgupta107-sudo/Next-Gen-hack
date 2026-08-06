from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import hashlib
import numpy as np

from database.vector_store import vector_store
from models.image_model import CLIPImageEmbedder
from models.document_model import DocumentEmbedder

app = FastAPI(
    title="ProofVault AI Inference Engine",
    description="Real AI Pipeline for multi-modal digital asset fingerprinting and near-duplicate vector search.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Models Lazily / Global
image_embedder = None
doc_embedder = None

@app.on_event("startup")
async def startup_event():
    global image_embedder, doc_embedder
    try:
        image_embedder = CLIPImageEmbedder()
        doc_embedder = DocumentEmbedder()
        print("AI Models successfully loaded into memory.")
    except Exception as e:
        print(f"Model initialization error: {e}")

@app.get("/")
def read_root():
    return {"status": "online", "service": "ProofVault AI Inference API"}

@app.post("/api/v1/fingerprint")
async def generate_fingerprint(file: UploadFile = File(...)):
    contents = await file.read()
    sha256_hash = hashlib.sha256(contents).hexdigest()
    
    mime_type = file.content_type
    embedding = None

    if mime_type and mime_type.startswith("image/"):
        if image_embedder:
            embedding = image_embedder.extract_embedding(contents)
    elif mime_type in ["text/plain", "application/pdf"]:
        if doc_embedder:
            text = contents.decode("utf-8", errors="ignore")
            embedding = doc_embedder.extract_embedding(text)

    # Fallback to zero vector if unhandled
    if embedding is None:
        embedding = np.zeros(512, dtype='float32')

    ai_hash = hashlib.sha256(embedding.tobytes()).hexdigest()

    return {
        "filename": file.filename,
        "sha256": sha256_hash,
        "aiHash": ai_hash,
        "embeddingDimension": len(embedding),
        "mimeType": mime_type
    }

@app.post("/api/v1/similarity")
async def check_similarity(file: UploadFile = File(...)):
    contents = await file.read()
    mime_type = file.content_type
    
    if mime_type and mime_type.startswith("image/") and image_embedder:
        embedding = image_embedder.extract_embedding(contents)
    elif doc_embedder:
        text = contents.decode("utf-8", errors="ignore")
        embedding = doc_embedder.extract_embedding(text)
    else:
        embedding = np.zeros(512, dtype='float32')

    matches = vector_store.search(embedding, top_k=3)
    
    if not matches:
        return {"result": "no_match", "similarity": 0.0, "topMatches": []}
    
    best_score = matches[0]["score"]
    
    if best_score > 0.98:
        result_type = "exact_match"
    elif best_score > 0.85:
        result_type = "near_match"
    else:
        result_type = "no_match"

    return {
        "result": result_type,
        "similarity": round(best_score * 100, 2),
        "topMatches": matches
    }
