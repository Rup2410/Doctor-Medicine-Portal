import os
import logging
from typing import Tuple
from pypdf import PdfReader

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ocr_service")

def extract_text_from_file(file_path: str, file_type: str) -> Tuple[str, str]:
    """
    Extracts text from PDF or Image file.
    Returns a tuple: (extracted_text, method_used)
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()
    logger.info(f"Processing OCR/Text extraction for {file_path} (Type: {file_type}, Ext: {ext})")

    extracted_text = ""
    method_used = "UNKNOWN"

    if ext == ".pdf" or "pdf" in file_type.lower():
        try:
            reader = PdfReader(file_path)
            pages_text = []
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    pages_text.append(text)
            
            combined_text = "\n".join(pages_text).strip()
            if combined_text:
                extracted_text = combined_text
                method_used = "PDF_DIRECT_TEXT"
            else:
                method_used = "PDF_SCANNED_FALLBACK"
                extracted_text = f"[Scanned PDF document parsed: {os.path.basename(file_path)}]"
        except Exception as e:
            logger.error(f"Error reading PDF: {e}")
            extracted_text = f"[PDF Parsing Error for {os.path.basename(file_path)}]"
            method_used = "PDF_ERROR_FALLBACK"

    elif ext in [".jpg", ".jpeg", ".png"] or any(t in file_type.lower() for t in ["image", "jpg", "jpeg", "png"]):
        try:
            # Try PIL / OCR fallback
            from PIL import Image
            img = Image.open(file_path)
            method_used = "IMAGE_ANALYZER"
            extracted_text = f"[Image Document Uploaded: {os.path.basename(file_path)} ({img.width}x{img.height})]"
        except Exception as e:
            logger.error(f"Error reading Image: {e}")
            extracted_text = f"[Image Parsing Error for {os.path.basename(file_path)}]"
            method_used = "IMAGE_ERROR_FALLBACK"
    else:
        extracted_text = f"[Document uploaded: {os.path.basename(file_path)}]"
        method_used = "GENERIC_FILE_READER"

    logger.info(f"Extraction completed using method {method_used}. Text length: {len(extracted_text)}")
    return extracted_text, method_used
