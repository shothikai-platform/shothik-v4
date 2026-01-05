# Content Analysis Service

A new microservice for advanced content analysis to complement the Shothik AI platform.

## Overview

The Content Analysis Service provides advanced text analysis capabilities including:

- Sentiment analysis
- Topic extraction
- Keyword analysis
- Readability scoring
- Entity recognition
- Content categorization

## Project Structure

```
content-analysis-service/
├── src/
│   ├── main.py                # FastAPI application
│   ├── routes/
│   │   ├── analysis.py         # Analysis endpoints
│   │   └── insights.py         # Insights endpoints
│   ├── services/
│   │   ├── sentiment_analyzer.py
│   │   ├── topic_extractor.py
│   │   ├── keyword_analyzer.py
│   │   ├── readability_scorer.py
│   │   └── entity_recognizer.py
│   ├── models/
│   │   ├── request_models.py    # Pydantic request models
│   │   └── response_models.py   # Pydantic response models
│   └── utils/
│       ├── text_preprocessor.py
│       └── helpers.py
├── tests/
│   ├── unit/
│   └── integration/
├── scripts/
│   └── setup_models.sh
├── models/
│   └── (ML model files)
├── requirements.txt
├── requirements-dev.txt
├── Dockerfile
└── README.md
```

## Features

### 1. Sentiment Analysis
- Positive/Negative/Neutral classification
- Emotion detection (anger, joy, sadness, etc.)
- Sentiment scoring (-1 to +1 scale)

### 2. Topic Extraction
- Automatic topic identification
- Key phrase extraction
- Content tagging

### 3. Keyword Analysis
- Keyword density analysis
- TF-IDF scoring
- Keyword suggestions

### 4. Readability Scoring
- Flesch-Kincaid readability tests
- Grade level assessment
- Reading time estimation

### 5. Entity Recognition
- Named entity recognition (people, organizations, locations)
- Custom entity types
- Entity linking

## API Endpoints

### Analysis Endpoints

`POST /api/v1/analyze` - Comprehensive content analysis
`POST /api/v1/sentiment` - Sentiment analysis only
`POST /api/v1/topics` - Topic extraction only
`POST /api/v1/keywords` - Keyword analysis only
`POST /api/v1/readability` - Readability scoring only
`POST /api/v1/entities` - Entity recognition only

### Insights Endpoints

`POST /api/v1/insights` - Generate content insights
`POST /api/v1/compare` - Compare multiple content pieces
`POST /api/v1/trends` - Identify content trends

## Integration with Shothik Platform

This service is designed to integrate seamlessly with the existing Shothik AI platform:

1. **Natural Language Integration**: Extend the natural language parser to recognize analysis commands
2. **API Gateway**: Add routes to the main platform API gateway
3. **Frontend Components**: Create UI components for displaying analysis results
4. **Workflow Integration**: Incorporate analysis into existing content workflows

## Example Usage

### Natural Language Commands

```
"analyze the sentiment of this article"
"extract key topics from this document"
"what are the main keywords in this text?"
"check the readability of this content"
"identify entities in this report"
```

### API Request Example

```python
import requests

text = "Your content to analyze goes here..."

response = requests.post("http://api.shothik.ai/v1/analyze", json={
    "text": text,
    "language": "en",
    "analysis_types": ["sentiment", "topics", "keywords"]
})

analysis_result = response.json()
print(analysis_result)
```

### API Response Example

```json
{
  "text": "Your content to analyze goes here...",
  "language": "en",
  "analysis": {
    "sentiment": {
      "score": 0.75,
      "label": "positive",
      "emotions": {
        "joy": 0.42,
        "trust": 0.38,
        "anticipation": 0.25
      }
    },
    "topics": [
      {"topic": "technology", "confidence": 0.92},
      {"topic": "innovation", "confidence": 0.85}
    ],
    "keywords": [
      {"keyword": "AI", "score": 0.88, "density": 0.05},
      {"keyword": "machine learning", "score": 0.76, "density": 0.03}
    ],
    "readability": {
      "flesch_kincaid": 62.3,
      "grade_level": 8.7,
      "reading_time_seconds": 125
    },
    "entities": [
      {"entity": "Shothik AI", "type": "ORGANIZATION", "confidence": 0.98},
      {"entity": "Bangladesh", "type": "LOCATION", "confidence": 0.95}
    ]
  },
  "processing_time_ms": 425
}
```

## Technical Requirements

### Backend
- Python 3.9+
- FastAPI
- PyTorch/HuggingFace for ML models
- SpaCy for NLP processing
- Scikit-learn for traditional ML

### Frontend Integration
- TypeScript
- React hooks for API integration
- Context API or Redux for state management

### Deployment
- Docker containerization
- Kubernetes orchestration
- GPU support for ML inference
- Auto-scaling based on demand

## Development Setup

1. Clone the repository
2. Install Python dependencies: `pip install -r requirements.txt`
3. Install development dependencies: `pip install -r requirements-dev.txt`
4. Download ML models: `./scripts/setup_models.sh`
5. Start the development server: `uvicorn src.main:app --reload`

## Testing

The service includes comprehensive testing:

- Unit tests for individual components
- Integration tests for API endpoints
- Performance tests for response times
- Load tests for concurrent requests

## Future Enhancements

- Multi-language support
- Custom analysis profiles
- Domain-specific analysis (academic, business, technical)
- Real-time analysis for streaming content
- Content quality scoring
- Plagiarism detection integration
- SEO optimization suggestions

## Contributing

Contributions are welcome! Please follow the existing code style and submit pull requests with comprehensive tests.

## License

This project is licensed under the MIT License.