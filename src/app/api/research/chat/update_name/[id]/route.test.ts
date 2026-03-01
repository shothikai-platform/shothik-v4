import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
import { NextResponse } from 'next/server';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock dependencies
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({
      ...body,
      status: init?.status ?? 200,
    })),
  },
}));

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

describe('PUT /api/research/chat/update_name/[id]', () => {
  const mockChatId = 'chat123';
  const mockUserId = 'user123';
  const mockName = 'New Chat Name';

  const mockRequest = (body: any) =>
    new Request('http://localhost', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  const mockParams = {
    params: Promise.resolve({ id: mockChatId }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = mockRequest({ name: mockName });
    const response: any = await PUT(request, mockParams as any);

    expect(response.error).toBe('Unauthorized');
    expect(response.status).toBe(401);
    expect(ResearchChat.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('should return 404 if chat is not found or does not belong to user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(null);

    const request = mockRequest({ name: mockName });
    const response: any = await PUT(request, mockParams as any);

    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockChatId, userId: mockUserId },
      { name: mockName },
      { new: true }
    );
    expect(response.error).toBe('Chat not found');
    expect(response.status).toBe(404);
  });

  it('should update the chat name and return the updated chat', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });

    const mockUpdatedChat = { _id: mockChatId, userId: mockUserId, name: mockName };
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(mockUpdatedChat);

    const request = mockRequest({ name: mockName });
    const response: any = await PUT(request, mockParams as any);

    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockChatId, userId: mockUserId },
      { name: mockName },
      { new: true }
    );
    expect(response.name).toBe(mockName);
    expect(response.status).toBe(200);
  });
});
