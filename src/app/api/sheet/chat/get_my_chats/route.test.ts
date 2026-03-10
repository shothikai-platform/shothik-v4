import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

const { mockFind, mockSort, mockLean } = vi.hoisted(() => {
  const lean = vi.fn();
  const sort = vi.fn(() => ({ lean }));
  const find = vi.fn(() => ({ sort }));
  return {
    mockFind: find,
    mockSort: sort,
    mockLean: lean,
  };
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
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
  },
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all sessions sorted by newest updated as plain JS objects using lean()', async () => {
    const mockSessions = [
      { _id: 'session1', title: 'Chat 1', updatedAt: '2023-01-02' },
      { _id: 'session2', title: 'Chat 2', updatedAt: '2023-01-01' },
    ];

    mockLean.mockResolvedValue(mockSessions);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();

    expect(response.status).toBe(200);
    expect((response as any).data).toEqual(mockSessions);
  });

  it('should return 500 on database error', async () => {
    mockFind.mockImplementationOnce(() => {
      throw new Error('Database connection failed');
    });

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(500);
    expect((response as any).data).toEqual({ error: 'Internal Server Error' });
  });
});
