import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';

// Mock the dependencies
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findOneAndDelete: vi.fn(),
  },
}));

// Provide a mock Request
const mockRequest = new Request('http://localhost');

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const response = await DELETE(mockRequest, { params: Promise.resolve({ id: 'chat-123' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 404 if chat is not found or user is not the owner', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      _id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
    });
    vi.mocked(ResearchChat.findOneAndDelete).mockResolvedValue(null);

    const response = await DELETE(mockRequest, { params: Promise.resolve({ id: 'chat-123' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Chat not found');
    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
      _id: 'chat-123',
      userId: 'user-123',
    });
  });

  it('should delete chat and return success if user is the owner', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-123', // Testing `user.id` fallback
      name: 'Test User',
      email: 'test@example.com',
    });
    vi.mocked(ResearchChat.findOneAndDelete).mockResolvedValue({
      _id: 'chat-123',
      userId: 'user-123',
      title: 'Test Chat',
    } as any);

    const response = await DELETE(mockRequest, { params: Promise.resolve({ id: 'chat-123' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
      _id: 'chat-123',
      userId: 'user-123',
    });
  });
});
