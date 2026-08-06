from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel
import numpy as np
import io

class CLIPImageEmbedder:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_name = "openai/clip-vit-base-patch32"
        self.model = CLIPProcessor.from_pretrained(self.model_name)
        self.model_instance = CLIPModel.from_pretrained(self.model_name).to(self.device)

    def extract_embedding(self, image_bytes: bytes) -> np.ndarray:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        inputs = self.model(images=image, return_tensors="pt").to(self.device)
        with torch.no_grad():
            image_features = self.model_instance.get_image_features(**inputs)
        
        embedding = image_features.cpu().numpy().flatten()
        return embedding / np.linalg.norm(embedding)
