import os
import re
import json
import logging
from typing import Dict, Any

logger = logging.getLogger("extraction_service")

SYSTEM_PROMPT = """
You are an expert pharmaceutical document data extractor for a Doctor's portal.
Analyze the provided document text and extract structured information in JSON format.

JSON Schema required:
{
  "company": {
    "value": "Company Name",
    "confidence": 0.95
  },
  "medicines": [
    {
      "medicine_name": "Medicine Name",
      "composition": "Chemical composition details",
      "description": "Indication and usage details",
      "confidence": 0.92
    }
  ],
  "mr": {
    "name": "Medical Representative Name",
    "contact_number": "MR Phone Number",
    "confidence": 0.90
  }
}

RULES:
- Do NOT hallucinate information not present in the document.
- If a field (e.g. MR contact) is not present in the text, set value to null and confidence to 0.0.
- Return ONLY valid raw JSON. No markdown code blocks.
"""

def extract_structured_data(raw_text: str, file_name: str = "") -> Dict[str, Any]:
    """
    Extracts structured company, medicine, and MR details from raw text.
    Uses Gemini API if GEMINI_API_KEY is configured; otherwise uses Heuristic Pattern Extractor.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    
    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            prompt = f"{SYSTEM_PROMPT}\n\nDocument File Name: {file_name}\nDocument Raw Content:\n{raw_text}"
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            cleaned_text = response.text.strip()
            if cleaned_text.startswith("```"):
                cleaned_text = re.sub(r"^```json\s*", "", cleaned_text)
                cleaned_text = re.sub(r"^```\s*", "", cleaned_text)
                cleaned_text = re.sub(r"```$", "", cleaned_text).strip()
            
            parsed = json.loads(cleaned_text)
            logger.info("Successfully extracted data using Gemini API.")
            return parsed
        except Exception as e:
            logger.warning(f"Gemini API extraction attempt failed or not available: {e}. Falling back to Rule-Based Extractor.")

    # Rule-Based Heuristic Extraction Fallback
    return _rule_based_extraction(raw_text, file_name)


def _rule_based_extraction(raw_text: str, file_name: str) -> Dict[str, Any]:
    """
    Intelligent heuristic regex extractor for pharmaceutical document text.
    """
    text = raw_text or ""
    
    # 1. Company Extraction
    company_name = None
    company_conf = 0.4
    
    known_companies = [
        "Sun Pharma", "Cipla", "Mankind Pharma", "Torrent Pharmaceuticals", 
        "Lupin Limited", "Dr. Reddy's Laboratories", "Abbott", "GlaxoSmithKline", 
        "Pfizer", "Zydus Healthcare", "Alkem Laboratories", "Mankind"
    ]
    
    for comp in known_companies:
        if re.search(r'\b' + re.escape(comp) + r'\b', text, re.IGNORECASE):
            company_name = comp
            company_conf = 0.95
            break
            
    if not company_name:
        company_match = re.search(r'(?:Company|Pharma|Manufacturer|Lab|Laboratories):\s*([A-Za-z0-9\s\.\-&]+)', text, re.IGNORECASE)
        if company_match:
            company_name = company_match.group(1).strip()
            company_conf = 0.85
        elif "SunPharma" in file_name or "Sun_Pharma" in file_name:
            company_name = "Sun Pharma"
            company_conf = 0.80
        elif "Cipla" in file_name:
            company_name = "Cipla"
            company_conf = 0.80
        elif "Mankind" in file_name:
            company_name = "Mankind Pharma"
            company_conf = 0.80

    # 2. Medical Representative Extraction
    mr_name = None
    mr_contact = None
    mr_conf = 0.4
    
    mr_match = re.search(r'(?:MR|Medical Representative|Representative|Rep):\s*([A-Za-z\s]+)', text, re.IGNORECASE)
    if mr_match:
        mr_name = mr_match.group(1).strip()
        mr_conf = 0.85
        
    phone_match = re.search(r'(\+?\d{1,3}[\s-]?)?\(?\d{3,5}\)?[\s-]?\d{3,5}[\s-]?\d{3,5}', text)
    if phone_match:
        mr_contact = phone_match.group(0).strip()
        if not mr_name:
            mr_conf = 0.70

    # 3. Medicines Extraction
    medicines = []
    
    # Try parsing patterns like "Medicine: XYZ-500", "Product: Ciplox", etc.
    med_matches = re.findall(r'(?:Medicine|Product|Brand|Drug):\s*([A-Za-z0-9\s\-\/\(\)]+)', text, re.IGNORECASE)
    comp_matches = re.findall(r'(?:Composition|Formulation|Ingredients):\s*([A-Za-z0-9\s\-\/\%\,\+\.]+)', text, re.IGNORECASE)
    desc_matches = re.findall(r'(?:Description|Indication|Usage|Details):\s*([^\n]+)', text, re.IGNORECASE)

    if med_matches:
        for idx, med in enumerate(med_matches):
            name = med.strip()
            comp = comp_matches[idx].strip() if idx < len(comp_matches) else None
            desc = desc_matches[idx].strip() if idx < len(desc_matches) else None
            medicines.append({
                "medicine_name": name,
                "composition": comp,
                "description": desc,
                "confidence": 0.88
            })

    # If no explicit "Medicine:" label found, scan text for dosage pattern keywords (e.g. "Paracetamol 500mg", "Ciplox 500")
    if not medicines:
        dosage_matches = re.findall(r'([A-Z][A-Za-z0-9\s\-]+(?:\d+\s*(?:mg|g|mcg|ml|IU|SR|Gel|Tablet|Inhaler)))', text)
        if dosage_matches:
            for item in dosage_matches[:3]:
                medicines.append({
                    "medicine_name": item.strip(),
                    "composition": f"Extracted details for {item.strip()}",
                    "description": "Prescribed pharmaceutical medicine record extracted from document.",
                    "confidence": 0.75
                })

    # Fallback default item if text is completely unstructured
    if not medicines:
        base_name = os.path.splitext(file_name)[0].replace("_", " ").replace("-", " ")
        medicines.append({
            "medicine_name": base_name if base_name else "New Medicine Record",
            "composition": "Extracted from uploaded document",
            "description": "Please review and edit the details extracted from the document.",
            "confidence": 0.50
        })

    return {
        "company": {
            "value": company_name if company_name else "Pharma Company",
            "confidence": company_conf
        },
        "medicines": medicines,
        "mr": {
            "name": mr_name if mr_name else "Medical Representative",
            "contact_number": mr_contact if mr_contact else "",
            "confidence": mr_conf
        }
    }
