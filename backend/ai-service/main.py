
import os
import shutil
from fastapi import FastAPI, UploadFile, File
from inference_sdk import (
    InferenceHTTPClient,
    InferenceConfiguration
)

app = FastAPI()

# Roboflow API key
ROBOFLOW_API_KEY = "4qUi3gFsvhcGDX6eY4bW"

# Roboflow client
client = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key=ROBOFLOW_API_KEY
)

configuration = InferenceConfiguration(
    confidence_threshold=0.1,
    api_key_transport="header"
)


@app.get("/")
def home():
    return {
        "message": "LandSafe AI Service is running"
    }


@app.post("/detect-landslide")
async def detect_landslide(file: UploadFile = File(...)):

    # Save uploaded image temporarily
    image_path = "uploaded_image.jpg"

    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Send image to Roboflow
    with client.use_configuration(configuration):
        result = client.infer(
            image_path,
            model_id="landslide-detection-yx051/1"
        )

    # Remove temporary image
    os.remove(image_path)

    return {
        "success": True,
        "filename": file.filename,
        "predictions": result.get("predictions", [])
    }