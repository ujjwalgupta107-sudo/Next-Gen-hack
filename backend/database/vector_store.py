import faiss
import numpy as np
import os
import json
import threading

class DualVectorStore:
    def __init__(self, index_dir: str = "vector_data"):
        self.index_dir = index_dir
        os.makedirs(self.index_dir, exist_ok=True)
        self.lock = threading.RLock()
        
        self.image_path_index = os.path.join(self.index_dir, "faiss_image_512.bin")
        self.image_path_meta = os.path.join(self.index_dir, "faiss_image_meta.json")
        
        self.doc_path_index = os.path.join(self.index_dir, "faiss_doc_384.bin")
        self.doc_path_meta = os.path.join(self.index_dir, "faiss_doc_meta.json")
        
        # Load or initialize 512d Image index
        if os.path.exists(self.image_path_index) and os.path.exists(self.image_path_meta):
            try:
                self.image_index = faiss.read_index(self.image_path_index)
                with open(self.image_path_meta, "r") as f:
                    self.image_metadata = json.load(f)
            except Exception as e:
                print(f"Warning: Rebuilding 512d Image Index: {e}")
                self.image_index = faiss.IndexFlatIP(512)
                self.image_metadata = []
        else:
            self.image_index = faiss.IndexFlatIP(512)
            self.image_metadata = []
            
        # Load or initialize 384d Doc index
        if os.path.exists(self.doc_path_index) and os.path.exists(self.doc_path_meta):
            try:
                self.doc_index = faiss.read_index(self.doc_path_index)
                with open(self.doc_path_meta, "r") as f:
                    self.doc_metadata = json.load(f)
            except Exception as e:
                print(f"Warning: Rebuilding 384d Doc Index: {e}")
                self.doc_index = faiss.IndexFlatIP(384)
                self.doc_metadata = []
        else:
            self.doc_index = faiss.IndexFlatIP(384)
            self.doc_metadata = []

    def _save(self, is_image: bool):
        with self.lock:
            try:
                if is_image:
                    faiss.write_index(self.image_index, self.image_path_index)
                    with open(self.image_path_meta, "w") as f:
                        json.dump(self.image_metadata, f, indent=2)
                else:
                    faiss.write_index(self.doc_index, self.doc_path_index)
                    with open(self.doc_path_meta, "w") as f:
                        json.dump(self.doc_metadata, f, indent=2)
            except Exception as e:
                print(f"Failed to persist FAISS index to disk: {e}")

    def add_vector(self, embedding: np.ndarray, asset_id: str, sha256_hash: str):
        with self.lock:
            vec = np.nan_to_num(np.asarray(embedding, dtype='float32')).flatten()
            dim = len(vec)
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec = vec / norm
            vec_2d = vec.reshape(1, -1)

            if dim == 512:
                # Check for duplicate sha256 before inserting
                for meta in self.image_metadata:
                    if meta.get("sha256") == sha256_hash:
                        return
                self.image_index.add(vec_2d)
                self.image_metadata.append({"asset_id": asset_id, "sha256": sha256_hash})
                self._save(is_image=True)
            elif dim == 384:
                for meta in self.doc_metadata:
                    if meta.get("sha256") == sha256_hash:
                        return
                self.doc_index.add(vec_2d)
                self.doc_metadata.append({"asset_id": asset_id, "sha256": sha256_hash})
                self._save(is_image=False)
            else:
                print(f"Warning: Vector dimension {dim} not supported for indexing.")

    def search(self, embedding: np.ndarray, top_k: int = 5):
        with self.lock:
            vec = np.nan_to_num(np.asarray(embedding, dtype='float32')).flatten()
            dim = len(vec)
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec = vec / norm
            vec_2d = vec.reshape(1, -1)

            if dim == 512:
                index = self.image_index
                metadata = self.image_metadata
            elif dim == 384:
                index = self.doc_index
                metadata = self.doc_metadata
            else:
                return []

            if index.ntotal == 0:
                return []

            k = min(top_k, index.ntotal)
            scores, indices = index.search(vec_2d, k)

            results = []
            for score, idx in zip(scores[0], indices[0]):
                if idx != -1 and idx < len(metadata):
                    clamped_score = min(1.0, max(0.0, float(score)))
                    results.append({
                        "score": clamped_score,
                        "metadata": metadata[idx],
                        "sha256": metadata[idx].get("sha256"),
                        "asset_id": metadata[idx].get("asset_id")
                    })
            return results

# Global thread-safe vector store instance
vector_store = DualVectorStore()
