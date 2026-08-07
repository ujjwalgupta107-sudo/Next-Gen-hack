import sys
import os
import io
import shutil
import numpy as np
from PIL import Image, ImageEnhance, ImageOps

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add backend to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

import main
from models.image_model import CLIPImageEmbedder
from models.document_model import DocumentEmbedder
from database.vector_store import DualVectorStore

print("================================================================================")
print("             PHASE 6 — AI PERCEPTUAL HASHING & FAISS VECTOR SEARCH AUDIT        ")
print("================================================================================")

# Initialize neural models explicitly
print("▶ Loading CLIP vision transformer & Sentence-Transformers into memory...")
main.image_embedder = CLIPImageEmbedder()
main.doc_embedder = DocumentEmbedder()
print("  ✓ Neural models initialized.")

def assert_true(cond, msg="Assertion failed"):
    if not cond:
        raise AssertionError(msg)

# Initialize isolated vector store for testing
test_store = DualVectorStore(index_dir="vector_data_test")
passed = 0
total = 0

def check(name, fn):
    global passed, total
    total += 1
    try:
        fn()
        print(f"  [PASS] [AI] {name}")
        passed += 1
    except Exception as e:
        print(f"  [FAIL] [AI] {name}: {e}")
        raise e

# Create synthetic base image with geometric patterns for rich feature extraction
img = Image.new("RGB", (256, 256), color=(200, 100, 50))
img_byte_arr = io.BytesIO()
img.save(img_byte_arr, format='PNG')
original_bytes = img_byte_arr.getvalue()

# 1. Base Embedding Extraction
base_emb, dim = main.process_file_embedding(original_bytes, "image/png", "original.png")
def test_original():
    assert_true(dim == 512, f"Expected 512d, got {dim}")
    assert_true(len(base_emb) == 512)
    norm = float(np.linalg.norm(base_emb))
    assert_true(norm >= 0.99, f"Vector norm must be 1.0 (normalized), got {norm}")
check("Original Image Neural Embedding Generation (512d CLIP)", test_original)

# Index original
test_store.add_vector(base_emb, "original.png", "0xoriginal_sha256_hash")

# 2. Test Exact Match Search
def test_exact():
    results = test_store.search(base_emb, top_k=1)
    assert_true(len(results) > 0, "Expected at least 1 match")
    score = results[0]["score"]
    assert_true(score >= 0.99, f"Exact match score too low: {score}")
    assert_true(results[0]["sha256"] == "0xoriginal_sha256_hash")
check("FAISS Exact Duplicate Match Detection (Cosine >= 0.99)", test_exact)

# 3. Test Edited / Brightness Modified Image
def test_edited():
    enhancer = ImageEnhance.Brightness(img)
    bright_img = enhancer.enhance(1.1)
    b_arr = io.BytesIO()
    bright_img.save(b_arr, format='PNG')
    bright_emb, _ = main.process_file_embedding(b_arr.getvalue(), "image/png", "bright.png")
    
    results = test_store.search(bright_emb, top_k=1)
    assert_true(len(results) > 0)
    score = results[0]["score"]
    assert_true(score >= 0.85, f"Edited image similarity too low: {score}")
check("FAISS Near-Match on Brightness Edited Image (Cosine >= 0.85)", test_edited)

# 4. Test Cropped Image
def test_cropped():
    cropped = img.crop((10, 10, 246, 246))
    c_arr = io.BytesIO()
    cropped.save(c_arr, format='PNG')
    crop_emb, _ = main.process_file_embedding(c_arr.getvalue(), "image/png", "cropped.png")
    
    results = test_store.search(crop_emb, top_k=1)
    assert_true(len(results) > 0)
    score = results[0]["score"]
    assert_true(score >= 0.85, f"Cropped image similarity too low: {score}")
check("FAISS Near-Match on Cropped Image (Cosine >= 0.85)", test_cropped)

# 5. Test Document / Code Embedding with SentenceTransformers (384d)
def test_document():
    code_text = b"contract ProofVaultRegistry { mapping(bytes32 => address) public owners; }"
    doc_emb, doc_dim = main.process_file_embedding(code_text, "text/plain", "Registry.sol")
    assert_true(doc_dim == 384, f"Expected 384d for text, got {doc_dim}")
    test_store.add_vector(doc_emb, "Registry.sol", "0xdoc_sha256_hash")
    doc_results = test_store.search(doc_emb, top_k=1)
    assert_true(len(doc_results) > 0)
    assert_true(doc_results[0]["score"] >= 0.99)
check("Sentence-Transformers Text/Code 384d Neural Embedding", test_document)

# Clean up test dir
if os.path.exists("vector_data_test"):
    shutil.rmtree("vector_data_test")

print("\n================================================================================")
print(f"  ✓ PHASE 6 COMPLETED: {passed}/{total} AI & FAISS TESTS PASSED")
print("================================================================================\n")
