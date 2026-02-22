
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findByIdAndUpdate: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({ data, status: options?.status || 200 })),
  },
}));

describe('PUT /api/research/chat/update_name/[id]', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockChatId = 'chat-123';
  const mockNewName = 'Updated Chat Name';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update chat name securely ensuring user ownership', async () => {
    // Setup
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue({
      _id: mockChatId,
      name: mockNewName,
      userId: mockUser.id,
    });

    const request = new Request('http://localhost:3000/api/research/chat/update_name/' + mockChatId, {
      method: 'PUT',
      body: JSON.stringify({ name: mockNewName }),
    });

    const params = Promise.resolve({ id: mockChatId });

    // Execute
    const response = await PUT(request, { params });

    // Verify
    // 1. Should check authentication
    expect(getAuthenticatedUser).toHaveBeenCalled();

    // 2. Should use findOneAndUpdate with userId scope (SECURE)
    // currently it uses findByIdAndUpdate (INSECURE)
    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockChatId, userId: mockUser.id }, // Security check
      { name: mockNewName }, // Correct field update
      { new: true }
    );

    // 3. Should NOT use insecure findByIdAndUpdate
    expect(ResearchChat.findByIdAndUpdate).not.toHaveBeenCalled();

    // 4. Response check
    expect((response as any).status).toBe(200);
    expect((response as any).data).toEqual({
      _id: mockChatId,
      name: mockNewName,
      userId: mockUser.id,
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/research/chat/update_name/' + mockChatId, {
        method: 'PUT',
        body: JSON.stringify({ name: mockNewName }),
      });

      const params = Promise.resolve({ id: mockChatId });

      const response = await PUT(request, { params });

    expect((response as any).status).toBe(401);
    expect(ResearchChat.findOneAndUpdate).not.toHaveBeenCalled();
    expect(ResearchChat.findByIdAndUpdate).not.toHaveBeenCalled();
  });
});
