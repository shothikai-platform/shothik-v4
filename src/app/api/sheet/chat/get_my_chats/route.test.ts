import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

// Mock dbConnect
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

const { mockFind, mockSort, mockLean } = vi.hoisted(() => {
  const mockLean = vi.fn();
  const mockSort = vi.fn().mockReturnValue({ lean: mockLean });
  const mockFind = vi.fn().mockReturnValue({ sort: mockSort });
  return { mockFind, mockSort, mockLean };
});

// Mock SheetSession model
vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      find: mockFind,
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => {
    return {
        NextResponse: {
            json: vi.fn((data, options) => {
                return {
                    status: options?.status || 200,
                    json: async () => data,
                };
            })
        }
    };
});

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch sheet sessions using lean() and return formatted objects', async () => {
    // Mock database response from lean()
    const mockSessions = [
      {
        _id: 'session-id-1',
        title: 'Session 1',
        status: 'active',
        updatedAt: new Date('2024-01-01'),
      },
      {
        _id: 'session-id-2',
        title: 'Session 2',
        status: 'completed',
        updatedAt: new Date('2024-01-02'),
      },
    ];

    mockLean.mockResolvedValue(mockSessions);

    const req = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
    const response = await GET(req) as any;

    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0].id).toBe('session-id-1');
    expect(data[0]._id).toBe('session-id-1');
    expect(data[0].title).toBe('Session 1');
    expect(data[1].id).toBe('session-id-2');
    expect(data[1]._id).toBe('session-id-2');
  });

  it('should return 500 on database error', async () => {
    mockLean.mockRejectedValue(new Error('Database Error'));

    const req = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
    const response = await GET(req) as any;

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Internal Server Error');
  });
});
