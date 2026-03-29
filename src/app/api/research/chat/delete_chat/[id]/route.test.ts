import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';

vi.mock('@/lib/dbConnect', () => ({ default: vi.fn() }));
vi.mock('@/lib/server-auth', () => ({ getAuthenticatedUser: vi.fn() }));

const { mockFindByIdAndDelete, mockFindOneAndDelete } = vi.hoisted(() => ({
  mockFindByIdAndDelete: vi.fn(),
  mockFindOneAndDelete: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findByIdAndDelete: mockFindByIdAndDelete,
    findOneAndDelete: mockFindOneAndDelete,
  },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);
    const response = await DELETE(new Request('http://localhost/api/research/chat/delete_chat/chat1'), { params: Promise.resolve({ id: 'chat1' }) });
    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });
    mockFindOneAndDelete.mockResolvedValue(null);
    const response = await DELETE(new Request('http://localhost/api/research/chat/delete_chat/chat1'), { params: Promise.resolve({ id: 'chat1' }) });
    expect(response.status).toBe(404);
  });
});
