
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
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
    findOneAndUpdate: vi.fn(),
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

describe('PUT /api/research/chat/update_name/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat123', {
            method: 'PUT',
            body: JSON.stringify({ name: 'New Name' })
        }),
        { params: Promise.resolve({ id: 'chat123' }) }
    );

    expect(response.status).toBe(401);
  });

  it('should update chat name if user is owner', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue({ _id: 'chat123', name: 'New Name' });

    const response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat123', {
            method: 'PUT',
            body: JSON.stringify({ name: 'New Name' })
        }),
        { params: Promise.resolve({ id: 'chat123' }) }
    );

    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'chat123', userId: 'user123' },
        { name: 'New Name' },
        { new: true }
    );
    expect(response.status).toBe(200);
  });

  it('should return 404 if chat not found or not owned by user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(null);

    const response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat123', {
            method: 'PUT',
            body: JSON.stringify({ name: 'New Name' })
        }),
        { params: Promise.resolve({ id: 'chat123' }) }
    );

    expect(response.status).toBe(404);
  });
});
