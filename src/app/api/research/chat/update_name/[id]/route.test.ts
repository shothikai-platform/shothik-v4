import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
import { NextResponse } from 'next/server';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock NextResponse
vi.mock('next/server', () => {
  const mockJson = vi.fn((data, init) => {
    return {
      status: init?.status || 200,
      json: async () => data,
    };
  });
  return {
    NextResponse: {
      json: mockJson,
    },
  };
});

describe('PUT /api/research/chat/update_name/[id]', () => {
  const mockChatId = 'chat123';
  const mockUserId = 'user123';
  const mockNewName = 'Updated Chat Name';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockRequest = (body: any) => {
    return {
      json: async () => body,
    } as unknown as Request;
  };

  it('should return 401 if user is not authenticated', async () => {
    // Arrange
    (getAuthenticatedUser as any).mockResolvedValue(null);
    const req = createMockRequest({ name: mockNewName });
    const params = Promise.resolve({ id: mockChatId });

    // Act
    const response: any = await PUT(req, { params });

    // Assert
    expect(response.status).toBe(401);
    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 });
    expect(ResearchChat.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('should prevent IDOR by checking userId and return 404 if chat not found or unauthorized', async () => {
    // Arrange
    (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(null);

    const req = createMockRequest({ name: mockNewName });
    const params = Promise.resolve({ id: mockChatId });

    // Act
    const response: any = await PUT(req, { params });

    // Assert
    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockChatId, userId: mockUserId },
      { name: mockNewName },
      { new: true }
    );
    expect(response.status).toBe(404);
    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Chat not found or unauthorized' }, { status: 404 });
  });

  it('should update chat name successfully and return updated chat', async () => {
    // Arrange
    const mockUpdatedChat = { _id: mockChatId, userId: mockUserId, name: mockNewName };
    (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(mockUpdatedChat);

    const req = createMockRequest({ name: mockNewName });
    const params = Promise.resolve({ id: mockChatId });

    // Act
    const response: any = await PUT(req, { params });
    const data = await response.json();

    // Assert
    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockChatId, userId: mockUserId },
      { name: mockNewName }, // Important: ensure name maps to name, not title
      { new: true }
    );
    expect(response.status).toBe(200);
    expect(data).toEqual(mockUpdatedChat);
  });

  it('should handle user object with id instead of _id', async () => {
    // Arrange
    const mockUpdatedChat = { _id: mockChatId, userId: mockUserId, name: mockNewName };
    // Provide id instead of _id to test the fallback
    (getAuthenticatedUser as any).mockResolvedValue({ id: mockUserId });
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(mockUpdatedChat);

    const req = createMockRequest({ name: mockNewName });
    const params = Promise.resolve({ id: mockChatId });

    // Act
    await PUT(req, { params });

    // Assert
    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockChatId, userId: mockUserId },
      { name: mockNewName },
      { new: true }
    );
  });

  it('should handle unexpected errors gracefully', async () => {
    // Arrange
    (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });
    (ResearchChat.findOneAndUpdate as any).mockRejectedValue(new Error('DB Error'));

    const req = createMockRequest({ name: mockNewName });
    const params = Promise.resolve({ id: mockChatId });

    // Act
    const response: any = await PUT(req, { params });

    // Assert
    expect(response.status).toBe(500);
    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Failed' }, { status: 500 });
  });
});
