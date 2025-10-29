from transformers import AutoProcessor, AutoModelForImageClassification
from PIL import Image
import torch

# 🔧 Change this:
# model_name = "belab/waste-classification"
# To this:
model_name = "microsoft/resnet-50"

# Load pretrained model + processor
processor = AutoProcessor.from_pretrained(model_name)
model = AutoModelForImageClassification.from_pretrained(model_name)

def predict(image_path):
    image = Image.open(image_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    outputs = model(**inputs)
    logits = outputs.logits
    predicted_class_idx = logits.argmax(-1).item()
    label = model.config.id2label[predicted_class_idx]
    confidence = torch.softmax(logits, dim=-1)[0][predicted_class_idx].item()
    return {"category": label, "confidence": confidence}
