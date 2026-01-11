import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

// Create a mock for findById that we can control
const mockFindById = vi.fn();
const mockFindOne = vi.fn();

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findById: (...args) => mockFindById(...args),
    findOne: (...args) => mockFindOne(...args),
  },
}));

// Mock server-auth
const mockGetAuthenticatedUser = vi.fn();
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: () => mockGetAuthenticatedUser(),
}));

describe('GET /api/research/chat/get_one_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should deny access without authentication (401)', async () => {
    // Setup: No authenticated user
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const params = Promise.resolve({ id: 'chat-123' });
    const request = new Request('http://localhost/api/research/chat/get_one_chat/chat-123');

    // Execute
    const response = await GET(request, { params });
    const data = await response.json();

    // Verify
    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockFindOne).not.toHaveBeenCalled();
  });

  it('should deny access to another users chat (404)', async () => {
    // Setup: Authenticated as User A
    mockGetAuthenticatedUser.mockResolvedValue({ _id: 'user-a' });

    // Setup: FindOne returns null because query includes userId: 'user-a' but chat has 'user-b'
    // In reality, Mongo wouldn't find it. Mongoose mock should simulate this logic or we just say "it returns null"
    // The key is that we called findOne with the correct params.
    mockFindOne.mockResolvedValue(null);

    const params = Promise.resolve({ id: 'chat-123' });
    const request = new Request('http://localhost/api/research/chat/get_one_chat/chat-123');

    // Execute
    const response = await GET(request, { params });
    const data = await response.json();

    // Verify
    expect(response.status).toBe(404);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat-123', userId: 'user-a' });
  });

  it('should allow access to own chat (200)', async () => {
    // Setup: Authenticated as User A
    mockGetAuthenticatedUser.mockResolvedValue({ _id: 'user-a' });

    // Setup: Chat belongs to User A
    const mockChat = { _id: 'chat-123', userId: 'user-a', name: 'My Chat' };
    mockFindOne.mockResolvedValue(mockChat);

    const params = Promise.resolve({ id: 'chat-123' });
    const request = new Request('http://localhost/api/research/chat/get_one_chat/chat-123');

    // Execute
    const response = await GET(request, { params });
    const data = await response.json();

    // Verify
    expect(response.status).toBe(200);
    expect(data).toEqual(mockChat);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat-123', userId: 'user-a' });
  });
});
