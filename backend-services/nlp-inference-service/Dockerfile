# Production Cloud Build Dockerfile
# Optimized for caching and CPU performance

FROM python:3.11-slim

WORKDIR /app

# 1. Install System Dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Python Dependencies
# Install Torch CPU first to avoid 2GB+ CUDA download
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# 3. Setup Directories & Scripts
RUN mkdir -p /models/paraphrase \
    /models/translation \
    /models/vectors \
    /models/stanza_resources \
    /models/fasttext

COPY scripts /app/scripts

# 4. BAKING MODELS (The Heavy Step)
# Runs during Cloud Build. Downloads T5 (Paraphrase).
# We skip 'all' to avoid OOM on NLLB for now, and Stanza is unused (we use SpaCy).
RUN python /app/scripts/download_and_convert_models.py --step t5

# Download SpaCy Model (Used for Entity/Freeze)
RUN python -m spacy download en_core_web_sm

# 5. Copy Application Code
COPY . .

# 6. Runtime Configuration
ENV OMP_NUM_THREADS=1
ENV MKL_NUM_THREADS=1
ENV STANZA_RESOURCES_DIR=/models/stanza_resources
# Offline mode ensures we use baked models and don't download at runtime
ENV TRANSFORMERS_OFFLINE=1
ENV HF_HUB_OFFLINE=1

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1"]
