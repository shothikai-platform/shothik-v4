
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock mongoose BEFORE importing anything else
vi.mock('mongoose', () => {
  const Schema = vi.fn();
  const model = vi.fn();
  return {
    default: {
      Schema,
      model,
      models: {},
    },
    Schema,
    model,
    models: {},
  };
});

// Mock next/server
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, status) => ({ json: data, status: status?.status || 200 })),
  },
}));

// Mock SheetSession using factory to avoid hoisting issues
vi.mock('@/models/SheetSession', () => {
    const mockSort = vi.fn();
    const mockFind = vi.fn(() => ({ sort: mockSort }));
    return {
        default: {
            find: mockFind,
            _mockFind: mockFind, // Expose for testing
            _mockSort: mockSort, // Expose for testing
        },
    };
});

// Mock other dependencies
vi.mock('@/lib/dbConnect', () => ({ default: vi.fn() }));

// Mock server-auth and expose the mock function
const mockGetAuthenticatedUser = vi.fn();
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: (...args: any[]) => mockGetAuthenticatedUser(...args),
}));

// Import the route
import { GET } from './route';
import SheetSession from '@/models/SheetSession';

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const response: any = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(401);
    expect(response.json).toEqual({ error: 'Unauthorized' });
    expect((SheetSession as any)._mockFind).not.toHaveBeenCalled();
  });

  it('should return user sessions if authenticated', async () => {
    // Setup mock user
    const mockUser = { _id: 'user123', email: 'test@example.com' };
    mockGetAuthenticatedUser.mockResolvedValue(mockUser);

    // Setup mock data
    const mockSessions = [
      { _id: '1', userId: 'user123', title: 'Session 1' },
    ];

    // Configure the exposed mock
    (SheetSession as any)._mockSort.mockResolvedValue(mockSessions);

    // Call the endpoint
    const response: any = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // Assert that it fetched ONLY user's sessions
    expect((SheetSession as any)._mockFind).toHaveBeenCalledWith({ userId: 'user123' });
    expect(response.json).toEqual(mockSessions);
  });
});
