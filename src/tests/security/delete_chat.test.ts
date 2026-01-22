import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from '@/app/api/research/chat/delete_chat/[id]/route';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock dependencies
const mockFindOneAndDelete = vi.fn();
const mockFindByIdAndDelete = vi.fn();

// Hoisted mock for ResearchChat
vi.mock('@/models/ResearchChat', () => ({
  default: {
    findOneAndDelete: (...args: any[]) => mockFindOneAndDelete(...args),
    findByIdAndDelete: (...args: any[]) => mockFindByIdAndDelete(...args),
  },
}));

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

// Mock authentication
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({ body, init })),
  },
}));

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use findOneAndDelete with userId to prevent IDOR', async () => {
    // Setup authenticated user
    const mockUser = { _id: 'user123', email: 'test@example.com', name: 'Test User' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Mock successful deletion response from DB
    mockFindOneAndDelete.mockResolvedValue({ _id: 'chat123' });
    mockFindByIdAndDelete.mockResolvedValue({ _id: 'chat123' });

    const request = {} as Request;
    const params = Promise.resolve({ id: 'chat123' });

    await DELETE(request, { params });

    // Check behavior
    const wasSecureCall = mockFindOneAndDelete.mock.calls.some(call =>
      call[0]._id === 'chat123' && (call[0].userId === 'user123' || call[0].userId === mockUser._id)
    );

    const wasInsecureCall = mockFindByIdAndDelete.mock.calls.length > 0;

    if (wasInsecureCall) {
      console.log('⚠️  VULNERABILITY DETECTED: Code used findByIdAndDelete (IDOR risk)');
    }

    if (!wasSecureCall && !wasInsecureCall) {
        // Maybe it used findOneAndDelete but with wrong params?
         console.log('⚠️  Code called findOneAndDelete but maybe arguments were wrong:', mockFindOneAndDelete.mock.calls);
    }

    // Assert that we used the secure method with userId
    expect(mockFindOneAndDelete).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: 'chat123',
        userId: 'user123'
      })
    );
  });
});
