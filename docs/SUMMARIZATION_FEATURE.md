# Summarization Feature Documentation

## Overview

The summarization feature adds text summarization capabilities to the Shothik AI platform. It allows users to generate concise summaries of longer texts with different length options.

## Technical Implementation

### Frontend Service

The frontend service is located at [`src/services/summarize.service.ts`](src/services/summarize.service.ts) and provides:

- `summarizeText()`: Main function to send text to the backend for summarization
- `getSummaryStatistics()`: Function to get statistics about the summarization process

### Backend Service

The backend implementation extends the existing paraphrase service at [`backend-services/nlp-inference-service/routes/paraphrase.py`](backend-services/nlp-inference-service/routes/paraphrase.py):

- New endpoint: `POST /api/v1/summarize`
- Uses the existing paraphrase engine with specialized prompts for summarization
- Supports three length options: short, medium, long

### Natural Language Processing

The natural language parser has been extended to recognize summarization commands:

- Natural language triggers: "summarize", "summary", "sum up", "tl;dr", etc.
- Slash command: `/summarize [topic] [--short|--long]`
- Length detection: Automatically detects preferred summary length from context

## Usage Examples

### Natural Language

```
"summarize this article about climate change"
"give me a brief summary of the report"
"tl;dr of the research paper"
"summarize the meeting notes in detail"
```

### Slash Commands

```
/summarize climate change --short
/summarize annual report -l
/summarize the document
```

## API Specification

### Request

```typescript
interface SummarizeRequest {
  text: string;              // Text to summarize
  length: "short" | "medium" | "long";  // Desired summary length
  language: string;          // Language of the text
}
```

### Response

```typescript
interface SummarizeResponse {
  summary: string;           // Generated summary
  original_length: number;   // Length of original text
  summary_length: number;    // Length of generated summary
  processing_time_ms: number;// Processing time in milliseconds
}
```

## Integration Points

### Frontend Integration

1. **Natural Language Parser**: Updated to recognize summarization commands
2. **UI Components**: Can be integrated with existing text editor components
3. **API Client**: Uses the new summarize service

### Backend Integration

1. **Route**: Added to existing paraphrase router
2. **Engine**: Reuses existing paraphrase engine with summarization prompts
3. **Validation**: Added input validation and error handling

## Error Handling

The service includes comprehensive error handling:

- Empty text validation
- Text length limits (10,000 character maximum)
- Model inference error handling
- Input validation and sanitization

## Performance Considerations

- **Text Length Limit**: 10,000 characters maximum
- **Processing Time**: Varies by text length and summary length option
- **Memory Usage**: Optimized to handle multiple concurrent requests

## Future Enhancements

- Support for additional languages
- Custom summary length specifications
- Domain-specific summarization (academic, business, technical)
- Abstractive vs extractive summarization options

## Testing

The feature should be tested with:

- Various text lengths (short, medium, long)
- Different languages
- Edge cases (empty text, very long text)
- Concurrent requests

## Documentation Updates

This feature has been integrated into:

- Natural language parser documentation
- API documentation
- User interface guidelines
- Error handling documentation