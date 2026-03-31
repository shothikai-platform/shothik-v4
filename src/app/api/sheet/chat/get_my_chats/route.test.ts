import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

const { mockFind, mockSort, mockLean } = vi.hoisted(() => {
  const mockLean = vi.fn();
  const mockSort = vi.fn().mockReturnValue({ lean: mockLean });
  const mockFind = vi.fn().mockReturnValue({ sort: mockSort });
  return { mockFind, mockSort, mockLean };
});

// Mock Mongoose model
vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      find: mockFind,
    },
  };
});

// Mock NextResponse
const { mockJson } = vi.hoisted(() => ({
  mockJson: vi.fn((data, options) => {
    return {
      status: options?.status || 200,
      json: async () => data,
    };
  })
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: mockJson,
  },
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and format sessions using .lean()', async () => {
    const mockSessions = [
      {
        _id: 'session1',
        title: 'Test Session 1',
        status: 'active',
        userId: 'user1',
        updatedAt: '2023-01-01T00:00:00Z'
      },
      {
        _id: 'session2',
        title: 'Test Session 2',
        status: 'active',
        userId: 'user1',
        updatedAt: '2023-01-02T00:00:00Z'
      }
    ];

    mockLean.mockResolvedValue(mockSessions);

    const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
    const response = await GET(request) as any;

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveLength(2);
    expect(data[0].id).toBe('session1');
    expect(data[0]._id).toBe('session1');
    expect(data[1].id).toBe('session2');
    expect(data[1]._id).toBe('session2');

    // Verify .lean() was called
    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();
  });

  it('should return 500 on database error', async () => {
    mockFind.mockImplementationOnce(() => {
      throw new Error('Database Error');
    });

    const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
    const response = await GET(request) as any;

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: 'Internal Server Error' });
  });
});
