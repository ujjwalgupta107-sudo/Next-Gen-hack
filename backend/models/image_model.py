from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel
import numpy as np
import io

class CLIPImageEmbedder:
    def __init__(self):
        try:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        except Exception:
            self.device = "cpu"
        self.model_name = "openai/clip-vit-base-patch32"
        self.processor = CLIPProcessor.from_pretrained(self.model_name)
        self.model_instance = CLIPModel.from_pretrained(self.model_name).to(self.device)

    def extract_embedding(self, image_bytes: bytes) -> np.ndarray:
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            inputs = self.processor(images=image, return_tensors="pt").to(self.device)
            with torch.no_grad():
                image_features = self.model_instance.get_image_features(**inputs)
                if hasattr(image_features, "pooler_output") and image_features.pooler_output is not None:
                    feat_tensor = image_features.pooler_output
                elif hasattr(image_features, "image_embeds") and image_features.image_embeds is not None:
                    feat_tensor = image_features.image_embeds
                elif hasattr(image_features, "cpu"):
                    feat_tensor = image_features
                else:
                    feat_tensor = image_features[0]
            
            embedding = feat_tensor.cpu().numpy().flatten().astype('float32')
            norm = np.linalg.norm(embedding)
            if norm > 0:
                embedding = embedding / norm
            return np.nan_to_num(embedding, nan=0.0)
        except Exception as e:
            print(f"CLIP embedding extraction error: {e}")
            return np.zeros(512, dtype='float32')

