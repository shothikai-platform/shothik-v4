import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
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

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({ data, status: options?.status || 200 })),
  },
}));

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should deny deletion without authentication', async () => {
    // Arrange
    (getAuthenticatedUser as any).mockResolvedValue(null); // No user

    const request = new Request('http://localhost/api/research/chat/delete_chat/chat-id', {
      method: 'DELETE',
    });
    const params = Promise.resolve({ id: 'chat-id' });

    // Act
    const response = await DELETE(request, { params });

    // Assert
    expect(response.status).toBe(401);
    expect(ResearchChat.findOneAndDelete).not.toHaveBeenCalled();
    expect(ResearchChat.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it('should deny deletion of another user\'s chat', async () => {
    // Arrange
    const user = { _id: 'user-1' };
    (getAuthenticatedUser as any).mockResolvedValue(user);

    // Mock findOneAndDelete to return null (chat not found for this user)
    (ResearchChat.findOneAndDelete as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/delete_chat/chat-id', {
      method: 'DELETE',
    });
    const params = Promise.resolve({ id: 'chat-id' });

    // Act
    const response = await DELETE(request, { params });

    // Assert
    // Verify we called findOneAndDelete with userId constraint
    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
      _id: 'chat-id',
      userId: 'user-1'
    });
    expect(response.status).toBe(404); // Or 403, but 404 is common for "not found or not accessible"
  });

  it('should allow deletion of own chat', async () => {
    // Arrange
    const user = { _id: 'user-1' };
    (getAuthenticatedUser as any).mockResolvedValue(user);

    // Mock findOneAndDelete to return the chat (success)
    (ResearchChat.findOneAndDelete as any).mockResolvedValue({ _id: 'chat-id', userId: 'user-1' });

    const request = new Request('http://localhost/api/research/chat/delete_chat/chat-id', {
      method: 'DELETE',
    });
    const params = Promise.resolve({ id: 'chat-id' });

    // Act
    const response = await DELETE(request, { params });

    // Assert
    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
      _id: 'chat-id',
      userId: 'user-1'
    });
    expect(response.status).toBe(200);
  });
});
