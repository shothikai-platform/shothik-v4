
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
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
    text: str
    mode: str = "standard"  # standard, fluency, formal, creative
    language: str = "English" # Added for Pivot Strategy
    num_variants: int = 1   # How many versions to generate?
    sensitivity: float = 0.5 # For semantic checking (future use)

class ParaphraseResponse(BaseModel):
    original: str
    paraphrased_variants: List[str]
    mode: str
    processing_time_ms: float
    entities_frozen: List[str] = []

class SummarizeRequest(BaseModel):
    text: str
    length: str = "medium"  # short, medium, long
    language: str = "English"

class SummarizeResponse(BaseModel):
    summary: str
    original_length: int
    summary_length: int
    processing_time_ms: float

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
            
            # Validate that we got the expected number of variants
            if len(variants) != request.num_variants:
                logger.warning(f"Expected {request.num_variants} variants but got {len(variants)}")
                # If we got at least one variant, continue with what we have
                if not variants:
                    raise HTTPException(status_code=500, detail="No paraphrase variants generated")
        except Exception as e:
            logger.error(f"Inference Error: {e}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Model Inference Failed: {str(e)}"
            )
    
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

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_text(
    request: SummarizeRequest,
    engine: ParaphraseEngine = Depends(get_engine),
    processor: TextProcessor = Depends(get_processor)
):
    start_time = time.time()
    logger.info(f"Starting summarization for text of length: {len(request.text)}")
    
    # 1. Input Validation
    if not request.text or len(request.text.strip()) == 0:
        logger.warning("Empty text provided for summarization")
        raise HTTPException(status_code=400, detail="Input text cannot be empty")
    
    # Validate text length
    if len(request.text) > 10000:  # 10k character limit
        logger.warning(f"Text too long for summarization: {len(request.text)} characters")
        raise HTTPException(
            status_code=400,
            detail="Text is too long for summarization (max 10,000 characters)"
        )
    
    original_text = request.text
    
    # 2. Determine summary length parameters
    length_map = {
        "short": {"max_tokens": 50, "ratio": 0.1},
        "medium": {"max_tokens": 150, "ratio": 0.3},
        "long": {"max_tokens": 300, "ratio": 0.5}
    }
    
    target_config = length_map.get(request.length, length_map["medium"])
    logger.info(f"Target summary length: {request.length}, config: {target_config}")
    
    # 3. Generate summary using paraphrase engine (repurposing for summarization)
    try:
        # Create summarization prompt based on length
        if request.length == "short":
            prompt = "Summarize this text in 1-2 sentences:"
        elif request.length == "medium":
            prompt = "Summarize this text in a short paragraph:"
        else:  # long
            prompt = "Summarize this text in detail:"
        
        input_text = f"{prompt} {original_text}"
        logger.debug(f"Summarization input prompt length: {len(input_text)}")
        
        # Use the paraphrase engine to generate summary
        summaries = engine.generate_paraphrases(
            input_text,
            mode="standard",
            num_variants=1,
            language=request.language
        )
        
        if not summaries:
            logger.warning("No summary generated")
            raise HTTPException(status_code=500, detail="No summary generated")
        
        summary = summaries[0]
        logger.info(f"Summary generated: {len(summary)} characters")
        
    except Exception as e:
        logger.error(f"Summarization Error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Summarization Failed: {str(e)}"
        )
    
    processing_time = (time.time() - start_time) * 1000
    logger.info(f"Summarization completed in {processing_time:.2f}ms")
    
    return SummarizeResponse(
        summary=summary,
        original_length=len(original_text),
        summary_length=len(summary),
        processing_time_ms=processing_time
    )
