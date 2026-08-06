from sentence_transformers import SentenceTransformer
import numpy as np

class DocumentEmbedder:
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    def extract_embedding(self, text_content: str) -> np.ndarray:
        embedding = self.model.encode(text_content)
        return embedding / np.linalg.norm(embedding)
