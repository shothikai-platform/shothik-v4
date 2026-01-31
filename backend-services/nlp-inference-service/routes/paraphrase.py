
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
import logging
import time

# Import our services
from services.model_loader import ModelLoader
from services.paraphrase_engine import ParaphraseEngine
from services.text_processor import TextProcessor

logger = logging.getLogger(__name__)

router = APIRouter()

# --- Request/Response Models ---
class ParaphraseRequest(BaseModel):
    text: str = Field(..., max_length=5000, description="The text to paraphrase")
    mode: str = "standard"  # standard, fluency, formal, creative
    language: str = "English" # Added for Pivot Strategy
    num_variants: int = Field(1, ge=1, le=5, description="Number of variants to generate")
    sensitivity: float = Field(0.5, ge=0, le=1, description="Semantic sensitivity level")

class ParaphraseResponse(BaseModel):
    original: str
    paraphrased_variants: List[str]
    mode: str
    processing_time_ms: float
    entities_frozen: List[str] = []

# --- Dependencies ---
# These run on every request to get the singleton instances
def get_engine():
    try:
        # Load the models lazily (or return existing instances)
        para_model = ModelLoader.load_ctranslate2_model("/models/paraphrase")
        trans_model = ModelLoader.load_ctranslate2_model("/models/translation")
        
        return ParaphraseEngine(para_model, trans_model)
    except Exception as e:
        logger.error(f"Engine Load Failed: {e}")
        raise HTTPException(status_code=503, detail="Paraphrase Engine Unavailable")

def get_processor():
    try:
        # Try loading SpaCy (optimistic), pass None if fails or memory pressure high
         spacy_pipeline = ModelLoader.load_spacy_model("en_core_web_sm")
         return TextProcessor(spacy_pipeline)
    except Exception:
        # Graceful degradation: Run processor without Stanza (Regex only)
        logger.warning("Stanza unavailable, running in Light Mode")
        return TextProcessor(None)

# --- Endpoints ---

@router.post("/paraphrase", response_model=ParaphraseResponse)
async def generate_paraphrase(
    request: ParaphraseRequest,
    engine: ParaphraseEngine = Depends(get_engine),
    processor: TextProcessor = Depends(get_processor)
):
    start_time = time.time()
    
    # 1. Input Validation
    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Input text cannot be empty")
        
    original_text = request.text
    
    # 2. Pre-Processing (The "STEAM" Layer)
    # A. Mask Quotes & Citations
    masked_data = processor.mask_immutable_content(original_text)
    working_text = masked_data["masked_text"]
    mapping = masked_data["mapping"]
    
    # B. Extract & Freeze Specialized Terms (Chemicals, etc)
    # This just informs us what was found; T5 handles the context if prompted right
    # For now, we return them in metadata.
    # Advanced: We could mask these too if strict freezing is required.
    frozen_entities = processor.extract_freeze_terms(original_text)
    
    # 3. Paraphrasing (Inference)
    try:
        variants = engine.generate_paraphrases(
            working_text, 
            mode=request.mode, 
            num_variants=request.num_variants,
            language=request.language
        )
    except Exception as e:
        logger.error(f"Inference Error: {e}")
        raise HTTPException(status_code=500, detail="Model Inference Failed")
    
    # 4. Post-Processing (Restore)
    # Restore the original quotes into the potentially altered text
    final_variants = []
    for var in variants:
        restored = processor.restore_masks(var, mapping)
        final_variants.append(restored)
        
    processing_time = (time.time() - start_time) * 1000
    
    return ParaphraseResponse(
        original=original_text,
        paraphrased_variants=final_variants,
        mode=request.mode,
        processing_time_ms=processing_time,
        entities_frozen=frozen_entities
    )
