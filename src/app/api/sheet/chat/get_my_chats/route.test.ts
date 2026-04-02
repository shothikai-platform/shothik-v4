import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

const { mockFind, mockSort, mockLean } = vi.hoisted(() => {
  const leanFn = vi.fn();
  const sortFn = vi.fn().mockReturnValue({ lean: leanFn });
  const findFn = vi.fn().mockReturnValue({ sort: sortFn });
  return {
    mockFind: findFn,
    mockSort: sortFn,
    mockLean: leanFn,
  };
});

vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      find: mockFind,
    },
  };
});

const { mockJson } = vi.hoisted(() => {
  return { mockJson: vi.fn() };
});

vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: mockJson,
    },
  };
});

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all sessions sorted by newest updated and map to include id', async () => {
    mockLean.mockResolvedValue([
      { _id: 'session1', title: 'Session 1', userId: 'user1' },
      { _id: 'session2', title: 'Session 2', userId: 'user2' }
    ]);

    // We need to implement dummy NextResponse.json behaviour
    mockJson.mockImplementation((data, options) => {
        return {
            status: options?.status || 200,
            json: async () => data
        };
    });

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats')) as any;
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.length).toBe(2);
    expect(data[0].id).toBe('session1'); // Verifying mapped id
    expect(data[0]._id).toBe('session1');
    expect(data[0].title).toBe('Session 1');
  });

  it('should handle internal server error', async () => {
    mockFind.mockImplementation(() => {
      throw new Error('Database error');
    });

    mockJson.mockImplementation((data, options) => {
      return {
          status: options?.status || 200,
          json: async () => data
      };
    });

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats')) as any;
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toBe('Internal Server Error');
  });
});
