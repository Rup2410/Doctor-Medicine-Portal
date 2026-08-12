import os
import logging
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from ocr.ocr_service import extract_text_from_file
from extraction.extraction_service import extract_structured_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_service")

app = FastAPI(
    title="Doctor Portal OCR & AI Extraction Service",
    version="1.0.0",
    description="Microservice to extract raw text and structured pharmaceutical information from uploaded documents."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DocumentExtractionRequest(BaseModel):
    file_path: str
    file_name: str
    file_type: str

class ExtractionResponse(BaseModel):
    status: str
    file_name: str
    method_used: str
    raw_text: str
    extracted_data: Dict[str, Any]

@app.get("/health")
def health_check():
    return {"status": "UP", "service": "Doctor-Portal-AI-Service"}

@app.post("/extract", response_model=ExtractionResponse)
def process_document(request: DocumentExtractionRequest):
    logger.info(f"Received extraction request for file: {request.file_name} at {request.file_path}")
    
    if not os.path.exists(request.file_path):
        # Check relative path from project root if needed
        rel_path = os.path.join(os.getcwd(), "..", request.file_path)
        if os.path.exists(rel_path):
            request.file_path = rel_path
        else:
            raise HTTPException(status_code=404, detail=f"File not found at path: {request.file_path}")
            
    try:
        raw_text, method_used = extract_text_from_file(request.file_path, request.file_type)
        extracted_data = extract_structured_data(raw_text, request.file_name)
        
        return ExtractionResponse(
            status="SUCCESS",
            file_name=request.file_name,
            method_used=method_used,
            raw_text=raw_text,
            extracted_data=extracted_data
        )
    except Exception as e:
        logger.error(f"Error during document processing: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Extraction service error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
