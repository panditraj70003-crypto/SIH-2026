from fastapi import FastAPI, UploadFile, File, Form

app = FastAPI(
    title="LandSafe AI Verification Service"
)


@app.get("/")
def home():
    return {
        "success": True,
        "message": "AI service is running"
    }


@app.post("/verify")
async def verify_report(
    image: UploadFile = File(...),
    description: str = Form(...)
):
    return {
        "success": True,
        "message": "AI verification endpoint working",
        "filename": image.filename,
        "description": description,
        "ai_status": "needs_more_evidence",
        "ai_confidence": 0.0
    }

from pydantic import BaseModel


class TextRequest(BaseModel):
    description: str


@app.post("/verify-text")
async def verify_text(request: TextRequest):
    return {
        "success": True,
        "message": "Node.js connected to AI service",
        "description": request.description,
        "ai_status": "needs_more_evidence",
        "ai_confidence": 0.0
    }