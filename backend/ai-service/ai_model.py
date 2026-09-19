import torch
from torchvision.models import resnet18, ResNet18_Weights
from PIL import Image


# Load pretrained model
weights = ResNet18_Weights.DEFAULT
model = resnet18(weights=weights)

model.eval()

# Image preprocessing
preprocess = weights.transforms()


def analyze_image(image_path: str):
    # Open image
    image = Image.open(image_path).convert("RGB")

    # Preprocess image
    input_tensor = preprocess(image).unsqueeze(0)

    # Run model
    with torch.no_grad():
        output = model(input_tensor)

    # Get probabilities
    probabilities = torch.nn.functional.softmax(output[0], dim=0)

    # Get top prediction
    confidence, class_id = torch.max(probabilities, dim=0)

    labels = weights.meta["categories"]
    predicted_label = labels[class_id.item()]

    return {
        "predicted_label": predicted_label,
        "confidence": round(confidence.item(), 4)
    }