import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { NextResponse } from 'next/server';

// 1. Hoist the mocks before imports are evaluated
const mockGetAuthenticatedUser = vi.hoisted(() => vi.fn());
const mockFindOneAndDelete = vi.hoisted(() => vi.fn());

// 2. Mock external dependencies
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: mockGetAuthenticatedUser,
}));

vi.mock('@/lib/dbConnect', () => ({
  __esModule: true,
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findOneAndDelete: mockFindOneAndDelete,
  },
}));

// Provide a mock json method on NextResponse
vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: vi.fn((body, init) => {
        return {
          ...init,
          json: async () => body,
        };
      }),
    },
  };
});

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValueOnce(null);

    const request = new Request('http://localhost');
    const params = Promise.resolve({ id: 'chat123' });

    const response = await DELETE(request, { params }) as any;

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
    expect(mockFindOneAndDelete).not.toHaveBeenCalled();
  });

  it('should return 404 if chat is not found or user is not the owner', async () => {
    mockGetAuthenticatedUser.mockResolvedValueOnce({ _id: 'user123', name: 'Test', email: 'test@example.com' });
    mockFindOneAndDelete.mockResolvedValueOnce(null);

    const request = new Request('http://localhost');
    const params = Promise.resolve({ id: 'chat123' });

    const response = await DELETE(request, { params }) as any;

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Chat not found');
    expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: 'chat123', userId: 'user123' });
  });

  it('should return success true if chat is successfully deleted', async () => {
    mockGetAuthenticatedUser.mockResolvedValueOnce({ _id: 'user123', name: 'Test', email: 'test@example.com' });
    mockFindOneAndDelete.mockResolvedValueOnce({ _id: 'chat123', userId: 'user123', name: 'Research' });

    const request = new Request('http://localhost');
    const params = Promise.resolve({ id: 'chat123' });

    const response = await DELETE(request, { params }) as any;

    expect(response.status).toBeUndefined(); // NextResponse.json default status is undefined in our mock (meaning 200)
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: 'chat123', userId: 'user123' });
  });
});
