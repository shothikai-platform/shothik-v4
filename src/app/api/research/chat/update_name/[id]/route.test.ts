import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';

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
    json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
  },
}));

describe('PUT /api/research/chat/update_name/[id]', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Default mocks if needed
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'chat1' }) });

    expect(response.status).toBe(401);
    expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
  });

  it('should return 404 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    // Mock that findOneAndUpdate returns null (because userId mismatch)
    mockFindOneAndUpdate.mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'chat1' }) });

    expect(response.status).toBe(404);

    // Verify findOneAndUpdate was called with correct userId
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'chat1', userId: 'user1' },
        expect.anything(),
        expect.anything()
    );
  });

  it('should update chat name if user is authenticated and owns the chat', async () => {
    const mockUser = { _id: 'user1' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockChat = { _id: 'chat1', userId: 'user1', name: 'New Name' };
    mockFindOneAndUpdate.mockResolvedValue(mockChat);

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'chat1' }) });

    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockChat);

    // Ensure findOneAndUpdate is called with userId and correct update
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'chat1', userId: 'user1' },
        { name: 'New Name' },
        { new: true }
    );
  });
});
