import { describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import SheetSession from '@/models/SheetSession';
import { NextResponse } from 'next/server';

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

const { mockFind, mockSort, mockLean } = vi.hoisted(() => {
  return {
    mockFind: vi.fn(),
    mockSort: vi.fn(),
    mockLean: vi.fn(),
  };
});

vi.mock('@/models/SheetSession', () => ({
  default: {
    find: mockFind,
  },
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
  it('should return list of sessions and map _id to id', async () => {
    // Setup mock chain
    mockFind.mockReturnValue({ sort: mockSort });
    mockSort.mockReturnValue({ lean: mockLean });

    const mockSessions = [
      { _id: 'session1', title: 'Chat 1' },
      { _id: 'session2', title: 'Chat 2' },
    ];
    mockLean.mockResolvedValue(mockSessions);

    const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
    const response = await GET(request);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(200);

    const data = await response.json();

    // Check that it calls find correctly
    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });

    // Check that it returns formatted data
    expect(data).toHaveLength(2);
    expect(data[0]).toEqual({ _id: 'session1', id: 'session1', title: 'Chat 1' });
    expect(data[1]).toEqual({ _id: 'session2', id: 'session2', title: 'Chat 2' });
  });

  it('should return 500 on database error', async () => {
    mockFind.mockReturnValue({ sort: mockSort });
    mockSort.mockReturnValue({ lean: mockLean });

    mockLean.mockRejectedValue(new Error('DB Error'));

    const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
    const response = await GET(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: 'Internal Server Error' });
  });
});
