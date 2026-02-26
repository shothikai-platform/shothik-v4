import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

const { mockFind, mockSelect, mockSort, mockLean } = vi.hoisted(() => {
  const lean = vi.fn();
  const sort = vi.fn().mockReturnValue({ lean });
  const select = vi.fn().mockReturnValue({ sort });
  const find = vi.fn().mockReturnValue({ select });
  return { mockFind: find, mockSelect: select, mockSort: sort, mockLean: lean };
});

vi.mock('@/models/SheetSession', () => ({
  default: {
    find: mockFind,
  },
}));

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock NextResponse
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  return {
    ...actual,
    NextResponse: {
      json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
    },
  };
});

process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response: any = await GET(request);

    expect(response.status).toBe(401);
    expect(response.data).toEqual({ error: 'Unauthorized' });
  });

  it('should return user sessions if authenticated', async () => {
    const mockUser = { _id: 'user123', email: 'test@example.com' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSessions = [
      { _id: 'session1', title: 'Session 1', status: 'active', updatedAt: new Date(), createdAt: new Date() },
      { _id: 'session2', title: 'Session 2', status: 'completed', updatedAt: new Date(), createdAt: new Date() },
    ];

    mockLean.mockResolvedValue(mockSessions);

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response: any = await GET(request);

    expect(response.status).toBe(200);
    expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });
    expect(mockSelect).toHaveBeenCalledWith('_id title status updatedAt createdAt');
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();

    // Verify response mapping
    expect(response.data).toHaveLength(2);
    expect(response.data[0]).toEqual({
      ...mockSessions[0],
      id: 'session1',
      name: 'Session 1',
    });
  });
});
