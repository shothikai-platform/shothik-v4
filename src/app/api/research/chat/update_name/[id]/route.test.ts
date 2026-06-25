import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindByIdAndUpdate, mockFindOneAndUpdate } = vi.hoisted(() => {
  return {
    mockFindByIdAndUpdate: vi.fn(),
    mockFindOneAndUpdate: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findByIdAndUpdate: mockFindByIdAndUpdate,
      findOneAndUpdate: mockFindOneAndUpdate,
    },
  };
});

// Mock NextResponse
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

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('PUT /api/research/chat/update_name/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const req = new Request('http://localhost/api/research/chat/update_name/123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
    });
    const response = await PUT(req, { params: Promise.resolve({ id: '123' }) });

    expect(response.status).toBe(401);
  });

  it('should prevent IDOR by checking userId', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOneAndUpdate.mockResolvedValue({ _id: '123', name: 'New Name', userId: 'user123' });

    const req = new Request('http://localhost/api/research/chat/update_name/123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
    });
    await PUT(req, { params: Promise.resolve({ id: '123' }) });

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: '123', userId: 'user123' },
        expect.objectContaining({ name: 'New Name' }),
        { new: true }
    );
  });

  it('should use the correct field name "name" instead of "title"', async () => {
     const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOneAndUpdate.mockResolvedValue({ _id: '123', name: 'New Name', userId: 'user123' });

    const req = new Request('http://localhost/api/research/chat/update_name/123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
    });
    await PUT(req, { params: Promise.resolve({ id: '123' }) });

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        expect.anything(),
        { name: 'New Name' },
        expect.anything()
    );
  });
});
