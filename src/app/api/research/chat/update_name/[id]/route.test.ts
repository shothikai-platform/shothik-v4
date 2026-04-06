import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

// Mock ResearchChat model
const mockFindOneAndUpdate = vi.fn();
vi.mock('@/models/ResearchChat', () => ({
  default: {
    findOneAndUpdate: (...args: any[]) => mockFindOneAndUpdate(...args),
  },
}));

// Mock server auth
const mockGetAuthenticatedUser = vi.fn();
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: () => mockGetAuthenticatedUser(),
}));

describe('PUT /api/research/chat/update_name/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValueOnce(null);

    const request = new Request('http://localhost', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'chat-123' }) });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should update chat using findOneAndUpdate with userId constraint', async () => {
    const mockUser = { _id: 'user-123', email: 'test@example.com', name: 'Test' };
    mockGetAuthenticatedUser.mockResolvedValueOnce(mockUser);

    const mockChat = { _id: 'chat-123', title: 'New Name' };
    mockFindOneAndUpdate.mockResolvedValueOnce(mockChat);

    const request = new Request('http://localhost', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'chat-123' }) });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockChat);

    // Verify findOneAndUpdate was called correctly to prevent IDOR
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat-123', userId: 'user-123' },
      { title: 'New Name' },
      { new: true }
    );
  });

  it('should return 404 if chat is not found (or does not belong to user)', async () => {
    const mockUser = { _id: 'user-123', email: 'test@example.com', name: 'Test' };
    mockGetAuthenticatedUser.mockResolvedValueOnce(mockUser);

    mockFindOneAndUpdate.mockResolvedValueOnce(null);

    const request = new Request('http://localhost', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'chat-123' }) });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Chat not found');
  });
});
