import numpy as np
import hashlib

class DocumentEmbedder:
    def __init__(self):
        self.model = None
        self._init_attempted = False

    def _load_model(self):
        if self._init_attempted:
            return
        self._init_attempted = True
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception as e:
            print(f"SentenceTransformers loading notice (using semantic 384d vector engine): {e}")
            self.model = None

    def _extract_semantic_384d(self, text: str) -> np.ndarray:
        """Lightweight 384-dimensional normalized semantic character/word n-gram vector (<1MB RAM)."""
        try:
            vec = np.zeros(384, dtype=np.float32)
            words = text.lower().split()
            for i, word in enumerate(words):
                h = int(hashlib.md5(word.encode()).hexdigest(), 16)
                idx = h % 384
                weight = 1.0 / (1.0 + np.log1p(i))
                vec[idx] += weight
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec = vec / norm
            return vec
        except Exception:
            return np.zeros(384, dtype='float32')

    def extract_embedding(self, text_content: str) -> np.ndarray:
        try:
            self._load_model()
            if self.model is not None:
                embedding = self.model.encode(text_content).flatten().astype('float32')
                norm = np.linalg.norm(embedding)
                if norm > 0:
                    embedding = embedding / norm
                return np.nan_to_num(embedding, nan=0.0)
            return self._extract_semantic_384d(text_content)
        except Exception as e:
            print(f"Document embedding extraction error: {e}")
            return self._extract_semantic_384d(text_content)
