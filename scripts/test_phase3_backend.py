import sys
import os
import io
import hashlib

# Ensure utf-8 encoding on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from main import app, process_file_embedding
from database.vector_store import vector_store

print("================================================================================")
print("             PHASE 3 — FASTAPI BACKEND & NEURAL API VERIFICATION                 ")
print("================================================================================")

client = TestClient(app)
passed = 0
total = 0

def test(name, fn):
    global passed, total
    total += 1
    try:
        fn()
        print(f"  [PASS] [BACKEND] {name}")
        passed += 1
    except Exception as e:
        print(f"  [FAIL] [BACKEND] {name}: {e}")
        raise e

# 1. Test Health Endpoint
def test_health():
    res = client.get("/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert data["status"] == "healthy"
    assert "models" in data
test("GET /health Endpoint Integrity", test_health)

# 2. Test Root Endpoint
def test_root():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
test("GET / Root Endpoint Integrity", test_root)

# 3. Test Direct Vector Processing Function
def test_embedding_function():
    # Test text file embedding
    sample_text = b"ProofVault AI decentralized copyright verification and IP protection system."
    emb, dim = process_file_embedding(sample_text, "text/plain", "manifest.txt")
    assert dim in [384, 512], f"Expected 384 or 512, got {dim}"
    assert len(emb) == dim
    assert emb.dtype == 'float32'
test("Process File Embedding Pipeline", test_embedding_function)

# 4. Test Neural Fingerprint API
def test_fingerprint_endpoint():
    sample_content = b"Sample artwork image bytes content for neural fingerprinting testing"
    files = {"file": ("test_art.png", sample_content, "image/png")}
    res = client.post("/api/v1/fingerprint", files=files)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert "sha256" in data
    assert "aiHash" in data
    assert data["filename"] == "test_art.png"
    assert data["mimeType"] == "image/png"
test("POST /api/v1/fingerprint Multimodal Generation", test_fingerprint_endpoint)

# 5. Test Register Vector API
def test_register_vector():
    sample_content = b"Another registered artwork for FAISS index vector lookup"
    files = {"file": ("sample_asset.png", sample_content, "image/png")}
    res = client.post("/api/v1/register_vector", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "indexed"
    assert "sha256" in data
test("POST /api/v1/register_vector FAISS Indexing", test_register_vector)

# 6. Test Similarity Lookup Endpoint
def test_similarity_search():
    sample_content = b"Another registered artwork for FAISS index vector lookup"
    files = {"file": ("sample_asset.png", sample_content, "image/png")}
    res = client.post("/api/v1/similarity", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["result"] in ["exact_match", "near_match", "no_match"]
    assert "similarity" in data
    assert "topMatches" in data
test("POST /api/v1/similarity Perceptual Querying", test_similarity_search)

# 7. Test 422 Error Handling on Missing File
def test_missing_file_validation():
    res = client.post("/api/v1/fingerprint")
    assert res.status_code == 422, f"Expected 422 Unprocessable Entity, got {res.status_code}"
test("Validation & 422 Error Handling for Bad Payloads", test_missing_file_validation)

print("\n================================================================================")
print(f"  ✓ PHASE 3 COMPLETED: {passed}/{total} BACKEND TESTS PASSED")
print("================================================================================\n")
