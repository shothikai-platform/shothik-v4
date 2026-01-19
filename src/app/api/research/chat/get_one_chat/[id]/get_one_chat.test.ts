import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import ResearchChat from '@/models/ResearchChat';
import { NextResponse } from 'next/server';
import * as serverAuth from '@/lib/server-auth';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findById: vi.fn(),
      findOne: vi.fn(),
    },
  };
});

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({ body, init })),
  },
}));

describe('GET /api/research/chat/get_one_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should deny access if user is not authenticated', async () => {
    // Setup: No authenticated user
    (serverAuth.getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/get_one_chat/123');
    const params = Promise.resolve({ id: '123' });

    const response = await GET(request, { params });

    expect(serverAuth.getAuthenticatedUser).toHaveBeenCalled();
    expect(response.init?.status).toBe(401);
  });

  it('should deny access if user does not own the chat (returns 404)', async () => {
    // Setup: User is authenticated as 'user1'
    (serverAuth.getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    // Setup: findOne returns null (because { _id: '123', userId: 'user1' } matches nothing)
    (ResearchChat.findOne as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/get_one_chat/123');
    const params = Promise.resolve({ id: '123' });

    const response = await GET(request, { params });

    expect(ResearchChat.findOne).toHaveBeenCalledWith({ _id: '123', userId: 'user1' });
    expect(response.init?.status).toBe(404);
  });

  it('should allow access if user owns the chat', async () => {
    // Setup: User is authenticated as 'user1'
    (serverAuth.getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    const mockChat = {
        _id: '123',
        userId: 'user1',
        name: 'My Chat'
    };

    // Setup: findOne returns the chat
    (ResearchChat.findOne as any).mockResolvedValue(mockChat);

    const request = new Request('http://localhost/api/research/chat/get_one_chat/123');
    const params = Promise.resolve({ id: '123' });

    const response = await GET(request, { params });

    expect(ResearchChat.findOne).toHaveBeenCalledWith({ _id: '123', userId: 'user1' });
    expect(response.body).toEqual(mockChat);
    // NextResponse.json defaults to 200, so init might be undefined or contain status 200 depending on mock
    // My mock returns { body, init }, so if status isn't passed, init is undefined
    expect(response.init?.status).toBeUndefined();
  });
});
