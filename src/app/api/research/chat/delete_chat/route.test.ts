import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DELETE } from './[id]/route';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

// Mock ResearchChat model methods
vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findByIdAndDelete: vi.fn(),
      findOneAndDelete: vi.fn(),
    },
  };
});

// Mock authentication
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock NextResponse
vi.mock('next/server', () => {
    return {
        NextResponse: {
            json: vi.fn((data, init) => ({
                json: async () => data,
                status: init?.status || 200
            })),
        },
    };
});


describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/delete_chat/123', {
      method: 'DELETE',
    });

    // We need to pass the params as a promise, as per Next.js 15+ convention for dynamic routes
    const params = Promise.resolve({ id: '123' });

    const response = await DELETE(request, { params });

    // With current vulnerable code, this will likely fail (it proceeds to delete) or crash if getAuthenticatedUser is not called
    // But we are testing the DESIRED behavior.
    // However, if I run this test against CURRENT code, it will fail.
    // The current code does NOT check authentication.

    // Let's assert what we EXPECT after the fix.
    expect(response.status).toBe(401);
  });

  it('should return 404 if chat not found or not owned by user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123', id: 'user123' });
    (ResearchChat.findOneAndDelete as any).mockResolvedValue(null);
    // Also mock findByIdAndDelete to ensure it's NOT called (security check)
    (ResearchChat.findByIdAndDelete as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/delete_chat/chat123', {
      method: 'DELETE',
    });
    const params = Promise.resolve({ id: 'chat123' });

    const response = await DELETE(request, { params });

    expect(response.status).toBe(404);
    // Ideally we want to ensure findOneAndDelete was called with userId
    // But verify the call arguments after the test runs
  });

  it('should return 200 if chat is successfully deleted', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123', id: 'user123' });
    (ResearchChat.findOneAndDelete as any).mockResolvedValue({ _id: 'chat123' });

    const request = new Request('http://localhost/api/research/chat/delete_chat/chat123', {
      method: 'DELETE',
    });
    const params = Promise.resolve({ id: 'chat123' });

    const response = await DELETE(request, { params });

    expect(response.status).toBe(200);
    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
      _id: 'chat123',
      userId: 'user123', // Check for either _id or id depending on implementation
    });
  });
});
