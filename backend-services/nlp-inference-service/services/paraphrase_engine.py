
import logging
import time
from typing import List, Dict
from .model_loader import ModelLoader

logger = logging.getLogger(__name__)

class ParaphraseEngine:
    def __init__(self, paraphrase_model, translation_model=None, tokenizer_wrapper=None):
        # Paraphrase Model (T5)
        self.para_model = paraphrase_model["model"]
        self.para_tokenizer = paraphrase_model["tokenizer"]
        self.mock_mode = paraphrase_model.get("mock", False)
        
        # Translation Model (NLLB)
        self.trans_model = translation_model["model"] if translation_model else None
        self.trans_tokenizer = translation_model["tokenizer"] if translation_model else None
        
        # Language Mapping (Simple MVP map - expand for 200 langs)
        self.lang_map = {
            "English": "eng_Latn",
            "Bengali": "ben_Beng",
            "Spanish": "spa_Latn",
            "French": "fra_Latn",
            "German": "deu_Latn",
            "Hindi": "hin_Deva",
            # Fallback
            "default": "eng_Latn"
        }

    def _translate(self, text: str, src_lang: str, tgt_lang: str) -> str:
        """
        Translates text using NLLB-200.
        """
        if not self.trans_model or self.mock_mode:
            return f"[MOCK TRANS {tgt_lang}] {text}"

        # NLLB requires 'src_lang' to be set in tokenizer
        # And we force the target language token as the first token
        target_token = self.lang_map.get(tgt_lang, "eng_Latn")
        
        # Tokenize with source language hint (if supported by tokenizer wrapper)
        tokens = self.trans_tokenizer.tokenize(text)
        
        # Translate
        # target_prefix=[target_token] forces the output language
        results = self.trans_model.translate_batch(
            [tokens],
            target_prefix=[[target_token]],
            beam_size=3
        )
        
        decoded = self.trans_tokenizer.convert_tokens_to_string(results[0].hypotheses[0])
        return decoded.strip()

    def generate_paraphrases(self, text: str, mode: str = "standard", num_variants: int = 1, language: str = "English") -> List[str]:
        """
        Runs the Paraphrase Pipeline:
        1. If English: Direct T5
        2. If Other: Pivot (Native -> Eng -> T5 -> Native)
        """
        if self.mock_mode:
            logger.info(f"Generating MOCK paraphrase variants (Lang: {language}).")
            return [
                f"[MOCK {mode} - {language}] {text}",
                f"[MOCK CREATIVE - {language}] {text} (var 2)"
            ][:num_variants]

        if not text:
            return []

        # PIVOT STRATEGY
        is_english = language.lower() in ["english", "en", "us", "uk"]
        
        # Step 1: Input Processing
        pivot_text = text
        if not is_english:
            logger.info(f"🔄 Pivot In: {language} -> English")
            pivot_text = self._translate(text, language, "English")
            logger.info(f"   ↳ {pivot_text}")

        # Step 2: Paraphrasing (English T5)
        # Construct Prompt
        prompt_map = {
            "standard": "Paraphrase this text to be clear and concise:",
            "fluency": "Fix grammar and improve the flow of this text:",
            "formal": "Rewrite this text in a professional, academic tone:",
            "creative": "Paraphrase this text creatively with varied vocabulary:",
        }
        instruction = prompt_map.get(mode, prompt_map["standard"])
        input_text = f"{instruction} {pivot_text}"

        tokens = self.para_tokenizer.tokenize(input_text)
        
        results = self.para_model.translate_batch(
            [tokens],
            beam_size=max(5, num_variants), 
            num_hypotheses=num_variants,
            max_decoding_length=256,
            sampling_topk=10 if mode == "creative" else 1,
            sampling_temperature=0.7 if mode == "creative" else 0,
        )
        
        # Decode English Paraphrases
        eng_variants = []
        for hypothesis in results[0].hypotheses:
            decoded_text = self.para_tokenizer.convert_tokens_to_string(hypothesis)
            cleaned = decoded_text.replace("<pad>", "").replace("</s>", "").strip()
            eng_variants.append(cleaned)

        # Step 3: Pivot Out (English -> Native)
        if is_english:
            return eng_variants
            
        logger.info(f"🔄 Pivot Out: English -> {language}")
        final_variants = []
        for var in eng_variants:
            trans = self._translate(var, "English", language)
            final_variants.append(trans)
        
        return final_variants
