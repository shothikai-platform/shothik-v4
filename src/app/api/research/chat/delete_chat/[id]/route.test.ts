import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DELETE } from './route';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findByIdAndDelete: vi.fn(),
    findOneAndDelete: vi.fn(),
  },
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock NextResponse
vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: (body: any, init?: any) => {
        return {
          json: async () => body,
          status: init?.status || 200,
        };
      },
    },
  };
});

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    // Mock no user
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/delete_chat/123', {
      method: 'DELETE',
    });
    const params = Promise.resolve({ id: '123' });

    const response = await DELETE(request, { params });

    // EXPECTED BEHAVIOR AFTER FIX
    // Currently, this might fail (return 200 or 404) because auth check is missing.
    // I will write the test expecting the FIX.
    expect(response.status).toBe(401);
  });

  it('should return 404 if chat is not found or does not belong to user', async () => {
    // Mock user
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    // Mock findOneAndDelete to return null (not found or not owned)
    (ResearchChat.findOneAndDelete as any).mockResolvedValue(null);
    // For current implementation (findByIdAndDelete), it might find it if we don't mock it to fail
    (ResearchChat.findByIdAndDelete as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/delete_chat/123', {
      method: 'DELETE',
    });
    const params = Promise.resolve({ id: '123' });

    const response = await DELETE(request, { params });

    expect(response.status).toBe(404);
  });

  it('should return 200 if chat is deleted successfully', async () => {
    // Mock user
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    // Mock successful deletion
    (ResearchChat.findOneAndDelete as any).mockResolvedValue({ _id: '123' });
    (ResearchChat.findByIdAndDelete as any).mockResolvedValue({ _id: '123' });

    const request = new Request('http://localhost/api/research/chat/delete_chat/123', {
      method: 'DELETE',
    });
    const params = Promise.resolve({ id: '123' });

    const response = await DELETE(request, { params });

    expect(response.status).toBe(200);
    // Verify that the SECURE method is called (after fix)
    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({ _id: '123', userId: 'user1' });
  });
});
