import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock Mongoose model
const { mockFindByIdAndDelete, mockFindOneAndDelete } = vi.hoisted(() => {
  return {
    mockFindByIdAndDelete: vi.fn(),
    mockFindOneAndDelete: vi.fn(),
  };
});

vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findByIdAndDelete: mockFindByIdAndDelete,
      findOneAndDelete: mockFindOneAndDelete,
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
  },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);
    const req = new Request('http://localhost/api/research/chat/delete_chat/123', { method: 'DELETE' });
    const params = Promise.resolve({ id: '123' });

    const response = await DELETE(req, { params });

    expect(response.status).toBe(401);
  });

  it('should delete chat if user is authenticated and owns the chat', async () => {
    const mockUser = { _id: 'user123', id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOneAndDelete.mockResolvedValue({ _id: '123' }); // Found and deleted

    const req = new Request('http://localhost/api/research/chat/delete_chat/123', { method: 'DELETE' });
    const params = Promise.resolve({ id: '123' });

    const response = await DELETE(req, { params });

    expect(response.status).toBe(200);
    expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: '123', userId: 'user123' });
  });

  it('should return 404 if chat not found or not owned', async () => {
    const mockUser = { _id: 'user123', id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOneAndDelete.mockResolvedValue(null); // Not found

    const req = new Request('http://localhost/api/research/chat/delete_chat/123', { method: 'DELETE' });
    const params = Promise.resolve({ id: '123' });

    const response = await DELETE(req, { params });

    expect(response.status).toBe(404);
  });
});
