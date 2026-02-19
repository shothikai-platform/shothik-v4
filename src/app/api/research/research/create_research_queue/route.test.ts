import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Hoist mock functions
const {
  mockFindById,
  mockFindOne,
  mockFindByIdAndUpdate,
  mockFindOneAndUpdate,
  mockSave
} = vi.hoisted(() => {
  return {
    mockFindById: vi.fn(),
    mockFindOne: vi.fn(),
    mockFindByIdAndUpdate: vi.fn(),
    mockFindOneAndUpdate: vi.fn(),
    mockSave: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findById: mockFindById,
      findOne: mockFindOne,
      findByIdAndUpdate: mockFindByIdAndUpdate,
      findOneAndUpdate: mockFindOneAndUpdate,
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => {
  class MockNextResponse {
    status: number;
    headers: any;
    body: any;

    constructor(body: any, init?: any) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = init?.headers;
    }

    static json(body: any, init?: any) {
        const res = new MockNextResponse(body, init);
        return res;
    }
  }
  return {
    NextResponse: MockNextResponse,
  };
});


// Helper for Mock Request
function createMockRequest(body: any) {
  return {
    json: async () => body,
  } as unknown as Request;
}

import { getAuthenticatedUser } from '@/lib/server-auth';
// import ResearchChat from '@/models/ResearchChat'; // Imported via mock

describe('POST /api/research/research/create_research_queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = createMockRequest({ chat: 'chat1', query: 'test query', config: {} });
    const response = await POST(request);

    // This expectation will FAIL with current code
    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user (IDOR prevention)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });

    // Mock findById to simulate chat exists (for insecure check)
    mockFindById.mockResolvedValue({
      _id: 'chat1',
      userId: 'user1',
      messages: [],
      save: mockSave
    });

    // Mock findOne to simulate chat NOT found for user2 (for secure check)
    mockFindOne.mockResolvedValue(null);

    const request = createMockRequest({ chat: 'chat1', query: 'test query', config: {} });
    const response = await POST(request);

    // This expectation will FAIL with current code
    expect(response.status).toBe(404);
  });
});
