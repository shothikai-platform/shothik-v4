import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

// Setup hoisted mock for chained Mongoose methods
const { mockSort, mockLean } = vi.hoisted(() => {
  return {
    mockSort: vi.fn(),
    mockLean: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      find: vi.fn().mockReturnValue({
        sort: mockSort.mockReturnValue({
          lean: mockLean
        })
      })
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
  },
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return lean sessions', async () => {
    const mockSessions = [{ _id: '1', title: 'Test Session' }];
    mockLean.mockResolvedValue(mockSessions);

    const req = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
    const response = await GET(req);

    expect(response.status).toBe(200);
    expect((response as any).data).toEqual(mockSessions);
    expect(mockLean).toHaveBeenCalled(); // Verify .lean() was called!
  });
});
