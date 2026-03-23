import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist mocks FIRST
const { mockLean, mockSort, mockFind, jsonMock } = vi.hoisted(() => {
  const lean = vi.fn();
  const sort = vi.fn().mockReturnValue({ lean });
  const find = vi.fn().mockReturnValue({ sort });
  const jsonMock = vi.fn((data: any) => {
    return {
      status: 200,
      json: async () => data,
    };
  });
  return { mockLean: lean, mockSort: sort, mockFind: find, jsonMock };
});

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/SheetSession', () => ({
  default: {
    find: mockFind,
  },
}));

vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: jsonMock,
    },
  };
});

import { GET } from './route';
import dbConnect from '@/lib/dbConnect';

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 and formatted sessions using .lean() optimization', async () => {
    // Arrange
    const mockSessions = [
      { _id: 'session1', userId: 'user1', title: 'Chat 1', updatedAt: '2023-01-01' },
      { _id: 'session2', userId: 'user1', title: 'Chat 2', updatedAt: '2023-01-02' },
    ];
    mockLean.mockResolvedValueOnce(mockSessions);

    const req = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');

    // Act
    const res = await GET(req) as any;
    const data = await res.json();

    // Assert
    expect(dbConnect).toHaveBeenCalled();
    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();

    // Verify _id is mapped to id
    expect(data).toHaveLength(2);
    expect(data[0].id).toBe('session1');
    expect(data[0]._id).toBe('session1');
    expect(data[1].id).toBe('session2');
    expect(data[1]._id).toBe('session2');
  });

  it('should return 500 on database error', async () => {
    // Arrange
    mockLean.mockRejectedValueOnce(new Error('Database error'));

    // Mock console.error to keep test output clean
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const req = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');

    // Act
    const res = await GET(req) as any;
    const data = await res.json();

    // Assert
    expect(consoleSpy).toHaveBeenCalled();
    expect(data).toEqual({ error: 'Internal Server Error' });

    consoleSpy.mockRestore();
  });
});
