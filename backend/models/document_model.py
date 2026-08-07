from sentence_transformers import SentenceTransformer
import numpy as np

class DocumentEmbedder:
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    def extract_embedding(self, text_content: str) -> np.ndarray:
        try:
            embedding = self.model.encode(text_content).flatten().astype('float32')
            norm = np.linalg.norm(embedding)
            if norm > 0:
                embedding = embedding / norm
            return np.nan_to_num(embedding, nan=0.0)
        except Exception as e:
            print(f"Document embedding extraction error: {e}")
            return np.zeros(384, dtype='float32')

