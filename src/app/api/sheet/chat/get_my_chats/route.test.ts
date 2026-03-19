import { GET } from './route';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

// We need to carefully mock the chained Mongoose queries: find().sort().lean()
const mockLean = vi.fn();
const mockSort = vi.fn().mockReturnValue({ lean: mockLean });
const mockFind = vi.fn().mockReturnValue({ sort: mockSort });

vi.mock('@/models/SheetSession', () => ({
  default: {
    find: vi.fn(),
  },
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    SheetSession.find = mockFind;
  });

  it('should fetch all sessions sorted by updatedAt and use .lean() to optimize performance', async () => {
    const mockSessions = [
      {
        _id: { toString: () => 'session1_id' },
        title: 'Session 1',
        status: 'active',
        userId: 'user1',
      },
      {
        _id: { toString: () => 'session2_id' },
        title: 'Session 2',
        status: 'completed',
        userId: 'user2',
      },
    ];

    mockLean.mockResolvedValueOnce(mockSessions);

    const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
    const response = await GET(request);
    const json = await response.json();

    expect(dbConnect).toHaveBeenCalled();
    expect(SheetSession.find).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();

    // Verify mapping of _id to id
    expect(json).toHaveLength(2);
    expect(json[0].id).toBe('session1_id');
    expect(json[0].title).toBe('Session 1');
    expect(json[1].id).toBe('session2_id');
    expect(json[1].title).toBe('Session 2');
  });

  it('should handle errors gracefully and return 500 status', async () => {
    mockLean.mockRejectedValueOnce(new Error('Database error'));

    const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: 'Internal Server Error' });
  });
});
