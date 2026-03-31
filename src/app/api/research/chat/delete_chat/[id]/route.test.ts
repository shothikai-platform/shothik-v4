
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findOneAndDelete: vi.fn(),
  },
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
        data,
        options,
        status: options?.status || 200,
        json: async () => data
    })),
  },
}));

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat123'),
        { params: Promise.resolve({ id: 'chat123' }) }
    );

    expect(response.status).toBe(401);
  });

  it('should delete chat if user is owner', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    (ResearchChat.findOneAndDelete as any).mockResolvedValue({ _id: 'chat123' });

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat123'),
        { params: Promise.resolve({ id: 'chat123' }) }
    );

    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
        _id: 'chat123',
        userId: 'user123'
    });
    expect(response.status).toBe(200);
  });

  it('should return 404 if chat not found or not owned by user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    (ResearchChat.findOneAndDelete as any).mockResolvedValue(null);

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat123'),
        { params: Promise.resolve({ id: 'chat123' }) }
    );

    expect(response.status).toBe(404);
  });
});
