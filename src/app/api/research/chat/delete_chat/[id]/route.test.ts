import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

// Mock ResearchChat model
const mockFindOneAndDelete = vi.fn();
vi.mock('@/models/ResearchChat', () => ({
  default: {
    findOneAndDelete: (...args: any[]) => mockFindOneAndDelete(...args),
  },
}));

// Mock server auth
const mockGetAuthenticatedUser = vi.fn();
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: () => mockGetAuthenticatedUser(),
}));

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValueOnce(null);

    const request = new Request('http://localhost', { method: 'DELETE' });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'chat-123' }) });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should delete chat using findOneAndDelete with userId constraint', async () => {
    const mockUser = { _id: 'user-123', email: 'test@example.com', name: 'Test' };
    mockGetAuthenticatedUser.mockResolvedValueOnce(mockUser);

    const mockChat = { _id: 'chat-123', title: 'Old Name' };
    mockFindOneAndDelete.mockResolvedValueOnce(mockChat);

    const request = new Request('http://localhost', { method: 'DELETE' });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'chat-123' }) });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);

    // Verify findOneAndDelete was called correctly to prevent IDOR
    expect(mockFindOneAndDelete).toHaveBeenCalledWith(
      { _id: 'chat-123', userId: 'user-123' }
    );
  });

  it('should return 404 if chat is not found (or does not belong to user)', async () => {
    const mockUser = { _id: 'user-123', email: 'test@example.com', name: 'Test' };
    mockGetAuthenticatedUser.mockResolvedValueOnce(mockUser);

    mockFindOneAndDelete.mockResolvedValueOnce(null);

    const request = new Request('http://localhost', { method: 'DELETE' });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'chat-123' }) });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Chat not found');
  });
});
