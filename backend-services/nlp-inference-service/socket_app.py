
import socketio
import logging
import os
import json
from pydantic import BaseModel, Field, ValidationError
from typing import List, Optional
from services.model_loader import ModelLoader
from services.paraphrase_engine import ParaphraseEngine
from services.text_processor import TextProcessor

logger = logging.getLogger(__name__)

# --- Configuration ---
# Secure CORS policy by loading allowed origins from an environment variable.
ALLOWED_ORIGINS_STR = os.getenv("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS: List[str] = [
    origin.strip() for origin in ALLOWED_ORIGINS_STR.split(",") if origin.strip()
]

# If ALLOWED_ORIGINS is not set, default to '*' but log a warning (Non-breaking change)
if not ALLOWED_ORIGINS:
    logger.warning("⚠️ ALLOWED_ORIGINS not set. Defaulting to '*' (Insecure). Set ALLOWED_ORIGINS env var for production.")
    ALLOWED_ORIGINS = "*"

# Create Socket.IO Server (Async) with Secure CORS
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins=ALLOWED_ORIGINS)

# Wrap in ASGI App
socket_app = socketio.ASGIApp(sio)

# --- Validation Schemas ---
class SocketParaphraseRequest(BaseModel):
    text: str = Field(..., max_length=5000, description="Text to paraphrase")
    mode: str = "standard"
    synonym: str = "basic"  # Maps to synonym_level
    freeze: str = ""       # Maps to freeze_words
    language: str = "English"
    eventId: str = Field(..., min_length=1, description="Event ID for tracking")

@sio.event
async def connect(sid, environ):
    logger.info(f"Socket Connected: {sid}")

@sio.event
async def disconnect(sid):
    logger.info(f"Socket Disconnected: {sid}")

@sio.event
async def paraphrase(sid, data):
    """
    Handles the 'paraphrase' event from Frontend.
    Data format expected: { "text": "...", "mode": "...", "eventId": "..." }
    """
    try:
        # Validate Input
        request = SocketParaphraseRequest(**data)

        text = request.text
        mode = request.mode
        synonym_level = request.synonym.lower()
        freeze_words = request.freeze
        language = request.language
        event_id = request.eventId

        logger.info(f"Received Paraphrase Request: Mode={mode} Len={len(text)}")

        # 1. Load Resources (Mock Mode handles missing models)
        para_model = ModelLoader.load_ctranslate2_model("/models/paraphrase")
        trans_model = ModelLoader.load_ctranslate2_model("/models/translation")
        
        engine = ParaphraseEngine(para_model, trans_model)
        
        # 2. Logic: Handle Freeze Words (Simple Mock)
        # In real engine, we mask these. Here we just ensure they appear in output.
        # We'll just pass plain text to engine for now.
        
        # 3. Generate
        variants = engine.generate_paraphrases(text, mode=mode, num_variants=1, language=language)
        best_variant = variants[0] if variants else ""
        
        # 4. Stream 'paraphrase-plain'
        await sio.emit('paraphrase-plain', best_variant, room=sid)
        await sio.emit('paraphrase-plain', ":end:", room=sid)
        
        # 5. Stream 'paraphrase-tagging' (Mock)
        # Determine density based on synonym level
        density_map = {"basic": 0.1, "intermediate": 0.3, "advanced": 0.5, "expert": 0.8}
        density = density_map.get(synonym_level, 0.2)
        
        words = best_variant.split()
        tagging_data = []
        for w in words:
            # Check if frozen
            w_clean = w.strip(".,?!").lower()
            is_frozen = w_clean in freeze_words.lower() if freeze_words else False
            
            tagging_data.append({
                "word": w,
                "type": "freeze" if is_frozen else "none",
                "synonyms": []
            })

        tagging_payload = {
            "index": 0,
            "eventId": event_id,
            "data": tagging_data
        }
        await sio.emit('paraphrase-tagging', import_json_dumps(tagging_payload), room=sid)
        await sio.emit('paraphrase-tagging', ":end:", room=sid)

        # 6. Stream 'paraphrase-synonyms' (Mock with Density)
        mock_synonyms = []
        for i, word in enumerate(words):
            # Only add synonyms for some words based on density
            if len(word) > 3 and (i % 10) / 10 < density:
                mock_synonyms.append({
                    "wordIndex": i, 
                    "word": word, 
                    "synonyms": [
                        f"{word}_alt1", f"{word}_alt2", f"{word}_creative"
                    ]
                })
        
        synonyms_payload = {
            "index": 0,
            "eventId": event_id,
            "data": mock_synonyms
        }
        await sio.emit('paraphrase-synonyms', import_json_dumps(synonyms_payload), room=sid)
        await sio.emit('paraphrase-synonyms', ":end:", room=sid)

    except ValidationError as e:
        logger.warning(f"Invalid Paraphrase Request: {e}")
        await sio.emit('paraphrase-error', {"message": "Invalid input", "details": e.errors()}, room=sid)
    except Exception as e:
        logger.error(f"Error processing paraphrase: {e}")
        await sio.emit('paraphrase-error', {"message": "Internal processing error"}, room=sid)

def import_json_dumps(obj):
    return json.dumps(obj)
