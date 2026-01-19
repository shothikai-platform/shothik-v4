
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';
import ResearchChat from '@/models/ResearchChat';

// Mock getAuthenticatedUser
const mockGetAuthenticatedUser = vi.hoisted(() => vi.fn());

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: mockGetAuthenticatedUser,
}));

// Mock dbConnect
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

// Mock Mongoose model
vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findOne: vi.fn(),
    },
  };
});

describe('GET /api/research/chat/get_one_chat/[id]', () => {
  const mockParams = Promise.resolve({ id: 'chat-123' });
  const mockRequest = {} as Request;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const response = await GET(mockRequest, { params: mockParams });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 404 if chat is not found or does not belong to user', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ _id: 'user-1', name: 'Test User' });
    (ResearchChat.findOne as any).mockResolvedValue(null);

    const response = await GET(mockRequest, { params: mockParams });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Chat not found');

    // Verify security check: must query by both _id and userId
    expect(ResearchChat.findOne).toHaveBeenCalledWith({
      _id: 'chat-123',
      userId: 'user-1'
    });
  });

  it('should return chat if found and belongs to user', async () => {
    const mockChat = { _id: 'chat-123', userId: 'user-1', name: 'My Chat' };
    mockGetAuthenticatedUser.mockResolvedValue({ _id: 'user-1', name: 'Test User' });
    (ResearchChat.findOne as any).mockResolvedValue(mockChat);

    const response = await GET(mockRequest, { params: mockParams });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockChat);

    expect(ResearchChat.findOne).toHaveBeenCalledWith({
        _id: 'chat-123',
        userId: 'user-1'
      });
  });
});
