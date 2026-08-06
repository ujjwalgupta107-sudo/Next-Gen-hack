import faiss
import numpy as np

class VectorStore:
    def __init__(self, dimension: int = 512):
        self.dimension = dimension
        self.index = faiss.IndexFlatIP(dimension)  # Inner product for normalized cosine similarity
        self.metadata = []

    def add_vector(self, embedding: np.ndarray, asset_id: str, sha256_hash: str):
        # Normalize vector for cosine similarity
        embedding = embedding / np.linalg.norm(embedding)
        embedding = embedding.reshape(1, -1).astype('float32')
        self.index.add(embedding)
        self.metadata.append({"asset_id": asset_id, "sha256": sha256_hash})

    def search(self, embedding: np.ndarray, top_k: int = 5):
        if self.index.ntotal == 0:
            return []

        embedding = embedding / np.linalg.norm(embedding)
        embedding = embedding.reshape(1, -1).astype('float32')
        
        scores, indices = self.index.search(embedding, min(top_k, self.index.ntotal))
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx != -1:
                results.append({
                    "score": float(score),
                    "metadata": self.metadata[idx]
                })
        return results

# Global Vector Store Instance
vector_store = VectorStore(dimension=512)
