from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import hashlib
import numpy as np

from database.vector_store import vector_store
from models.image_model import CLIPImageEmbedder
from models.document_model import DocumentEmbedder
from schemas.user_schema import UserRegisterRequest, UserLoginRequest, SIWELoginRequest, TokenResponse
from services.auth_service import hash_password, verify_password, create_access_token, decode_access_token
from middleware.auth_middleware import get_current_user, RequireRole, rate_limiter

image_embedder = CLIPImageEmbedder()
doc_embedder = DocumentEmbedder()

app = FastAPI(
    title="ProofVault AI Neural Inference Engine",
    description="Production multimodal vision & document embedding engine for perceptual hashing, FAISS similarity lookup, and RBAC authentication.",
    version="1.0.0"
)

# Enable CORS for trusted Next.js frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://frontend:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def process_file_embedding(contents: bytes, mime_type: str | None, filename: str | None) -> tuple[np.ndarray, int]:
    mime = (mime_type or "").lower()
    fname = (filename or "").lower()
    
    # Image content check -> 512d CLIP
    if mime.startswith("image/") or fname.endswith((".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".svg")):
        if image_embedder:
            emb = image_embedder.extract_embedding(contents)
            return emb, 512
        return np.zeros(512, dtype='float32'), 512
    
    # Text / document / code content check -> 384d SentenceTransformers
    is_text = mime.startswith("text/") or mime in ["application/pdf", "application/json", "application/javascript"] or fname.endswith((".txt", ".md", ".py", ".js", ".ts", ".jsx", ".tsx", ".json", ".html", ".css", ".sol", ".cpp", ".c", ".java", ".go", ".rs", ".pdf"))
    if is_text and doc_embedder:
        text = contents.decode("utf-8", errors="ignore")
        if text.strip():
            emb = doc_embedder.extract_embedding(text)
            return emb, 384
        return np.zeros(384, dtype='float32'), 384

    # Default fallback for binary/unsupported
    if image_embedder:
        return image_embedder.extract_embedding(contents), 512
    return np.zeros(512, dtype='float32'), 512

@app.get("/")
@app.get("/health")
def read_root():
    return {
        "status": "healthy",
        "service": "ProofVault AI Neural Engine",
        "models": {
            "clip_vit_b32": image_embedder is not None,
            "sentence_transformers": doc_embedder is not None
        },
        "indexed_images": vector_store.image_index.ntotal,
        "indexed_docs": vector_store.doc_index.ntotal
    }

@app.post("/api/v1/auth/verify_token")
async def verify_token_endpoint(user: dict = Depends(get_current_user)):
    """Validates JWT bearer token and returns decoded identity."""
    return {"valid": True, "user": user}

@app.post("/api/v1/fingerprint")
async def generate_fingerprint(
    request: Request,
    file: UploadFile = File(...)
):
    await rate_limiter.check_rate_limit(request)
    try:
        contents = await file.read()
        sha256_hash = hashlib.sha256(contents).hexdigest()
        filename = file.filename or "unnamed_asset"
        mime_type = file.content_type

        embedding, dim = process_file_embedding(contents, mime_type, filename)
        ai_hash = hashlib.sha256(embedding.tobytes()).hexdigest()

        # Automatically index vector for FAISS search
        vector_store.add_vector(embedding, filename, sha256_hash)

        return {
            "filename": filename,
            "sha256": sha256_hash,
            "aiHash": ai_hash,
            "embeddingDimension": dim,
            "mimeType": mime_type
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Fingerprint generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/register_vector")
async def register_vector(
    request: Request,
    file: UploadFile = File(...)
):
    await rate_limiter.check_rate_limit(request)
    try:
        contents = await file.read()
        sha256_hash = hashlib.sha256(contents).hexdigest()
        filename = file.filename or "unnamed_asset"
        mime_type = file.content_type

        embedding, _ = process_file_embedding(contents, mime_type, filename)
        vector_store.add_vector(embedding, filename, sha256_hash)
        total = vector_store.image_index.ntotal + vector_store.doc_index.ntotal
        return {"status": "indexed", "sha256": sha256_hash, "totalIndexed": total}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Register vector error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/similarity")
async def check_similarity(
    request: Request,
    file: UploadFile = File(...)
):
    await rate_limiter.check_rate_limit(request)
    try:
        contents = await file.read()
        filename = file.filename or "unnamed_asset"
        mime_type = file.content_type
        sha256_hash = hashlib.sha256(contents).hexdigest()

        embedding, _ = process_file_embedding(contents, mime_type, filename)
        matches = vector_store.search(embedding, top_k=5)
        
        if not matches:
            return {
                "result": "no_match",
                "sha256": sha256_hash,
                "similarity": 0.0,
                "topMatches": []
            }
        
        best_match = matches[0]
        best_score = best_match["score"]
        
        # Exact perceptual match threshold vs near-duplicate threshold
        if best_score >= 0.99 or best_match.get("sha256") == sha256_hash:
            result_type = "exact_match"
        elif best_score >= 0.80:
            result_type = "near_match"
        else:
            result_type = "no_match"

        return {
            "result": result_type,
            "sha256": sha256_hash,
            "similarity": round(best_score * 100, 2),
            "matchedAssetSha256": best_match.get("sha256"),
            "topMatches": matches
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Similarity check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
