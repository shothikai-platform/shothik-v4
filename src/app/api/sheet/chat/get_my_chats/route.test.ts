import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

const { mockFind, mockSort, mockLean } = vi.hoisted(() => {
  const lean = vi.fn();
  const sort = vi.fn().mockReturnValue({ lean });
  const find = vi.fn().mockReturnValue({ sort });
  return { mockFind: find, mockSort: sort, mockLean: lean };
});

vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      find: mockFind,
    },
  };
});

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({ json: async () => data, status: options?.status || 200 })),
  },
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all sessions and return them with id virtual', async () => {
    mockLean.mockResolvedValue([
      { _id: { toString: () => 'sess1' }, title: 'Session 1', status: 'active' },
      { _id: { toString: () => 'sess2' }, title: 'Session 2', status: 'active' },
    ]);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();

    // Check if the mapping worked correctly
    expect(data).toHaveLength(2);
    expect(data[0].id).toBe('sess1');
    expect(data[0].title).toBe('Session 1');
    expect(data[1].id).toBe('sess2');
  });

  it('should handle errors properly', async () => {
    mockLean.mockRejectedValue(new Error('DB Error'));

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal Server Error');
  });
});
