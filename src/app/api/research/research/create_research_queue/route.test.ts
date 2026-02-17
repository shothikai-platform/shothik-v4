
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist mocks
const { mockFindById, mockFindByIdAndUpdate, mockSave, mockJson } = vi.hoisted(() => {
  return {
    mockFindById: vi.fn(),
    mockFindByIdAndUpdate: vi.fn(),
    mockSave: vi.fn(),
    mockJson: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
  };
});

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

// Mock Mongoose model
vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findById: mockFindById,
      findByIdAndUpdate: mockFindByIdAndUpdate,
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => {
  return {
    NextResponse: class {
      static json = mockJson;
      constructor(body, options) {
        this.body = body;
        this.options = options;
      }
    }
  };
});

// Import AFTER mocks
import { POST } from './route';

describe('POST /api/research/research/create_research_queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a user message using findByIdAndUpdate for optimization', async () => {
    const mockChatId = 'chat123';
    const mockQuery = 'test query';
    const mockChat = { _id: mockChatId };

    // Mock findByIdAndUpdate to return a chat (success)
    mockFindByIdAndUpdate.mockResolvedValue(mockChat);

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
      method: 'POST',
      body: JSON.stringify({ chat: mockChatId, query: mockQuery, config: {} }),
    });

    const response = await POST(request);

    // Verify findById was NOT called (Optimization check)
    expect(mockFindById).not.toHaveBeenCalled();

    // Verify findByIdAndUpdate was called with correct args
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      mockChatId,
      {
        $push: {
          messages: {
            role: 'user',
            content: mockQuery,
            timestamp: expect.any(Date)
          }
        }
      },
      { runValidators: true }
    );

    // Verify save was NOT called
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('should return 404 if chat not found', async () => {
    // Mock findByIdAndUpdate to return null (not found)
    mockFindByIdAndUpdate.mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
      method: 'POST',
      body: JSON.stringify({ chat: 'invalid-id', query: 'test' }),
    });

    const response = await POST(request);

    expect(mockJson).toHaveBeenCalledWith({ error: 'Chat not found' }, { status: 404 });
  });
});
